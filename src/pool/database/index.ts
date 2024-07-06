import { open, type RootDatabase, type Database as SubDatabase, type Key } from 'lmdb'

type Miner = {
  balance: bigint
}

const defaultMiner: Miner = {
  balance: 0n
}

export default class Database {
  db: RootDatabase<any, Key>
  miners: SubDatabase<Miner, string>

  constructor (path: string) {
    this.db = open({
      path: path
    })
    this.miners = this.db.openDB('miners', {})
  }
  
  addBalance (address: string, balance: bigint) {
    return this.miners.transactionSync(() => {
      const miner = this.miners.get(address) ?? { ...defaultMiner }

      miner.balance += balance
      this.miners.put(address, miner)
  
      return true
    })
  }

  resetBalance (address: string) {
    return this.miners.transactionSync(() => {
      const miner = this.miners.get(address)
      if (!miner) return true

      miner.balance = 0n
      this.miners.put(address, miner)

      return true
    })
  }

  getUser (address: string) {
    return this.miners.get(address) ?? defaultMiner
  }
}