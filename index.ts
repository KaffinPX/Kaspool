import { RpcClient, Encoding, Resolver } from "./wasm/kaspa"
import Treasury from "./src/treasury"
import Templates from "./src/stratum/templates"
import Stratum from "./src/stratum"
import Pool from "./src/pool"

import config from "./config.json"

const rpc = new RpcClient({
  resolver: new Resolver(),
  encoding: Encoding.Borsh,
  networkId: 'testnet-11'
})
await rpc.connect()

const serverInfo = await rpc.getServerInfo()
if (!serverInfo.isSynced || !serverInfo.hasUtxoIndex) throw Error('Provided node is either not synchronized or lacks the UTXO index.')

const treasury = new Treasury(rpc, serverInfo.networkId, config.treasury.privateKey, config.treasury.fee)
const templates = new Templates(rpc, treasury.address, config.stratum.templates.cacheSize)
const stratum = new Stratum(templates, config.stratum.port, config.stratum.difficulty)

const pool = new Pool(treasury, stratum)
