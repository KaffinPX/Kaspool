const { Mnemonic, XPrv, XPublicKey, XPrivateKey, Signer, createAddress } = require('../wasm')

module.exports = class Wallet {
  constructor (networkType, mnemonics, readyCallback) {
    this.mnemonic = new Mnemonic(mnemonics)
    this.seed = this.mnemonic.toSeed('')
    this.root = (new XPrv(this.seed)).intoString('xprv')
    this.privateKey = new XPrivateKey(this.root, false, 0n)

    XPublicKey.fromMasterXPrv(this.root, false, 0n).then(async (publicKey) => {
      this.publicKey = (await publicKey.receivePubkeys(0, 1))[0]
      
      this.address = createAddress(this.publicKey, networkType).toString()
      this.signer = new Signer([ this.privateKey.changeKey(0), this.privateKey.receiveKey(0) ])

      readyCallback()
    })
  }
}
