const Kaspa = require('./src/kaspa')
const Wallet = require('./src/kaspa/wallet')
const Pool = require('./src/pool')

const Database = require(`./src/services/database`)
const RPC = require('./src/services/rpc')
const Logger = require('./src/services/logger')

const config = require('./config.json')

const database = new Database(config.services.database)

const kaspa = new Kaspa(config.kaspa.nodeAddress, () => {
  const wallet = new Wallet(kaspa.networkType, config.kaspa.wallet.mnemonics, () => {
    const pool = new Pool(kaspa, wallet, database, config.pool)
    const rpc = new RPC(config.services.RPC.port, pool)
    const logger = new Logger()

    logger.log('Pool is active!')
  })
})
