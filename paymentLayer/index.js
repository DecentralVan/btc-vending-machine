const Kefir = require('kefir')
const tapnPay = require('./tapnPay')

module.exports = Kefir.merge([tapnPay]).log("paymentLayer")
