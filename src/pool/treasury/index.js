const { EventEmitter } = require('events')
const Listener = require('./listener')

const Output = require('./output')
const { TransactionOutpoint, ScriptPublicKey } = require("../../kaspa/wasm/kaspa_wasm")

module.exports = class Treasury extends EventEmitter {
  constructor (kaspa, wallet, database, config) {
    super()
    
    this.kaspa = kaspa
    this.wallet = wallet
    this.database = database
    this.config = config
    
    this.database.execute('hash').then(async hash => {
      if (typeof hash === 'undefined') {
        const networkInfo = await this.kaspa.getBlockDagInfo()
        
        hash = networkInfo.pruningPointHash
      }

      this.listener = new Listener(this.kaspa, hash, this.config.confirmationDepth)

      this.listener.on('block', async (block) => await this.checkBlock(block))
      this.listener.on('progress', async (hash) => await this.updateMilestone(hash))

      this.listener.pollBlocks()
    })
  }

  async submitBlock (template, nonce) {
    template.header.nonce = nonce

    await this.kaspa.submitBlock(template)
  }

  async checkBlock (block) {
    const minerTransaction = block.transactions[0]
    const minerReward = minerTransaction.outputs[0]

    if (minerReward.verboseData.scriptPublicKeyAddress === this.wallet.address) {
      const output = new Output(
        minerReward.verboseData.scriptPublicKeyAddress,
        new TransactionOutpoint(minerTransaction.header.hash, 0),
        minerReward.amount,
        new ScriptPublicKey(minerReward.scriptPublicKey.version, minerReward.scriptPublicKey.script),
        true
      )

      this.emit('output', output)
    }
  }

  async updateMilestone (hash) {
    await this.database.execute('hash', hash)
    await this.listener.pollBlocks()
  }
}
