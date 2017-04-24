const config = require('../config');

const Kefir = require('kefir');
const request = require('superagent');

const addresses = config.map(product => product.address);
const url = 'https://blockchain.info/unconfirmed-transactions?format=json';
const INTERVAL = 23456;

module.exports = blockchaininfoUtxoCheck()

var emit = null
function blockchaininfoUtxoCheck() {
  return Kefir.stream(emitter => {
    emit = emitter.emit
    getUtxo(emit)
  })
  .log('found in utxo')
}

setInterval(getUtxo, INTERVAL, emit);

//TODO - this is so ugly
function getUtxo(emit) {
  request.get(url).end((err, res) => {
    if (!err) {
      var txs = res.body
      if (txs.txs != null) {
        txs.txs.forEach(transaction => {
          if (transaction.out != null) {
            transaction.out.forEach(output => {
              if (addresses.indexOf(output.addr) > -1) {
                emit({
                  txid: transaction.hash,
                  recieved: output.value / 100000000,
                  address: output.addr
                })
              }
            })
          }
        })
      }
    };
  });
}
