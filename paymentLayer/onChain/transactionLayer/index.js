const log = require('debug')('VM:transactionLayer')
const Kefir = require('kefir')

const blockio = require('./blockio')
const blockchaininfo = require('./blockchaininfo')
// const localNode = require('./localNode') // TODO

const transactionStreams = [blockio, blockchaininfo]

module.exports = transactionLayer(transactionStreams).log("transactionLayer")

function transactionLayer(transactionStreams){
  return Kefir
    .merge(transactionStreams)
    .filter(checkSeen)
}

const seenTxs = []
function checkSeen(payment) {
    if (seenTxs.indexOf(payment.txid) != -1) {
        return false
    }
    seenTxs.push(payment.txid)
    return true
}
