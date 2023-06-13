const crypto = require('crypto')
const { EventEmitter } = require('events')
const { JSONB } = require('when-json-met-bigint')

const Streamer = require('./streamer')
const Difficulty = require('./difficulty')
const { responses, requests } = require('../protocol')
const { Address } = require('../../../kaspa/wasm')

module.exports = class Worker extends EventEmitter {
  constructor (socket, jobs, config) {
    super()

    this.socket = socket
    this.jobs = jobs
    this.config = config

    this.workerName = undefined
    this.nonce = undefined
    this.difficulty = undefined

    this.streamer = new Streamer()
    this.sentInteractions = 0

    this.socket.on('data', async (data) => await this.streamer.pushData(data))
    this.socket.on('error', (err) => (err))
    this.socket.on('end', () => this.emit('end'))

    this.streamer.on('activity', async (request) => { await this.handleActivity(request) })
    this.streamer.on('end', async (reason) => { await this.end() })

    this.jobs.on('new', async (job) => await this.permitJob(job))
  }

  async permitJob (job) {
    await this.submit(new responses.Notify(job.id.toString(), job.stratum, job.template.timestamp))
  }

  async handleActivity (activity) {
    const method = activity.method.replace('mining.', '').toLowerCase()
    const request = requests[method].fromStratum(activity)

    if (method === 'subscribe') {
      this.difficulty = new Difficulty(this.config.difficulty)
      this.nonce = crypto.randomBytes(2).toString('hex')

      await this.submit(new responses.SetExtranonce(this.nonce))
      await this.submit(new responses.SetDifficulty(this.difficulty.policy.difficulty))

      this.emit('subscribe')
    } else if (method === 'authorize') {
      try {
        new Address(request.workerName)
      } catch (err) { this.socket.end() }

      this.workerName = request.workerName

      await this.submit(new responses.Answer(request.id))
    } else if (method === 'submit') {
      if (typeof this.nonce === 'undefined') return await this.end('Not subscribed.')
      if (typeof this.workerName === 'undefined') return await this.end('Not authorized.')
      // TODO: If share is already submitted, tell wtf
      const job = await this.jobs.getJob(parseInt(request.templateId))
      const nonce = BigInt('0x' + request.work)
      const validity = await job.checkSubmission(this.difficulty.policy.difficulty, nonce)
      
      if (validity[0] === false) return await this.end() // Handle better soon

      this.emit('share', job.template.hash, this.difficulty, nonce, validity[1])
    }
  }

  async submit (response) {
    if (typeof response.id === 'undefined') {
      this.sentInteractions += 1

      response.id = this.sentInteractions
    }

    this.socket.write(JSONB.stringify(response.toJSON()) + '\n')
  }

  async end (reason) {
    this.socket.end()
  }
}
