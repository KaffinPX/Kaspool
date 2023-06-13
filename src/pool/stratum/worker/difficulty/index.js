module.exports = class Difficulty {
  constructor (config) {
    this.policy = new (require(`./policy/${config.type}`))(config.policy)
  }
}