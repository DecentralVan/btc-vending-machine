var evdev = require('evdev');
var request = require('superagent')
var reader = new evdev();
var brainLocation = "192.168.0.127:3000/"
var device = reader.open("/dev/input/by-id/usb-Sycreader_RFID_Technology_Co.__Ltd_SYC_ID_IC_USB_Reader_08FF20140315-event-kbd");

var fob = ""

const r = require('rethinkdb')
const Kefir = require('kefir')
const config = require('./config')
const PRICE_CENTS = 300 // get config

let emit = null
const dbPaymentStream = Kefir.stream(emitter => {
    emit = emitter.emit
})

module.exports = dbPaymentStream.log('event') // subscribe to trigger above

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
              console.log('Invalid Fob')
              return null
          }
          emit(1)
        })
    })
}



//
// emit(2)
//
// r.connect({
//   host:config.location,
//   db: "eventstate"
// }, (err, conn)=>{
//     r   .table('events')
//         .filter(
//             r.row("type").eq("member-charged")
//         )
//         .filter(
//             r.row("notes").eq("BitPepsi")
//         )
//         .changes()
//         .run(conn, (err, cursor)=> {
//             console.log({err, cursor})
//             cursor.each((err, change)=>{
//                 console.log("database updated: ", {amount: change.new_val.amount})
//                 if (!err && change.new_val.amount > 0){
//                     emit(change.new_val.amount * 100 / PRICE_CENTS)
//                 }
//             })
//         })
// })
//
//
//
// //
// // const request = require('superagent')
// // const Kefir = require('kefir')
// //
// //
// // const brainLocation = require('./config').brainLocation
// //
// // let emit = null
// // const tapnPayStream = Kefir.stream(emitter => {
// //     emit = emitter.emit
// // })
// //
// // module.exports = tapnPayStream.log('tapnPay') // subscribe to trigger above
// //
// // process.stdin.setEncoding('utf8')
// // process.stdin.on('readable', () => {
// //
// //   let scannedFob = process.stdin.read()
// //   if (scannedFob){
// //     scannedFob = scannedFob.slice(0, -1)
// //   }
// //   checkWithBrain(scannedFob)
// //
// // })
// //
// // function checkWithBrain(scannedFob) {
// //   request
// //     .get(brainLocation + 'members/' + scannedFob)
// //     .end((err, res) => {
// //       if (err || res.body.error){
// //           console.log('Invalid Fob')
// //           return null
// //       }
// //
// //       let chargeRequest = {
// //         type: "member-charged",
// //         address: res.body.address,
// //         amount: "3",
// //         notes: "BitPepsi"
// //       }
// //
// //       request
// //         .post(brainLocation + 'members')
// //         .send(chargeRequest)
// //         .end((err, res) => {
// //           if (err || res.body.error){
// //               console.log('Invalid Fob')
// //               return null
// //           }
// //           // TODO check success better
// //           if (true) {
// //             console.log("triggering beer")
// //             emit(1)
// //           }
// //         })
// //     })
// // }
