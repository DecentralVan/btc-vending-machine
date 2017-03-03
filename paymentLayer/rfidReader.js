const log = require('debug')('VM:PayoutLayer:vendingMachine')

const Kefir = require('kefir')
const Promise = require('bluebird')
const EventEmitter = require('events')

let valid =[
  '0006047467\n',
  '0008011226\n'
]

function isMember(scannedFob){
    return valid.some( memberId => memberId === scannedFob)
}

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
    const scannedFob = process.stdin.read()
    console.log({
      isMember: isMember(scannedFob)
    })

})
