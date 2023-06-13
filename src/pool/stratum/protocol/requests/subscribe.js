module.exports = class Subscribe {
  constructor (id, minerInfo) {
    this.id = id
    this.minerInfo = minerInfo
  }

  static fromStratum (packet) {
    const event = new this(packet.id, packet.params[0])

    return event
  }
}
