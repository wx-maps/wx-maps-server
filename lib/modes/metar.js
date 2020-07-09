const config = require('../config').data();
const MetarRequest = require('../metar_request').MetarRequest;

class MetarMode{
  constructor(logger, timeout, updater){
    this.updateInterval = 10; // seconds
    this.timeout = timeout;
    this.lightsOn = true;
    this.logger = logger;
    this.updater = updater;
    this.failed = false;
    this.failedInterval = 2; // seconds
  }

  call(){ this.metar(); }

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

  metar(){
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
      this.failed = true
    } finally {
      this.logger.info("Updating in " + this.updateInterval());
      this.timeout = setTimeout(() => { this.updater() }, this.updateInterval() * 1000)
    }
  }

  updateInterval(){ return(this.failed ? this.failedInterval : this.updateInterval) }
}

module.exports = MetarMode
