const lmdb = require('lmdb')

const Storage = require('./storage')

module.exports = class Provider {
  constructor (config) {
    this.database = lmdb.open({
      path: config.path
    })
  }

  open (identifier) {
    return new Storage(this.database.openDB(identifier))
  }
}
