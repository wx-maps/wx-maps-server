const bleno = require('@abandonware/bleno');
const BLETransport = require('../BLETransport')

const Services = require('../services')

// TODO
// I think we can get rid of this and just use the modes characteristic
// to make things simpler
class lightStatusCharacteristic extends bleno.Characteristic {
  constructor(ws){
    super({
      uuid: Services.mapService.characteristics.lightStatus,
      properties:  ['read', 'write'],
    })
    this.ws = ws

    this.initializeWebSocketHandlers()
    this.ledStatus = null
  }

  initializeWebSocketHandlers(){
    // this.ws.onmessage = (message) => {
      // const parsedMessage = JSON.parse(message.data)
      // if(parsedMessage.type == 'light-status'){ this.ledStatus = parsedMessage.payload }
    // };

  }

  getLightStatus(){
    this.ws.send(JSON.stringify({leds: 'status'}))
  }

  onReadRequest(offset, callback){
    this.getLightStatus();
    console.log('status is', this.ledStatus);
    callback(this.RESULT_SUCCESS, BLETransport.send(JSON.stringify(this.ledStatus)));
  }
}

module.exports = { lightStatusCharacteristic }

