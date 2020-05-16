class RainbowMode {
  constructor(ledController){
    this.logger = require('../logger')('NeoPixelMapLightController');
    this.ledController = ledController;
    this.colorWheelIndex = 0;
  }

  call(){
    if (++this.colorWheelIndex > 255) { this.colorWheelIndex = 0; }

    try{
      for(var i = 0; i < this.ledController.strip.length; i++) {
        let showColor = this.colorWheel((this.colorWheelIndex + i) & 255);
        this.ledController.setColor(i, showColor)
      }
      this.ledController.sendToLEDs();

    }catch(error){
      this.logger.info('Errror:');
      this.logger.info(error);
    }
  }

  // Input a value 0 to 255 to get a color value.
  // The colors are a transition r - g - b - back to r.
  colorWheel(WheelPos){
    var r,g,b;
    WheelPos = 255 - WheelPos;

    if ( WheelPos < 85 ) {
        r = 255 - WheelPos * 3;
        g = 0;
        b = WheelPos * 3;
    } else if (WheelPos < 170) {
        WheelPos -= 85;
        r = 0;
        g = WheelPos * 3;
        b = 255 - WheelPos * 3;
    } else {
        WheelPos -= 170;
        r = WheelPos * 3;
        g = 255 - WheelPos * 3;
        b = 0;
    }
    // returns a string with the rgb value to be used as the parameter
    return "rgb(" + r +"," + g + "," + b + ")";
  }
}

module.exports = RainbowMode
