const async            = require('async');
const _ = require('lodash');
class gateWay {
    handleRPCCall(method, args, callback) {
        const wrappedCallback = (err, ret) => {
          if (err) {
            if (err.code && err.message) {
              console.log(`Request method=${method}, args=${JSON.stringify(args)}: ${err.message} (code: ${err.code})`);
              return callback(err);
            }
    
            return callback(err);
          }
    
          if (ret.error) {
            console.log(`Request method=${method}, args=${JSON.stringify(args)}: ${ret.error}`);
            return callback(ret.error);
          }
    
          return callback(null, ret.result);
        };
    
        const rpcClient = this.getRPCClient();
        rpcClient[method].apply(rpcClient, args.concat(wrappedCallback));
      }

      getRPCNodeInfo(callback) {

        this.handleRPCCall('getNetworkInfo', [], callback);
      }

      getNewAddress(callback) {
        this.handleRPCCall('getNewAddress', [], callback);
      }

      dumPrivateKey(address, callback) {
        this.handleRPCCall('dumpPrivKey', [address], callback);
      }

      getBalanceAddress(address, callback) {
        this.handleRPCCall('getReceivedByAddress', [address], callback);
      }

      getListUnspent(address,callback){
        this.handleRPCCall('listUnspent', [1,9999999, [address]],callback);
      }

      sendRawTransaction(rawTx, callback) {
        this.handleRPCCall('sendRawTransaction', [rawTx], callback);
      }

      getAddressUtxos(address, callback) {
        async.auto({
          listUnspent: (next) => {
            this.getListUnspent(address,next);
          },
        }, (err, ret) => {
          if(err){
            return callback(err);
          }
          
          const listUnspent = ret.listUnspent;
     
          if(listUnspent === 'undefined'){
           
            return callback(null, null);
          } else {
           const utxos = listUnspent;
             utxos.address = address;
           _.each(utxos, (utxo) => {
             if (!utxo.amountSat) {
               utxo.amountSat = utxo.amount * 100000000;
             }
           });
          
            return callback(null, utxos);
          }
     
        })
     
     
     
       }
}

module.exports = gateWay;


