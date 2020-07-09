const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport');
const Services = require('../services');
const Config = require('../../config');

class updateConfigCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: Services.mapService.characteristics.config,
      properties:  ['write'],
    })

    this.updateValueCallback = null
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this.updateValueCallback = updateValueCallback
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    // Merge configs then write to local.yml
    const updateString = data.toString('utf8');
    try {
      const updateData = JSON.parse(updateString)
      console.log("Updating config with data");
      console.log(updateData);

      Config.update(updateData);
      callback(this.RESULT_SUCCESS);
    } catch {
      console.log("Error");
      callback(this.RESULT_SUCCESS);
    }
  }
}

module.exports = { updateConfigCharacteristic }

