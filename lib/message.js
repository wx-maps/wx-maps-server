// A class to handle RXd messages from our clients
// A message has the format of
// { $TYPE: $PAYLOAD }

const logger = require('./logger')('Message');
const messageTypes = require('./message_types');

// FIXME: A message should have the format of
// { type: TYPE, payload: PAYLOAD}
class Message{
  static create(message, webSocket, mapLightController, weatherRequest){
    let parsedMessage = null;
    let type = null;
    let payload = null;

    try{
      parsedMessage = JSON.parse(message)
    } catch(error){
      logger.error("Error: ");
      logger.error(error)
      return false
    }

    if("type" in parsedMessage){
      type = parsedMessage.type
      payload = parsedMessage.payload
    } else {
      // This will be needed until we convert old messages to the new style
      // TODO
      //   [] Subscribe
      //   [] LEDS
      //   [] DATA
      type = Object.keys(parsedMessage)[0]
      payload = Object.values(parsedMessage)[0]
    }

    const opts = {
      payload: payload,
      webSocket: webSocket,
      mapLightController: mapLightController,
      weatherRequest: weatherRequest
    }

    switch(type){
      case 'config':
        return new ConfigMessage(opts);
        break;
      case messageTypes.SUBSCRIBE:
        return new SubscribeMessage(opts);
        break;
      case messageTypes.LEDS:
        return new LedMessage(opts);
        break;
      case messageTypes.DATA:
        return new DataMessage(opts);
        break;
      default:
        logger.error("Unknown message type: " + message)
    }
  }

  constructor(opts){
    this.payload = opts.payload;
    this.webSocket = opts.webSocket
    this.mapLightController = opts.mapLightController
    this.weatherRequest = opts.weatherRequest
  }
}

class SubscribeMessage extends Message{
  call(){
    switch(this.payload){
      case messageTypes.subscribe.METARS:
        this.webSocket.sendData('metars', this.weatherRequest.json())
        break;
      case messageTypes.subscribe.LOGS:
        this.webSocket.sendLogData();
        break;
      case messageTypes.subscribe.AIRPORTS_AND_CATEGORIES:
        this.webSocket.sendData('airports-and-categories', this.weatherRequest.airportsAndCategories())
        break;
      default:
        console.log('Unknown subscribe payload: ')
        console.log(this.payload);
    }
  }
}

const Config = require('./config')
class ConfigMessage extends Message{
  call(){
    this.webSocket.sendData('config', Config.airports, false)
  }
}

class LedMessage extends Message{
  call(){
    switch(this.payload){
      case messageTypes.leds.ON:
        logger.info("ledState on");
        this.mapLightController.lightsOn();
        break;
      case messageTypes.leds.OFF:
        logger.info("ledState off");
        this.mapLightController.lightsOff();
        break;
      case messageTypes.leds.MODE.RAINBOW:
        logger.info("Changing to rainbow mode");
        this.mapLightController.setMode(messageTypes.leds.MODE.RAINBOW);
        break;
      case messageTypes.leds.MODE.METAR:
        logger.info("Changing to metar mode");
        this.mapLightController.setMode(messageTypes.leds.MODE.METAR);
        break;
      case messageTypes.leds.STATUS:
        logger.info('Sending', mapLightController.getLightStatus());
        this.webSocket.sendData('light-status', this.mapLightController.getLightStatus(), false)
        break;
      default:
        logger.info("Unknown leds payload: " + msg);
        break;
    }
  }
}

class DataMessage extends Message{
  call(){
    switch(this.payload){
      case messageTypes.data.UPDATE:
        logger.info("Updating data");
        this.weatherRequest.update();
        this.webSocket.sendData('metar-data', this.weatherRequest.json(), false)
        break;
      default:
        logger.info("Unknown data payload: " + msg);
        break;
    }
  }
}


module.exports = Message
