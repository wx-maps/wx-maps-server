const config = require('../config').data();
const MapLightController = require('./index')

// Support for the WS281X-native node package
// https://github.com/beyondscreen/node-rpi-ws281x-native
// I didn't have much luck controlling the lights directly with the pi but
// my reasearch says it's possible. You may need to use a level shifter:
// https://learn.adafruit.com/neopixels-on-raspberry-pi/raspberry-pi-wiring
class Ws281xNativeMapLightController extends MapLightController{
  constructor(){
    super();
    this.logger = require('./logger')('Ws281xNativeMapLightController');

    this.five = require("johnny-five");
    this.Raspi = require("raspi-io").RaspiIO;
    this.ws281x = require("rpi-ws281x-native");

    this.board = this._createBoard();
    this.pixelData = []
  }

  _createBoard(){
    return new this.five.Board({
      io: new this.Raspi({ excludePins: 'GPIO18'}),
      repl: false
    })
  }

  call(){
    this.ws281x.init(config.airports.length)
    super.updateMap();
  }

  sendToLEDs(){
    this.ws281x.render(this.pixelData);
  }

  setColor(i, ledColor){
      console.log(Buffer.from(ledColor, 'utf8').toString('hex'));
      this.pixelData[i] = parseInt('0x' + config.led.colors.vfr.substr(1));
  }

    lightsOff(){
      super.lightsOff();
      this.ws281x.reset();
  }
}


