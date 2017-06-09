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
    bountyClaimProcess(fob, isHandled => {
      if (!isHandled) {
        console.log("Trying to charge for beer")
        checkWithBrain(fob)
      }
      fob = ""
    })
  } else {
    fob = fob + key;
  }
}

reader.on("EV_KEY", function(data) {
  if (data.value == 1)
    keyparse(data.code)
});

function calculatePayout(monthValue, lastClaimed, now){
    let msSince = now - lastClaimed
    let today = new Date()
    let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
    let msThisMonth = daysThisMonth * 24 * 60 * 60 * 1000
    return (msSince / msThisMonth) * monthValue
}

// return if handled by bounty stoping
// testing?
// bountyClaimProcess("0005826993", isHandled => {
//     console.log({isHandled})
//     bountyClaimProcess("0006047467", isHandled => {
//         console.log({isHandled})
//     })
// })


var claimRequest, payoutRequest, activeBounty
function resetBountyClaim(){
  claimRequest  = {
    action: {
      type: "bounty-claimed",
    }
  }
  payoutRequest = {
    action: {
      type: "member-paid",
      "cash?": false,
    }
  }
  activeBounty = false
}
resetBountyClaim()

function bountyClaimProcess(scannedFob, isHandledCallback) {
  if (activeBounty) {
      // Have an active bounty so next tap is to claim bounty:
      request
          .get(brainLocation + 'members/' + scannedFob)
          .end((err, res) => {
            if (err || res.body.error) {
              console.log('Invalid Fob')
              // clear bounty if random fob tries to claim?
              resetBountyClaim()
              return isHandledCallback(false)
            }

            payoutRequest.action["address"] = res.body.address
            claimRequest.action["address"] = res.body.address
            claimRequest.action["notes"] = Date.now().toString()

            console.log({payoutRequest, claimRequest})

            request
                .post(brainLocation + 'members')
                .send(payoutRequest)
                .end((err, res) => {
                    if (err || res.body.error) {
                      console.log('Unable to create')
                      return null
                    }
                    console.log(res.body)
                })

            request
                .post(brainLocation + 'bounties')
                .send(claimRequest)
                .end((err, res) => {
                    if (err || res.body.error) {
                      console.log('Unable to create')
                    }
                    console.log(res.body)
                })

            resetBountyClaim()
            isHandledCallback(true)

          })
  }

  request
    .get(brainLocation + 'bounties/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob, bounties/:fob')
        return isHandledCallback(false)
      }
      activeBounty = res.body
      console.log("res to bounties/:fob", res.body)
      let now = Date.now()
      let monthValue = res.body.value
      let lastClaimed = res.body.notes
      let amount = calculatePayout(monthValue, lastClaimed, now)
      // Build in the info we need from the bounty, next tap will send these requests
      claimRequest.action["bounty-id"] = res.body["bounty-id"]
      payoutRequest.action["notes"] = res.body["bounty-id"]
      payoutRequest.action["amount"] = amount.toString()
      // This was a bounty tag so we do not need to check for beer
      isHandledCallback(true)
    })
}

function checkWithBrain(scannedFob) {
  request
    .get(brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob')
        return null
      }
      console.log("address?", res.body.address)
      let chargeRequest = {
        action: {
          type: "member-charged",
          address: res.body.address,
          amount: "3",
          notes: "BitPepsi"
        }
      }
      console.log({
        chargeRequest
      })
      request
        .post(brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error) {
            console.log('Unable to create')
            return null
          }
          emit(1)
        })
    })
}
