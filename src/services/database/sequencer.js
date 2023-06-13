// Possible memory leak: tickSequence can executed multiple times while it is working(Race conditions guaranteed in high usage)

module.exports = class Sequencer {
  constructor (storage) {
    this.storage = storage

    this.sequence = []
  }

  execute (key, value) {
    const transaction = { key, value }

    const promise = new Promise(resolve => {
      transaction.resolve = resolve
    })

    this.sequence.push(transaction)
    process.nextTick(() => this.tickSequence())

    return promise
  }

  async tickSequence () {
    if (this.sequence.length === 0) return

    const transaction = this.sequence.shift()

    if (typeof transaction.value === 'undefined') {
      transaction.resolve(this.storage.get(transaction.key))
    } else {
      await storage.put(transaction.key, transaction.value)
      transaction.resolve(true)
    }

    this.tickSequence()
  }
}
