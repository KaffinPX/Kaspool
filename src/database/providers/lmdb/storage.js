module.exports = class Storage {
  constructor (provider) {
    this.provider = provider
  }

  async put (identifier, key) {
    return await this.provider.put(identifier, key)
  }

  async get (identifier) {
    return this.provider.get(identifier)
  }
}
