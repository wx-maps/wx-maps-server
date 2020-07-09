const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport');
const Services = require('../services');
const Config = require('../../config');

class configCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: Services.mapService.characteristics.config,
      properties:  ['write', 'notify'],
    })

    this.updateValueCallback = null
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this.updateValueCallback = updateValueCallback
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    if(data.toString('utf8') == '1'){
      new BLETransport(JSON.stringify(Config.data()), this.updateValueCallback).send();
    }
    callback(this.RESULT_SUCCESS);
  }
}

module.exports = { configCharacteristic }

