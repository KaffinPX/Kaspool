import type { IBlock, RpcClient } from "../../../wasm/kaspa"
import { Header, PoW } from "../../../wasm/kaspa"
import Jobs from "./jobs"

export default class Templates {
  private rpc: RpcClient
  private address: string
  private templates: Map<string, [ IBlock, PoW ]> = new Map()
  private jobs: Jobs = new Jobs()
  private cacheSize: number

  constructor (rpc: RpcClient, address: string, cacheSize: number) {
    this.rpc = rpc
    this.address = address
    this.cacheSize = cacheSize
  }

  getHash (id: string) {
    return this.jobs.getHash(id)
  }
  
  getPoW (hash: string) {
    return this.templates.get(hash)?.[1]
  }

  async submit (hash: string, nonce: bigint) {
    const template = this.templates.get(hash)![0]
    const header = new Header(template.header)

    header.nonce = nonce
    const newHash = header.finalize()

    template.header.nonce = nonce
    template.header.hash = newHash
    
    const report = await this.rpc.submitBlock({
      block: template,
      allowNonDAABlocks: false
    })

    this.templates.delete(hash)
  }

  async register (callback: (id: string, hash: string, timestamp: bigint) => void) {
    this.rpc.addEventListener('new-block-template', async () => {
      const template = (await this.rpc.getBlockTemplate({
        payAddress: this.address,
        extraData: "Ghostpool"
      })).block

      if (this.templates.has(template.header.hash)) return

      const proofOfWork = new PoW(template.header)
      this.templates.set(template.header.hash, [ template, proofOfWork ])
      const id = this.jobs.deriveId(template.header.hash)

      if (this.templates.size > this.cacheSize) {
        this.templates.delete(this.templates.entries().next().value[0])
        this.jobs.expireNext()
      }

      callback(id, proofOfWork.prePoWHash, template.header.timestamp)
    })

    await this.rpc.subscribeNewBlockTemplate()
  }
}
