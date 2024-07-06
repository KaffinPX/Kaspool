import type { Socket, TCPSocketListener } from 'bun'
import { parseMessage, type Request, type Response } from './protocol'
import { Encoding } from '../templates/jobs/encoding'

export type Worker = {
  address: string,
  name: string,
}

export type Miner = {
  difficulty: number
  workers: Map<string, Worker>
  encoding: Encoding 
  cachedBytes: string
}

type MessageCallback = (socket: Socket<Miner>, request: Request) => Promise<Response>

export default class Server {
  socket: TCPSocketListener<Miner>
  difficulty: number
  private onMessage: MessageCallback

  constructor (port: number, difficulty: number, onMessage: MessageCallback) {
    this.difficulty = difficulty
    this.onMessage = onMessage

    this.socket = Bun.listen({
      hostname: "localhost",
      port: port,
      socket: {
        open: this.onConnect.bind(this),
        data: this.onData.bind(this),
        error: (socket, error) => {
          console.log(error)
        }
      }
    })
  }

  private onConnect (socket: Socket<Miner>) {
    socket.data = {
      difficulty: this.difficulty,
      workers: new Map(),
      encoding: Encoding.BigHeader,
      cachedBytes: "",
    }
  }

  private onData (socket: Socket<Miner>, data: Buffer) {
    socket.data.cachedBytes += data

    const messages = socket.data.cachedBytes.split('\n')

    while (messages.length > 1) {
      const message = parseMessage(messages.shift()!)

      if (message) {
        this.onMessage(socket, message).then((response) => {
          socket.write(JSON.stringify(response) + '\n')
        }).catch((err) => {
          return socket.end()
        })
      } else {
        socket.end()
      }
    }

    socket.data.cachedBytes = messages[0]

    if (socket.data.cachedBytes.length > 512) {
      socket.end()
    }
  }
}
