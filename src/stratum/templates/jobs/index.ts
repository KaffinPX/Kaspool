export default class Jobs {
  private jobs: Map<string, string> = new Map()
  private lastId = 0

  getHash (id: string) {
   return this.jobs.get(id)
  }

  deriveId (hash: string) {
    const id = this.lastId == 99 ? 1 : (this.lastId + 1)

    this.jobs.set(id.toString(), hash)
    this.lastId = id

    return id.toString()
  }

  expireNext () {
    this.jobs.delete(this.jobs.entries().next().value[0])
  }
}