module.exports = class Policy {
  constructor ({ difficulty }) {
    this.difficulty = difficulty
  }

  async updateDifficulty () {
    return this.difficulty
  }
}
