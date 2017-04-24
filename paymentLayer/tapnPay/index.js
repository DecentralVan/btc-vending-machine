const request = require('superagent')
const Kefir = require('kefir')

const brainLocation = require('./config').brainLocation

let emit = null
const tapnPayStream = Kefir.stream(emitter => {
    emit = emitter.emit
})

module.exports = tapnPayStream.log('tapnPay') // subscribe to trigger above

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {

  let scannedFob = process.stdin.read()
  if (scannedFob){
    scannedFob = scannedFob.slice(0, -1)
  }

  emit(1)
  // make request to backend
  // checkWithBrain()
})

function checkWithBrain(scannedFob) {
  request
    .get(brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error){
          console.log('Invalid Fob')
          return null
      }

      let chargeRequest = {
        type: "member-charged",
        address: res.body.address,
        amount: "3",
        notes: "BitPepsi"
      }

      request
        .post(brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error){
              console.log('Invalid Fob')
              return null
          }
          // TODO how to check success
          if (true) {
            console.log("triggering beer")
            emit(1)
          }
        })
    })
}
