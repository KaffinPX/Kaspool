const { EventEmitter } = require('events')
 
const Job = require('./job')

module.exports = class Jobs extends EventEmitter {
  constructor () {
    super()

    this.jobs = new Map()
    this.lastJob = 1
  }

  async getJob (jobId) {
    return this.jobs.get(jobId)
  }

  async createJob (template) {
    const jobId = this.lastJob === 99 ? 1 : (this.lastJob + 1)
    const job = new Job(jobId, template)

    this.jobs.set(jobId, job)
    this.lastJob = jobId

    const nextJob = this.jobs.get(this.lastJob === 99 ? 1 : (this.lastJob + 1)) // idea, maybe refactor
    if (typeof nextJob !== 'undefined') {
      this.emit('expire', nextJob)
    }

    this.emit('new', job)
  }
}
