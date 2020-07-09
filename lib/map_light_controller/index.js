const config = require('../config').data();
const MetarRequest = require('../metar_request').MetarRequest;

const MetarMode = require('../modes/metar')
const RainbowMode = require('../modes/rainbow_mode')

//
// The Map Light Controller controls the lights, their colors, and
// any other light related functions. It's designed to be subclassed
// based on the platform and LED driver you're using. 
//
// You can configure the driver in the config file
//

class MapLightController{
  constructor(){
    this.updateInterval = 10; //seconds
    this.timeout = null;
    this.lightsOn = true;
    this.mode = null;
    this.rainbowMode = new RainbowMode(this);
    this.failed = false;
    this.failedInterval = 3; // seconds
  }

  call(){ this.updateMap(); }

  skyConditionToColor(skyCondition){
    switch(skyCondition){
      case 'VFR':
        return config.led.colors.vfr
        break;
      case 'MVFR':
        return config.led.colors.mvfr
        break;
      case 'IFR':
        return config.led.colors.ifr
        break;
      case 'LIFR':
        return config.led.colors.lifr
        break;
      default:
        return null;
    }
  }

  setMode(mode){
    clearTimeout(this.timeout);
    this.mode = mode
    this.updateMap()
  }

  // Our different modes
  // Work on breaking these out
  metarMode(){
    if(!this.lightsOn){
      clearTimeout(this.timeout);
      return
    }

    try {
      const metars = MetarRequest.json();
      if(!metars.airports){ throw 'Airports not fetched' }

      config.airports.forEach((airport_id, i) => {
        let airport = metars.airports[i]
        let skyCondition = null;

        if(airport && airport.flight_category){ skyCondition = airport.flight_category._text }

        const ledColor = this.skyConditionToColor(skyCondition);
        this.logger.debug("Updating " + airport_id + " (" + i + ") to " + skyCondition + " (" + ledColor + ")");

        if(ledColor){
          this.setColor(i, ledColor)
        } else {
          //strip.pixel(i).off();
        }

      })
      this.sendToLEDs();
    } catch(err){
      this.logger.info("Failed to update LEDs: " + err);
      this.failed = true;
      MetarRequest.call()
    } finally {
      this.logger.debug("Updating in " + this.getUpdateInterval());
      this.timeout = setTimeout(() => { this.updateMap() }, this.getUpdateInterval() * 1000)
    }
  }

  getUpdateInterval(){ return(this.failed ? this.failedInterval : this.updateInterval) }


  enableRainbowMode(){
    try{ this.rainbowMode.call() }
    finally { this.timeout = setTimeout(() => { this.updateMap() }, 50) }
  }


  // In order to change modes this must be called at the end of each modes update cycle
  updateMap(){
    this.failed = false
    this.logger.debug("Updating LEDs");
    this.logger.debug("Mode: " + this.mode);
    switch(this.mode){
      case 'rainbow':
        this.enableRainbowMode();
        break;
      default:
        this.metarMode()
    }

  }

  lightsOn(){ this.lightsOn = true; };
  lightsOff(){ this.lightsOn = false };
  getLightStatus() { return {lightsOn: this.lightsOn} };
}

module.exports = MapLightController
