const os = require('os');
const config = require('./config');

const NeoPixelMapLightController = require('./map_light_controller/neo_pixel')
const TestMapLightController = require('./map_light_controller/test')
const Ws281xNativeMapLightController = require('./map_light_controller/ws281x-native')

//
// The Map Light Controller controls the lights, their colors, and
// any other light related functions. It's designed to be subclassed
// based on the platform and LED driver you're using. 
//
// You can configure the driver in the config file
//


class MapLightControllerFactory{ static create(){
    if(os.arch() == 'arm'){
      if(config.driver == 'ws281x-native'){
        return new Ws281xNativeMapLightController();
      } else{
        return new NeoPixelMapLightController()
      }
    } else{
      return new TestMapLightController()
    }
  }

}

module.exports = MapLightControllerFactory
