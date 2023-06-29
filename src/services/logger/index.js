const colors = require('colors')

module.exports = class Logger {
  constructor () {

  }

  log (message) {
    const currentDate = new Date()

    const readableDate = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).split(' ').join('-')
    const readableTime = currentDate.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  
    console.log(`${colors.green(readableDate)} ${colors.yellow(readableTime)} ${colors.magenta('LOG')} ${message}`)
  }
}