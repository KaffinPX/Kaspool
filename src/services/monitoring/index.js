const Logger = require('./logger')

module.exports = class Monitor {
  constructor (modules, logLevel) {
    this.logger = new Logger()

    this.logger.log('Pool is active!')
  }
}