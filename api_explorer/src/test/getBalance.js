require('dotenv').config();


var sleep = require('sleep');
var bitcoin = require('bitcoin');

var client = new bitcoin.Client({
  host: 'localhost',
  port: 51475,
  user: 'user',
  pass: 'pass'
});

var mongojs	 = require('mongojs');
var db = mongojs('localhost/comma');
var mgTransaction = db.collection('transaction');

mgTransaction.find({address: "y78PNrFsAdfR475h9wpphNcS4qY7m8x54z", spent: false}).sort({txid: -1}, function(err, data){

	if (err) {
		return console.log("ERR in function find with address");
	}

	var balance = 0;

	client.getBlockCount(function(err, blockCount){
		data.forEach(function(element, index){

			if(index != 0 && element.txid == data[index-1].txid){
				console.log("111111111111111");
			 	return;
			}


			if(element.isCoinBase){
				
				if(element.blockIndex < blockCount-100){
					balance = balance + element.value;
				}

			} else {
					balance = balance + element.value;
			}
			if(index==data.length -1 ){
				console.log("1111111111ffffff");
			}
		});

		console.log(balance);
	})

})