require('dotenv').config();


var sleep = require('sleep');
var bitcoin = require('bitcoin');

var client = new bitcoin.Client({
  host: 'localhost',
  port: 14521,
  user: 'dash',
  pass: 'local321'
});

var mongojs	 = require('mongojs');
var db = mongojs('localhost/comma');
var mgBlock = db.collection('block');
var mgTransaction = db.collection('transaction');


/*---------------SCAN BLOCK-----------------*/
function updateTransactionByBlockHash(hash ){

	/*console.log(hash);*/
	client.getBlock(hash, function(err, dataBlock){	
		
		if(err){
			return console.error("ERR when call function getBlock, Maybe RPC overload");
		}

		mgBlock.update({hash: dataBlock.hash, height: dataBlock.height},dataBlock,{upsert: true});

		dataBlock.tx.forEach(function(element,index){

			client.getRawTransaction(element, true, function(err, rawTransaction){

		        if(err) {
		        	console.error("ERR when call function getRawTransaction, Maybe RPC overload", element);
		            // var dataerr = [];
		            // sleep.sleep(5);
		            // dataerr.push(element);
		            // updateTransaction(dataerr);
		            return ;
		        }


				try {

					var isCoinBase = false;
					if(rawTransaction.vin[0].coinbase){
						isCoinBase = true;
					}


					for(var i = 0, len = rawTransaction.vout.length; i < len; i++ ){
						if(rawTransaction.vout[i].scriptPubKey.addresses) {

							let transaction = {
								type: "out",
								voutindex: i,
								txid: element,
								value: rawTransaction.vout[i].value,
								blockIndex: dataBlock.height,
								blockhash: dataBlock.hash,
								address: rawTransaction.vout[i].scriptPubKey.addresses[0],
								spent: false,
								isCoinBase: isCoinBase,
								blockhash: rawTransaction.blockhash,
								time: rawTransaction.time,
								blockTime: rawTransaction.blockTime
							}

							mgTransaction.update(transaction,transaction,{upsert: true});
							console.log(element);

						}
					}


					for (var i = 0, len = rawTransaction.vin.length; i < len; i++) {

						if(rawTransaction.vin[i].txid) {
							console.log(element + "-----------"+ element + " "+ i)
							mgTransaction.update({txid: rawTransaction.vin[i].txid}, {$set: {spent: true}}, {upsert: false});
						}
					}

				} catch(ex) {
					console.log("Error on transaction", element);
				}
	          
        	});


		})


		if(dataBlock.nextblockhash){
			updateTransactionByBlockHash(dataBlock.nextblockhash);
		} else {
			sleep.sleep(5);
			updateTransactionByBlockHash(dataBlock.hash);
		}
		
	});

}
		
function scanBlock(blockBegin){

	client.getBlockHash(blockBegin, function(err, hash){
		
		if(err){
			return console.error("ERR when call function getBlockHash, Maybe RPC overload");
		}

		updateTransactionByBlockHash(hash);
	})
}


/*---------------END SCAN BLOCK-----------------*/


/*-----------MAIN----------------*/
scanBlock(0);
