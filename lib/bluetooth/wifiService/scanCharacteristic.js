const bleno = require('@abandonware/bleno');
const wifi = require('node-wifi');
const BLETransport = require('../BLETransport')
const logger = require('../../logger')('ScanCharacteristic')


const Services = require('../services')


// Write to start a wifi scan
// Subscribe for results
class ScanCharacteristic extends bleno.Characteristic {
  constructor(){
    super({
      uuid: Services.wifiService.characteristics.scan,
      properties:  ['write', 'notify'],
      value: ''
    })

    this.isScanning = false;
    this.networks = [];
    this.updateValueCallback = null;
    wifi.init({iface: null});
  }

  wifiScan(){
    logger.info("Starting scan")
    this.isScanning = true;
    wifi.scan((err, networks) => {
      if(err){
        logger.error(err);
        this.isScanning = false;
      }else{
        this.networks = JSON.stringify(networks);
        this.isScanning = false;
        this.sendResults()
        logger.info('Scan complete');
      }
    })
  }

  onWriteRequest(data, offset, withoutResponse, callback){
    if(data.toString('utf8') == '1'){
      logger.info('Scanning')
      this.wifiScan();
    }
    else {
      logger.debug('disabled')
    };
    callback(this.RESULT_SUCCESS);
  }

  sendResults(){
    // Check every second for the scan to be complete
    const interval = setInterval(() => {
      if(!this.isScanning && this.networks.length > 0){
        console.log("Sending results");
        console.log(this.networks);
        new BLETransport(this.networks, this.updateValueCallback).send();
        clearInterval(interval)
      }
    }, 1000);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    this.updateValueCallback = updateValueCallback
    this.sendResults()
  }
}

module.exports = ScanCharacteristic

