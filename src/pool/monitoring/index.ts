import { version } from '../../../package.json'
import { stylize, codes, getReadableDate, getReadableTime } from './styling'

export default class Monitoring {
  constructor () {
    console.log(`
       .-.
      (o o)  ghostPool ${version}
      | O |   by @KaffinPX
       \\|/
    `)
  }

  log (message: string) {
    console.log(this.buildMessage(stylize(codes.bgYellowLight, 'LOG'), message))
  }

  private buildMessage (prefix: string, message: string) {
    return `${stylize(codes.green, getReadableDate())} ${stylize(codes.cyan, getReadableTime())} ${prefix} ${message}`
  }
}