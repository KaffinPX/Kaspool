const { EventEmitter } = require('events')

module.exports = class Templates extends EventEmitter {
  constructor (kaspa, coinbaseAddress, config) {
    super()

    this.kaspa = kaspa
    this.config = config

    this.templates = new Map()

    this.generator = new (require(`./generation/${this.config.generation.type}`))({
      kaspa: this.kaspa,
      config: this.config.generation
    })

    this.generator.on('new', (template) => { this.handleTemplate(template) })
    this.generator.startGenerating(coinbaseAddress)
  }

  get (hash) {
    return this.templates.get(hash)
  }

  remove (hash) {
    this.templates.delete(hash)
  }

  handleTemplate (template) {
    this.templates.set(template.header.hash, template)

    this.emit('new', template.header)
  }
}
