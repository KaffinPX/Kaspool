const stylePrefix = '\u001b['
const resetCode = '\u001b[0m'

export const codes = {
  white: 1,
  black: 30,
  blue: 34,
  pink: 35,
  cyan: 36,
  red: 31,
  redLight: 91,
  green: 32,
  greenLight: 92,
  yellow: 33,
  yellowLight: 93,
  gray: 90,
  grayLight: 37,
  bgRed: 41,
  bgRedLight: 101,
  bgGreen: 42,
  bgGreenLight: 102,
  bgYellow: 43,
  bgYellowLight: 103,
  bgBlue: 44,
  bgLightBlue: 104,
  bgPink: 45,
  bgPinkLight: 105,
  bgCyan: 46,
  bgCyanLight: 106,
  bgGray: 100,
  bgGrayLight: 47,
  bgWhite: 107,
  underline: 4,
  inverse: 7
}

export function stylize (code: number, text: string) {
  if (!Object.values(codes).includes(code)) throw Error('Invalid style code.')

  return `${stylePrefix}${code}m${text}${resetCode}`
}

export function getReadableDate () {
  return (new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).split(' ').join('-')
}

export function getReadableTime () {
  return (new Date()).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
}
