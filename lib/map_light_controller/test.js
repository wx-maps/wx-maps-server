const MapLightController = require('./index')

// Driver for testing and non RPI boards
class TestMapLightController extends MapLightController{
  constructor(){
    // Board and strip setup
    super();
    this.logger = require('../logger')('TestMapLightController');
  }

  sendToLEDs(){
    this.logger.debug('Would call strip.show()');
  }

  setColor(i, ledColor){
    this.logger.debug('Updating index ' + i + ' to color ' + ledColor);
  }

  lightsOff(){
    super.lightsOff();
    console.log("Lights off!")
  };
}

module.exports = TestMapLightController
