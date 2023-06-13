module.exports = {
  name: 'getStats',
  run: async ({ pool }) => {
    return {
      uptime: Math.floor(process.uptime() * 1000),
      activeWorkers: pool.stratum.workers.size,
      activeJobs: pool.stratum.jobs.jobs.size,
      cachedTemplates: pool.templates.templates.size
    }
  }
}
