const config = require('../config');
const MapLightController = require('./index')

class NeoPixelMapLightController extends MapLightController{
  constructor(){
    super();

    this.logger = require('../logger')('NeoPixelMapLightController');

    this.five = require("johnny-five");
    this.pixel = require("node-pixel");
    this.Raspi = require("raspi-io").RaspiIO;

    this.board = this._createBoard();
    this.strip = this._createStrip();
  }

  _createBoard(){
    return new this.five.Board({
      io: new this.Raspi(),
      repl: false
    })
  }

  _createStrip(){
    return new this.pixel.Strip({
      color_order: this.pixel.COLOR_ORDER.GRB,
      board: this.board,
      controller: "I2CBACKPACK",
      strips: [config.airports.length]
    })
  }

  call(){
    this.board.on("ready", () => {
      this.strip.on("ready", () => {
        this.updateMap();
      })
    })
  }

  shutdown(){
    console.log("Shutting down");
  }

  sendToLEDs(){
    this.strip.show();
  }

  setColor(i, ledColor){
    this.strip.pixel(i).color(ledColor);
  }

  lightsOff(){
    super.lightsOff();
    this.strip.off();
  }
}

module.exports = NeoPixelMapLightController
