const { EventEmitter } = require('events')

const { Header } = require('../../../kaspa/wasm')

module.exports = class Generator extends EventEmitter {
  constructor ({ kaspa, config }) {
    super()

    this.kaspa = kaspa
    this.config = config
  }

  async startGenerating (coinbaseAddress) {
    await this.kaspa.subscribeNewBlockTemplate(async () => {
      const template = await this.kaspa.getBlockTemplate(coinbaseAddress, this.config.description)

      template.header = new Header(template.header)

      this.emit('new', template)
    })
  }
}
