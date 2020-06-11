const yaml = require('js-yaml');
const fs = require('fs');

class Config {
  static data(){
    const defaultFileName = '/etc/wx-maps/wx-maps-config.yml';
    const localFileName = '/etc/wx-maps/wx-maps-config.local.yml';
    const defaultConfig = yaml.safeLoad(fs.readFileSync(defaultFileName, 'utf8'));

    let config = {}
    if(fs.existsSync(localFileName)){
      const localConfig = yaml.safeLoad(fs.readFileSync(localFileName, 'utf8'));
      config = {...defaultConfig, ...localConfig };
    } else {
      config = defaultConfig;
    }
    return config;
  }
}

module.exports = Config.data();

