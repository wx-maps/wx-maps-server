const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')
const messageTypes = require('../../message_types');


const Services = require('../services')

class modeCharacteristic extends bleno.Characteristic {
  constructor(ws){
    console.log("Starting " + Services.mapService.characteristics.mode)
    super({
      uuid: Services.mapService.characteristics.mode,
      properties:  ['read', 'write'],
    })

    this.ws = ws

  }

  onReadRequest(offset, callback){
    console.log('current mode')
    callback(this.RESULT_SUCCESS, BLETransport.send('the mode'));
  }


  // Set the mode
  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request modes");
    console.log(data.toString('utf8'));

    let payload = null;

    switch(data.toString('utf8')){
      case 'rainbow':
        payload = messageTypes.leds.MODE.RAINBOW
        break;
      case 'metar':
        payload = messageTypes.leds.MODE.METAR
        break;
      default:
        payload = 'unknown'
    }

    this.ws.send(JSON.stringify({leds: payload}))
    callback(this.RESULT_SUCCESS);
  }
}

module.exports = { modeCharacteristic }

