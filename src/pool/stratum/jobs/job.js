const { State, calculateDifficulty } = require('../../../kaspa/wasm/kaspa_wasm')

module.exports = class Job {
  constructor (id, template) {
    this.id = id
    this.template = template
    this.state = new State(this.template)
    this.stratum = this.calculateStratum()
  }

  calculateStratum () {
    const preHashU64s = []
  
    for (let i = 0; i < 4; i++) {
      const result = Buffer.from([...Buffer.from(this.state.prePowHash, 'hex').slice(i * 8, i * 8 + 8)].reverse())
      
      preHashU64s.push(BigInt(`0x${result.toString('hex')}`))
    }
  
    return preHashU64s
  }

  async checkSubmission (difficulty, work) {
    const validity = this.state.checkPow(work)

    return [ validity[1] <= calculateDifficulty(difficulty), validity[0] ]
  }
}
