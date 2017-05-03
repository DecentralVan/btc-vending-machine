const Kefir = require('kefir')

const onChain = require('./onChain')
const tapnPay = require('./tapnPay')
const listenBrain = require('./listenBrain')

module.exports = Kefir.merge([onChain, listenBrain]).log("paymentLayer")
