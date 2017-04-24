const url = 'https://api.quadrigacx.com/v2/ticker';

const Kefir = require('kefir');
const request = require('superagent');

const INTERVAL = 777777;

module.exports = startQuadrigaStream()

function startQuadrigaStream(){
    return Kefir.stream(emitter => {
        getExchangeRate(emitter.emit)
        setInterval(getExchangeRate, INTERVAL, emitter.emit)
    })
}

function getExchangeRate(emit) {
    request.get(url).end((err, res) => {
        if (!err) emit(res.body.vwap);
    });
}
