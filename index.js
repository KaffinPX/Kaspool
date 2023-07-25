const Kaspa = require('./src/kaspa')
const Wallet = require('./src/kaspa/wallet')
const Database = require(`./src/database`)
const Pool = require('./src/pool')

const RPC = require('./src/services/rpc')
const Logger = require('./src/services/monitoring')

const config = require('./config.json')

const database = new Database(config.services.database)

const kaspa = new Kaspa(config.kaspa.nodeAddress, () => {
  const wallet = new Wallet(kaspa.networkType, config.kaspa.wallet.mnemonics, () => {
    const pool = new Pool(kaspa, wallet, database, config.pool)
    
    new RPC(config.services.RPC.port, pool)
    new Logger()
  })
})
