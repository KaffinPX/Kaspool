module.exports = class Answer {
  constructor (id) {
    this.id = id
  }

  toJSON () {
    return {
      id: this.id,
      result: true
    }
  }
}
