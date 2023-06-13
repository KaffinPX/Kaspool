module.exports = class Error {
  constructor (id, error) {
    this.id = id
    this.error = error
  }

  toJSON () {
    return {
      id: this.id,
      result: null,
      error: this.error
    }
  }
}
