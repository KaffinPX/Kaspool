const { UtxoSet, UtxoOrdering, PaymentOutput, PaymentOutputs, VirtualTransaction, LimitCalcStrategy, Abortable } = require('../../kaspa/wasm')

module.exports = class Rewarding {
  constructor (kaspa, wallet, database, config) {
    this.kaspa = kaspa
    this.wallet = wallet
    this.database = database
    this.policy = new (require(`./policy/${config.type}`))(config.policy)

    this.policy.on('snapshot', (data) => {}) // TODO: snapshot policy to database 
  }

  async addShare (difficulty, miner, isBlock) {
    await this.policy.addShare(difficulty, miner, isBlock)
  }

  async distribute (output) {
    const rewardSet = UtxoSet.from([ output.toKaspadJSON() ])

    const rewards = await this.policy.getFinalizedRewards(output.amount)
    let outputs = []

    for (const reward of rewards) {
      outputs.push(new PaymentOutput(reward.miner, reward.amount))
    }
    outputs = new PaymentOutputs(outputs)

    const qualifiedUTXOs = await rewardSet.select(output.amount, UtxoOrdering.AscendingAmount)

    const transaction = await new VirtualTransaction(1, 1, qualifiedUTXOs, outputs, this.wallet.address, 0n, [], LimitCalcStrategy.calculated(), new Abortable())

    transaction.sign(this.wallet.signer, true)
    await transaction.submit(this.kaspa.rpc, false)
  }
}