export default class Jobs {
  private jobs: Map<string, string> = new Map()

  getHash (id: string) {
   return this.jobs.get(id)
  }

  deriveId (hash: string): string {
    const id = crypto.getRandomValues(Buffer.alloc(2)).toString('hex')

    if (this.jobs.has(id)) {
      return this.deriveId(hash)
    }

    this.jobs.set(id, hash)
    return id
  }

  expireNext () {
    this.jobs.delete(this.jobs.entries().next().value[0])
  }
}
