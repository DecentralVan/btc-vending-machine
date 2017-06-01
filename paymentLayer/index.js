const Kefir = require('kefir')

const onChain = require('./onChain')
const tapnPay = require('./tapnPay')

module.exports = Kefir.merge([onChain, tapnPay]).log("paymentLayer")
