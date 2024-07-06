import { EventEmitter } from 'events'
import { PrivateKey, UtxoProcessor, UtxoContext, type RpcClient, type IPaymentOutput, createTransactions } from "../../wasm/kaspa"

export default class Treasury extends EventEmitter {
  privateKey: PrivateKey
  address: string
  processor: UtxoProcessor
  context: UtxoContext
  fee: number
  
  constructor (rpc: RpcClient, networkId: string, privateKey: string, fee: number) {
    super()
    
    this.privateKey = new PrivateKey(privateKey)
    this.address = (this.privateKey.toAddress(networkId)).toString()
    this.processor = new UtxoProcessor({ rpc, networkId })
    this.context = new UtxoContext({ processor: this.processor })
    this.fee = fee

    this.registerProcessor()
  }
  
  async send (outputs: IPaymentOutput[]) {
    console.log(outputs)
    const { transactions, summary } = await createTransactions({
      entries: this.context,
      outputs,
      changeAddress: this.address,
      priorityFee: 0n
    })

    for (const transaction of transactions) {
      await transaction.sign([ this.privateKey ])
      await transaction.submit(this.processor.rpc)
    }

    return summary.finalTransactionId
  }
  
  private registerProcessor () {
    this.processor.addEventListener("utxo-proc-start", async () => {
      await this.context.clear()
      await this.context.trackAddresses([ this.address ])
    })

    this.processor.addEventListener('maturity', (e) => {
      // @ts-ignore
      const reward = e.data.value_as_js_bigint
      const poolFee = (reward * BigInt(this.fee * 100)) / 10000n

      this.emit('coinbase', reward - poolFee)
      this.emit('revenue', poolFee)
    })

    this.processor.start()
  }
}
