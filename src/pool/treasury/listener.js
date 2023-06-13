const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (kaspa, startHash, depth) {
    super()

    this.kaspa = kaspa
    this.currentHash = startHash
    this.depth = BigInt(depth)
    this.currentDAA = 0n
  }

  async pollBlocks () {
    const daaScore = (await this.kaspa.getBlockDagInfo()).virtualDaaScore
    const addedBlocks = (await this.kaspa.getVirtualChain(this.currentHash)).addedChainBlockHashes

    for (const hash of addedBlocks) {
      const block = await this.kaspa.getBlock(hash)

      if (block.header.daaScore + this.depth <= daaScore) {
        this.emit('block', block)

        this.currentHash = block.verboseData.hash
        this.currentDAA = block.header.daaScore
      }
    }

    this.emit('progress', this.currentHash)
  }
}