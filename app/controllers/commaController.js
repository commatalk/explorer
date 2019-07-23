const request = require('request');
const async = require('async');
const PivxGateway = require('../blockchain').CommaGateway;
const bitcore = require('bitcore-lib-bltg-chainos');
const Checkit = require('cc-checkit');

exports.generateAddress = function (req, res) {
  async.auto({
    getNewAddress: (next) => {
      PivxGateway.getNewAddress(next);
    },
    dumPrivateKey: ["getNewAddress", (ret, next) => {
      const address = ret.getNewAddress;
      PivxGateway.dumPrivateKey(address, next);
    }],
  }, (err, ret) => {
    if (err) {
      const result = {
        result_code: 500,
        result_text: "fail",
        data: err
      }
      res.send(result)
    }
    const address = ret.getNewAddress;
    const privateKey = ret.dumPrivateKey;
    const wif = ret.dumPrivateKey;
    const data = {
      address: address,
      privateKey: privateKey,
      wif: wif
    }
    const result = {
      result_code: 200,
      result_text: "success",
      data: data
    }
    res.send(result);
  })
}

exports.getBalanceAddress = function (req, res) {
  const address = req.params.address;
  if (!address) {
    res.badRequest(err.toString());
    return;
  }
  const coincore = PivxGateway.getLib();
  async.auto({
    getBalanceAddress: (next) => {
      PivxGateway.getBalanceAddress(address, next);
    }
  }, (err, ret) => {
    if (err) {
      const result = {
        result_code: 500,
        result_text: "fail",
        data: err
      }
      return res.send(result)
    }
    const balance = ret.getBalanceAddress;
    const data = {
      balance: balance,
    }
    const result = {
      result_code: 200,
      result_text: "success",
      data: data
    }
    return res.send(result);
  })
}

exports.sendToAddress = function (req, res) {
  const coincore = PivxGateway.getLib();
  amountSats = parseInt(req.body.amount);
  const addressTo = req.body.to;
  const addressFrom = req.body.from;

  async.auto({
    info: (next) => {

      PivxGateway.getRPCNodeInfo(next);

    },

    utxos: (next) => {

      PivxGateway.getAddressUtxos(addressFrom, next);

    },

  }, (err, ret) => {

    if (err) {
      const result = {
        result_code: 500,
        result_text: "fail",
        data: err
      }
      return res.send(result)
    }

    const relayFee = ret.info.relayfee * 100000000;

    const PrivateKey = req.body.privatekey;
    const utxos = ret.utxos;
    const inputs = [];
    const estimatedTotalAmount = amountSats + relayFee;
    let totalInput = 0;

    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      inputs.push(new coincore.Transaction.UnspentOutput(utxo));
      totalInput += parseInt(utxo.amountSat);
      if (totalInput > estimatedTotalAmount) {
        break;
      }
    }
    if(amountSats < 5460) {
      const result = {
        result_code: 500,
        result_text: "fail",
        data: "Dust amount detected in one output"
      }
      return res.send(result)
    }
    var tx = new coincore.Transaction()
      .from(inputs)          // Feed information about what unspent outputs one can use
      .to(addressTo, amountSats)  // Add an output with the given amount of satoshis
      .change(addressFrom)      // Sets up a change address where the rest of the funds will go
      .sign(PrivateKey)     // Signs all the inputs it can

    const len = tx.serialize().length;

    let calculatedFee = Math.ceil(coincore.Transaction.FEE_PER_KB * len / 1024);

    if (calculatedFee < relayFee) calculatedFee += relayFee;
    tx = tx.fee(calculatedFee).sign(PrivateKey);
    const tx_raw = tx.serialize();
    PivxGateway.sendRawTransaction(tx_raw, (err, ret) => {
      if(err) {
        const result = {
          result_code: 500,
          result_text: "fail",
          data: err
        }
        return res.send(result)
      }
      const data = {
        txid: ret
      }
      const result = {
        result_code: 200,
        result_text: "success",
        data: data
      }
      return res.send(result);
    });
    
  });
}

