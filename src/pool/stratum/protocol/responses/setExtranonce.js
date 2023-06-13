module.exports = class SetExtranonce {
  constructor (nonce) {
    this.id = undefined
    this.nonce = nonce
    this.reservedBytes = 6
  }

  toJSON () {
    return {
      id: this.id,
      method: 'set_extranonce',
      params: [this.nonce, this.reservedBytes]
    }
  }
}
