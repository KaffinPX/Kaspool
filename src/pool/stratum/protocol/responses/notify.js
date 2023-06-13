module.exports = class Notify {
  constructor (jobId, job, timestamp) {
    this.id = undefined
    this.jobId = jobId
    this.job = job
    this.timestamp = timestamp
  }

  toJSON () {
    return {
      id: this.id,
      method: 'mining.notify',
      params: [this.jobId, this.job, this.timestamp]
    }
  }
}
