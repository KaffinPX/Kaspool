const { EventEmitter } = require('events')

module.exports = class Streamer extends EventEmitter {
  constructor () {
    super()
    
    this.cachedBytes = []
    this.splitByte = 0x0a
  }

  async pushData (bytes) {
    for (const byte of bytes) {
      if (byte === this.splitByte) {
        const data = Buffer.from(this.cachedBytes)

        try {
          this.emit('activity', JSON.parse(data))
        } catch (err) {
          if (err instanceof SyntaxError) {
            this.emit('end', 'Invalid activity')
          } else throw err
        }

        this.cachedBytes = []
      } else {
        this.cachedBytes.push(byte)

        if (this.cachedBytes.length > 512) {
          this.emit('end', 'Activity bloat')
        }
      }
    }
  }
}
