globalThis.WebSocket = require('isomorphic-ws')

const { RpcClient, Encoding, Address, NetworkType } = require('./wasm/kaspa_wasm')

module.exports = class Kaspa {
  constructor (nodeAddress, readyCallback) {
    this.rpc = new RpcClient(Encoding.Borsh, nodeAddress)

    this.rpc.connect().then(async () => {
      const nodeInfo = await this.rpc.getInfo()
      if (nodeInfo.isSynced === false) throw Error('Node is not synchronized.')

      const networkInfo = await this.rpc.getBlockDagInfo()
      this.networkType = NetworkType[networkInfo.network.networkType]

      readyCallback()
    })
  }

  async getBlockDagInfo () {
    return await this.rpc.getBlockDagInfo()
  }

  async getBlock (hash) {
    return (await this.rpc.getBlock({
      hash, 
      includeTransactions: true
    })).block
  }

  async submitBlock (block) {
    return await this.rpc.submitBlock({
      block, 
      allowNonDAABlocks: false
    })
  }

  async getVirtualChain (hash) {
    return await this.rpc.getVirtualChainFromBlock({
      startHash: hash,
      includeAcceptedTransactionIds: false
    })
  }

  async subscribeNewBlockTemplate (notifyCallback) {
    if (typeof notifyCallback !== 'function') throw Error('Invalid parameters.')

    await this.rpc.notify(async () => {
      await notifyCallback()
    })

    await this.rpc.subscribeNewBlockTemplate()
  }

  async getBlockTemplate (coinbaseAddress, message) {
    if (coinbaseAddress instanceof Address === 'false' || typeof message !== 'string') throw Error('Invalid parameters.')

    return (await this.rpc.getBlockTemplate({
      payAddress: coinbaseAddress,
      extraData: Buffer.from(message)
    })).block
  }
}
