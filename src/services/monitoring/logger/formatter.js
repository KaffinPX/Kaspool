const styles = require('./styles')

const stylePrefix = '\u001b['
const resetStyle = '\u001b[0m'

module.exports = class Formatter {
  stylize (style, text) {
    if (!Object.values(styles).includes(style)) throw Error('Invalid style code.')

    return `${stylePrefix}${style}m${text}${resetStyle}`
  }

  getReadableDate () {
    return (new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).split(' ').join('-')
  }

  getReadableTime () {
    return (new Date()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  }
}
