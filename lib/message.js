// A class to handle RXd messages from our clients
// A message has the format of
// { $TYPE: $PAYLOAD }

const logger = require('./logger')('Message');
const messageTypes = require('./message/types');
const Process = require('process');

// FIXME: A message *should* have the format of
// { type: TYPE, payload: PAYLOAD}
// See Issues 2,3,4
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
      //   [] Subscribe - Issue#2
      //   [] LEDS - Issue#3
      //   [] DATA - Issue#4
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
      case messageTypes.SUBSCRIBE:
        return new SubscribeMessage(opts);
        break;
      case messageTypes.LEDS:
        return new LedMessage(opts);
        break;
      case messageTypes.DATA:
        return new DataMessage(opts);
        break;
      case messageTypes.SYSTEM:
        return new SystemMessage(opts);
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
        logger.info('Sending', this.mapLightController.getLightStatus());
        this.webSocket.sendData('light-status', this.mapLightController.getLightStatus(), false)
        break;
      default:
        logger.info("Unknown leds payload: " +  this.payload);
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
        logger.info("Unknown data payload: " +  this.payload);
        break;
    }
  }
}

const Config  = require('./config');
class SystemMessage extends Message{
  call(){
    console.log("Message type: " + this.messageType());
    switch(this.messageType()){
      case messageTypes.system.RESTART:
        this.restart();
        break;
      case messageTypes.system.UPDATE_CONFIG:
        this.updateConfig();
        break;
      case messageTypes.system.GET_CONFIG:
        this.getConfig();
        break;
      default:
        logger.info("Unknown system payload: " + this.payload);
        break;
    }
  }

  messageType(){ return (typeof(this.payload) == 'object' ? Object.keys(this.payload)[0] : this.payload) }

  restart(){
    const pid = Process.pid
    logger.info('Killing pid: ' + pid);
    Process.kill(pid);
  }

  getConfig(){
    this.webSocket.sendData('config', Config.data(), false)
  }

  updateConfig(){
    const values = this.payload[Object.keys(this.payload)[0]]
    console.log('values:');
    console.log(values);
    Config.update(values);
  }
}

process.on('SIGTERM', () => {
  console.log("Exiting");
  process.exit()
})

module.exports = Message
