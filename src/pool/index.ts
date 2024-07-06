import type Treasury from '../treasury'
import type Stratum from '../stratum'
import Database from './database'
import Monitoring from './monitoring'
import { sompiToKaspaStringWithSuffix, type IPaymentOutput } from '../../wasm/kaspa'

export default class Pool {
  private treasury: Treasury
  private stratum: Stratum
  private database: Database
  private monitoring: Monitoring

  constructor (treasury: Treasury, stratum: Stratum) {
    this.treasury = treasury
    this.stratum = stratum
    
    this.database = new Database('./pool.db')
    this.monitoring = new Monitoring()
 
    this.stratum.on('subscription', (ip: string, agent: string) => this.monitoring.log(`Miner ${ip} subscribed into notifications with ${agent}.`))
    this.treasury.on('coinbase', (amount: bigint) => this.distribute(amount))
    this.treasury.on('revenue', (amount: bigint) => this.revenuize(amount))

    this.monitoring.log(`Pool is active on port ${this.stratum.server.socket.port}.`)
  }

  private async revenuize (amount: bigint) {
    this.database.addBalance('me', amount)
    this.monitoring.log(`Treasury generated ${sompiToKaspaStringWithSuffix(amount, this.treasury.processor.networkId!)} revenue over last coinbase.`)
  }

  private async distribute (amount: bigint) {
    let works = new Map<string, number>()
    let totalWork = 0

    for (const contribution of this.stratum.dumpContributions()) {
      const currentWork = works.get(contribution.address) ?? 0

      works.set(contribution.address, currentWork + contribution.difficulty)
      totalWork += contribution.difficulty
    }

    this.monitoring.log(`Reward with ${sompiToKaspaStringWithSuffix(amount, this.treasury.processor.networkId!)} is getting distributed into ${works.size} miners.`)

    const scaledTotal = BigInt(totalWork * 100)
    let payments: IPaymentOutput[] = []

    for (const [ address, work ] of works) {
      const scaledWork = BigInt(work * 100)
      const share = (scaledWork / scaledTotal) * amount

      const user = this.database.getUser(address)

      if (user.balance + share >= BigInt(1e8)) {
        this.database.resetBalance(address)

        payments.push({
          address,
          amount: user.balance + share
        })
      } else {
        this.database.addBalance(address, share)
      }
    }

    if(payments.length === 0) return this.monitoring.log(`No payments found for current distribution cycle.`)
    
    const hash = await this.treasury.send(payments)
    this.monitoring.log(`Reward threshold exceeded by miner(s), individual rewards sent: ${hash}.`)
  }
}