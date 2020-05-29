const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')
const logger = require('../../logger')('weatherDataCharacteristic');

const Services = require('../services')

const WeatherRequest = require('../../metar_request').WeatherRequest

class weatherDataCharacteristic extends bleno.Characteristic {
  constructor(ws){
    logger.info ("Starting " + Services.mapService.characteristics.weatherData);
    super({
      uuid: Services.mapService.characteristics.weatherData,
      properties:  ['write', 'notify'],
    })

    this.weatherData = [];
    this.updateValueCallback = null;

    this.ws = ws
    this.weatherDataCallback();

  }

  weatherDataCallback(){
    this.ws.onmessage = (message) => {
      try{
        const parsedMessage = JSON.parse(message.data)
        if(parsedMessage && parsedMessage.type == 'airports-and-categories'){
          this.weatherData = parsedMessage.payload
          this.sendResults();
        }
      }catch(error){
        logger.error("Error:");
        logger.error(error);
      }
    }
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    logger.debug("Write Request Airports");
    if(data.toString('utf8') == '1'){
      logger.info('Subscribed To Airport Data')
      this.sendResults()
    };
    callback(this.RESULT_SUCCESS);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    logger.debug("On Subscribe Airports");
    this.updateValueCallback = updateValueCallback
  }

  sendResults(){
    new BLETransport(JSON.stringify(this.weatherData), this.updateValueCallback).send();
  }
}

module.exports = { weatherDataCharacteristic }

