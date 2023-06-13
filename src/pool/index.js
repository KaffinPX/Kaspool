const Templates = require('./templates')
const Stratum = require('./stratum')
const Treasury = require('./treasury')
const Rewarding = require('./rewarding')

module.exports = class Pool {
  constructor (kaspa, wallet, database, config) {
    this.kaspa = kaspa
    this.wallet = wallet
    this.database = database
    this.config = config

    this.templates = new Templates(this.kaspa, this.wallet.address, this.config.templates)
    this.stratum = new Stratum(this.templates, this.config.stratum)
    this.treasury = new Treasury(this.kaspa, this.wallet.address, this.database.open('treasury'))
    this.rewarding = new Rewarding(this.kaspa, this.wallet, this.database.open('rewarding'), this.config.rewarding)

    this.stratum.on('share', (miner, difficulty, isBlock) => this.submitShare(miner, difficulty, isBlock))
    this.stratum.on('block', (hash, nonce) => this.submitBlock(hash, nonce))

    this.treasury.on('fund', (amount, outpoint) => { this.distributeOutput(amount, outpoint) })
  }

  async distributeOutput (output) {
    this.rewarding.distribute(output)
  }

  async submitShare (miner, difficulty, isBlock) {
    this.rewarding.addShare(miner, difficulty, isBlock)
  }

  async submitBlock (hash, nonce) { // TODO: Move to treasury, just an useless detail rn
    const block = this.templates.get(hash)
    block.header.nonce = nonce

    await this.kaspa.submitBlock(block)
  }
}
