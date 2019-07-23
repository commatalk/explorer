const RpcClient         = require('bitcoind-rpc-bltg-chainos');
const bitcore           = require('bitcore-lib-bltg-chainos');
const gateWay           = require('../blockchain/gateWay');

const rpcClient = new RpcClient({
  protocol: process.env.COMMA_WALLET_RPC_PROTOCOL,
  user: process.env.COMMA_WALLET_RPC_USER,
  pass: process.env.COMMA_WALLET_RPC_PASSWORD,
  host: process.env.COMMA_WALLET_RPC_HOST,
  port: process.env.COMMA_WALLET_RPC_PORT,
});

class CommaGateway extends gateWay{
  constructor() {
    super();
  }
  
  getNetwork () {
    return process.env.COMMA_NETWORK;
  }

  getLib () {
    return bitcore;
  }

  /**
   * Get RPC client to connect to a full node
   */
  getRPCClient () {
    return rpcClient;
  }


}

module.exports = CommaGateway
