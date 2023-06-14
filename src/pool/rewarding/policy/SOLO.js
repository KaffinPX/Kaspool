const { EventEmitter } = require('events')

module.exports = class Policy extends EventEmitter {
  constructor ({ fee }) {
    super()

    this.fee = fee
    this.rewardQueue = []
  }

  async addShare (difficulty, miner, isBlock) {
    if (isBlock) {
      this.waitingCoinbases.push(miner)

      this.emit('snapshot', this.rewardQueue)
    }
  }

  async getFinalizedRewards (amount) {
    const priotrizedMiner = this.rewardQueue.shift()
    const chargedAmount = (amount * 100n) / BigInt(fee)

    return [{
      miner: priotrizedMiner,
      amount: chargedAmount
    }]
  }
}
