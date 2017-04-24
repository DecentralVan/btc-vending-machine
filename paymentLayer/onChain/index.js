const Kefir = require('kefir')
const config = require('./config')

const btcTransactionStream = require('./transactionLayer')
const btcPriceStream = require('./priceLayer/quadrigacx') // todo merge with other price sources

module.exports = onChainPaymentLayer(btcTransactionStream, btcPriceStream).log("onChain")

function onChainPaymentLayer(btcTransactionStream, btcPriceStream) {
   return Kefir.combine([btcTransactionStream, btcPriceStream], normalizePayment)
}

const addressMap = {}
config.forEach(product => {
    addressMap[product.address] = {
        price: product.price,
        pin: product.gpioPin
    }
})

function normalizePayment(payment, rate) {
    let paid = payment.recieved * rate * 100 // prices in cents
    let price = addressMap[payment.address].price
    return paid / price
}
