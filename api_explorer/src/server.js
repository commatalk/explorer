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
var mgTransaction = db.collection('transaction');
var mgBlock = db.collection('block');


const express = require('express')
const app = express()



/*API get balance with address*/
app.get('/api/v1/address/:address', (req, res) => {

	const address = req.params.address;
	if (!address) {
		res.status(401).send("Invalid input argument");
		return;
	}


	mgTransaction.find({address: address}).sort({txid: -1, voutindex: 1}, function(err, data){

		/* if err in function select data*/
		if (err) {
			res.status(500).send({
				success: 'false',
			    message: 'Service api fail. Please try again!'   
	        });		
			return console.log("ERR in function find with address");
		}

		var balance = 0;
		var receivedBalance = 0;
		var sentBalance = 0;
		var unconfirmedBalance = 0;	
		var txList = [];
		var txListUnconfirmed = [];

		client.getBlockCount(function(err, blockCount){

			if (err) {
				res.status(500).send({
				    success: 'false',
				    message: 'Service api fail. Please try again!'   
		        });
				return console.log("ERR in function getBlockCount");
			}

			data.forEach(function(element, index){

				receivedBalance += element.value;

				if (element.spent === false){

					if ( (element.isCoinBase && element.blockIndex > blockCount - 100) || (!element.isCoinBase && element.blockIndex > blockCount - 6) ){
						unconfirmedBalance += element.value;
						txListUnconfirmed.push([element.txid, element.value]);
					} 

				} else {
					sentBalance += element.value;
				}
				
				txList.push([element.txid, element.value]);		
			});

			

			var dataRes = {
				balance: receivedBalance - unconfirmedBalance - sentBalance,
				receivedBalance: receivedBalance,
				sentBalance: sentBalance,
				unconfirmedBalance: unconfirmedBalance,
				txCount: txList.length,
				txList: txList,
				txCountUnconfirmed: txListUnconfirmed.length,
				txListUnconfirmed: txListUnconfirmed

	
			}
			

			res.status(200).send({
				    success: 'true',
				    message: 'Get balance successfully',
				    body: [
					    dataRes
					]
 		    });
		})
	})

});


/*API get list unspent with address*/
app.get('/api/v1/listunspent/address/:address', (req, res) => {

	const address = req.params.address;
	if (!address) {
		res.status(401).send("Invalid input argument");
		return;
	}


	mgTransaction.find({address: address, spent: false}).sort({txid: -1, voutindex: 1}, function(err, data){

		/* if err in function select data*/
		if (err) {
			res.status(500).send({
				success: 'false',
			    message: 'Service api fail. Please try again!'   
	        });		
			return console.log("ERR in function find with address");
		}

		var result = [];

		client.getBlockCount(function(err, blockCount){

			if (err) {
				res.status(500).send({
				    success: 'false',
				    message: 'Service api fail. Please try again!'   
		        });
				return console.log("ERR in function getBlockCount");
			}

			data.forEach(function(element, index){

				if(index != 0 && element.txid == data[index-1].txid){
					console.log("------",element.txid);
				 	return;
				}				

				if(element.isCoinBase){

					if(element.blockIndex <= blockCount-100){
						result.push(element.txid);
					}

				} else {
					result.push(element.txid);
				}
			});

			res.status(200).send({
				    success: 'true',
				    message: 'Get balance successfully',
				    body: [
					    {
					      listunspent: result
					    }
					]
 		    });
		})
	})
	
});


/*API get n-quantity block new*/

app.get('/api/v1/getblocknew/:quantity', (req, res) => {

	if (!req.params.quantity) {
		res.status(401).send("Invalid input argument");
		return;
	}

	const quantity = parseInt(req.params.quantity);

	mgBlock.find().sort({height: -1}).limit(quantity, function(err, data){

		if (err) {
				res.status(500).send({
				    success: 'false',
				    message: 'Service api fail. Please try again!'   
		        });
				return console.log("ERR in function getBlockCount");
			}

		res.status(200).send(data);

	})
	
});

/*API get block by timestamp*/

app.get('/api/v1/getblockbytime/:begin/:end', (req, res) => {

	if (!req.params.begin || !req.params.end) {
		res.status(401).send("Invalid input argument");
		return;
	}

	const begin = parseInt(req.params.begin);
	const end = parseInt(req.params.end);

	mgBlock.find({time: { $gte:  begin, $lte: end}}).sort({time:-1}, function(err, data){

		if (err) {
				res.status(500).send({
				    success: 'false',
				    message: 'Service api fail. Please try again!'   
		        });
				return console.log("ERR in function find mgBlock");
			}

		res.status(200).send(data);

	})
	
});



app.get('/api/v1/gettransaction/:quantity', (req, res) => {

	if (!req.params.quantity) {
		res.status(401).send("Invalid input argument");
		return;
	}

	const quantity = parseInt(req.params.quantity);

	mgTransaction.find({}).sort({time: -1}).limit(quantity, function(err, data){

		if (err) {
				res.status(500).send({
				    success: 'false',
				    message: 'Service api fail. Please try again!'   
		        });
				return console.log("ERR in function find mgTransaction");
			}

		res.status(200).send(data);

	})
	
});



app.get('/api/v1/txs/:address', (req, res) => {

	if (!req.params.address) {
		res.status(401).send("Invalid input argument");
		return;
	}

	const address = req.params.address;

	mgTransaction.find({address:address}, function(err, data){

		if (err) {
			res.status(500).send({
				success: 'false',
				message: 'Service api fail. Please try again!'
			});
			return console.log("ERR in function find mgTransaction");
		}

		res.status(200).send(data);

	})

});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
