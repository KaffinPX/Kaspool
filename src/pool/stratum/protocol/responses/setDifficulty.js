module.exports = class SetDifficulty {
  constructor (difficulty) {
    this.id = undefined
    this.difficulty = difficulty
  }

  toJSON () {
    return {
      id: this.id,
      method: 'mining.set_difficulty',
      params: [this.difficulty]
    }
  }
}
