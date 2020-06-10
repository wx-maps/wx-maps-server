const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')
const logger = require('../../logger')('modeCharacteristic');

const messageTypes = require('../../message/types');

const Services = require('../services')

class modeCharacteristic extends bleno.Characteristic {
  constructor(ws){
    logger.info("Starting " + Services.mapService.characteristics.mode)
    super({
      uuid: Services.mapService.characteristics.mode,
      properties:  ['read', 'write'],
    })

    this.ws = ws

  }

  onReadRequest(offset, callback){
    callback(this.RESULT_SUCCESS, BLETransport.send('the mode'));
  }


  // Set the mode
  onWriteRequest(data, offset, withoutResponse, callback){
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

