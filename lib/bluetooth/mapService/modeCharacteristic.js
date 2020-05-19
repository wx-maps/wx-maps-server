const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

const Services = require('../services')

class modeCharacteristic extends bleno.Characteristic {
  constructor(ws){
    super({
      uuid: Services.mapService.characteristics.mode,
      properties:  ['read', 'write'],
    })

    this.ws = ws

  }

  // Set the mode
  onWriteRequest(data, offset, withoutResponse, callback){
    console.log("Write Request modes");
    console.log(data.toString('utf8');
    if(data.toString('utf8') == '1'){
      console.log('Subscribed To Airport Data')
      this.sendResults()
    };
    callback(this.RESULT_SUCCESS);
  }
}

module.exports = { weatherDataCharacteristic }

