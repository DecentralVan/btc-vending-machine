const config = require('../config')

const Kefir = require('kefir')
const Promise = require('bluebird')
const WebSocket = require('ws');

let ws = new WebSocket('wss://n.block.io/');
ws.on('open', () => {
    config.forEach(product => {
        ws.send(JSON.stringify({
            "network": "BTC",
            "type": "address",
            "address": product.address
        }));
    });
})

module.exports = Kefir
    .fromEvents(ws, 'message')
    .log('Raw Blockr Event')
    .map(JSON.parse)
    .filter(value => value.type == 'address')
    .filter(value => value.data.confirmations < 2)
    .map(parseAddressEvent)
    .log('Blockr Address Event Created')

function parseAddressEvent(addressEvent) {
    return {
        txid: addressEvent.data.txid,
        recieved: addressEvent.data.amount_received,
        address: addressEvent.data.address
    }
}
