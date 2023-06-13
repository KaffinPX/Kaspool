module.exports = class Submit {
  constructor (id, workerName, templateId, work) {
    this.id = id
    this.workerName = workerName
    this.templateId = templateId
    this.work = work
  }

  static fromStratum (packet) {
    const event = new this(packet.id, packet.params[0], packet.params[1], packet.params[2])

    return event
  }
}
