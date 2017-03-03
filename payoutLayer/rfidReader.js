const log = require('debug')('VM:PayoutLayer:vendingMachine')

const Kefir = require('kefir')
const Promise = require('bluebird')
const EventEmitter = require('events')

module.exports = function vendingMachine(paymentStream, rateStream) {
  var stream = Kefir.stream(emitter => {
    process.stdin.setEncoding('utf8')
    process.stdin.on('readable', () => {
      var chunk = process.stdin.read()
      if (chunk != null) {
        process.stdout.write(`data: ${chunk}`)
      }
    })
  })
}
