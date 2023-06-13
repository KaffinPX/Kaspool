const http = require('http')
const fs = require('fs')
const { EventEmitter } = require('events')

const { Response, ErrorResponse } = require('./responses')

module.exports = class Server extends EventEmitter {
  constructor (port, pool) {
    super()

    this.pool = pool
    this.endpoints = new Map()

    for (const file of fs.readdirSync('./src/services/rpc/endpoints').filter(file => file.endsWith('.js'))) {
      const endpoint = require(`./endpoints/${file}`)
      this.endpoints.set(file.replace('.js', ''), endpoint)
    }

    this.server = http.createServer((req, res) => this._handleRequest(req, res))
    this.server.listen(port)
  }

  async _handleRequest (req, res) {
    const parsedUrl = new URL(`https://pool.kaspa.org${req.url}`)

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      version: 'v1.0'
    })

    const usedEndpoint = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1]

    if (!this.endpoints.has(usedEndpoint)) return res.end('Endpoint not found.')

    const params = Object.fromEntries(parsedUrl.searchParams)

    try {
      const response = await this.endpoints.get(usedEndpoint).run({
        params: params,
        pool: this.pool
      })

      res.end(JSON.stringify(new Response(response).toJSON(), null, 2))
    } catch (err) {
      res.end(JSON.stringify(new ErrorResponse(err.message).toJSON(), null, 2))
    }
  }
}
