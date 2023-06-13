const net = require('net')
const { EventEmitter } = require('events')

const Worker = require('./worker')
const Jobs = require('./jobs')

module.exports = class Stratum extends EventEmitter {
  constructor (templates, config) {
    super()

    this.server = net.createServer()
    this.config = config
    
    this.templates = templates
    this.jobs = new Jobs()
    this.workers = new Set()

    this.server.on('connection', (socket) => this.handleConnection(socket))
    this.server.on('listening', () => this.emit('listening'))
    this.server.on('error', (err) => this.emit('error', err))

    this.templates.on('new', async (template) => await this.jobs.createJob(template))
    this.jobs.on('expire', (job) => this.templates.remove(job.template.hash))
    
    this.server.listen(this.config.port, this.config.listenAddress)
  }

  async handleConnection (socket) {
    const worker = new Worker(socket, this.jobs, this.config.worker)
    this.workers.add(worker)

    worker.on('share', (hash, difficulty, nonce, isBlock) => {
      this.emit('share', worker.workerName, difficulty, isBlock)

      if (isBlock) {
        this.emit('block', hash, nonce)
      }
    })

    worker.once('end', () => {
      this.workers.delete(worker)
    })
  }
}