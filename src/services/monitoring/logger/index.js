const styles = require('./styles')
const Formatter = require('./formatter')

module.exports = class Logger {
  constructor () {
    this.formatter = new Formatter()
  }
  
  log (message) {
    console.log(this.#createMessage(this.formatter.stylize(styles.pink, 'LOG'), message))
  }

  warn (warning) {
    console.warn(this.#createMessage(this.formatter.stylize(styles.yellow, 'WARN'), warning))
  }

  error (error) {
    console.error(this.#createMessage(this.formatter.stylize(styles.red, 'ERR'), error))
  }

  #createMessage (prefix, message) {
    return `${this.formatter.stylize(styles.green, this.formatter.getReadableDate())} ${this.formatter.stylize(styles.cyan, this.formatter.getReadableTime())} ${prefix} ${message}`
  }
}