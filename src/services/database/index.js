const Sequencer = require('./sequencer')

module.exports = class Database {
  constructor (config) {
    this.provider = new (require(`./providers/${config.type}`))(config.provider)
  }

  open (identifier) {
    return new Sequencer(this.provider.open(identifier))
  }
}