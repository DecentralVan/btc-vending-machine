const request = require('superagent')
const Kefir = require('kefir')
const evdev = require('evdev');
const reader = new evdev();
const device = reader.open("/dev/input/by-id/usb-Sycreader_RFID_Technology_Co.__Ltd_SYC_ID_IC_USB_Reader_08FF20140315-event-kbd");

const brainLocation = require('./config').brainLocation

let emit = null
const tapnPayStream = Kefir.stream(emitter => {
  emit = emitter.emit
})

module.exports = tapnPayStream.log('tapnPay') // subscribe to trigger above

let fob = ""

function keyparse(code) {
  var key = code.substr(4);
  if (key == "ENTER") {
    console.log(fob);
    checkWithBrain(fob)
    fob = ""
  } else {
    fob = fob + key;
  }
}

reader.on("EV_KEY",function(data){
  if (data.value == 1)
    keyparse(data.code)
});

function checkWithBrain(scannedFob) {
  request
    .get(brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error){
          console.log('Invalid Fob')
          return null
      }
      console.log("address?" , res.body.address)
      let chargeRequest = {
	action: {
        type: "member-charged",
        address: res.body.address,
        amount: "3",
        notes: "BitPepsi"
        }
      }
      console.log({chargeRequest})
      request
        .post(brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error){
              console.log('Unable to create')
              return null
          }
          emit(1)
        })
    })
}
