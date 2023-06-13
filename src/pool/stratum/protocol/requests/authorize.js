module.exports = class Authorize {
  constructor (id, workerName) {
    this.id = id
    this.workerName = workerName
  }

  static fromStratum (packet) {
    const event = new this(packet.id, packet.params[0])

    return event
  }
}
