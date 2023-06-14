module.exports = class Output {
  constructor (address, outpoint, amount, scriptPublicKey, isCoinbase) {
    this.address = address
    this.outpoint = outpoint
    this.amount = amount
    this.scriptPublicKey = scriptPublicKey
    this.isCoinbase = isCoinbase
  }

  toKaspadJSON () {
    return {
      address: this.address,
      outpoint: this.outpoint.toJSON(),
      utxoEntry: {
        amount: this.amount,
        scriptPublicKey: this.scriptPublicKey.toJSON(),
        isCoinbase: this.isCoinbase
      }
    }
  }
}