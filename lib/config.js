const yaml = require('js-yaml');
const fs = require('fs');

module.exports = class Config {
  static data(){
    return {...this.defaultConfig(), ...this.localConfig() };
  }

  static defaultConfig(){
    const defaultFileName = '/etc/wx-maps/wx-maps-config.yml';
    return yaml.safeLoad(fs.readFileSync(defaultFileName, 'utf8'));
  }

  static localFileName(){ return '/etc/wx-maps/wx-maps-config.local.yml'; }

  static localConfig(){
    let localConfig = {}
    if(fs.existsSync(this.localFileName())){
      localConfig = yaml.safeLoad(fs.readFileSync(this.localFileName(), 'utf8'));
    }
    return localConfig
  }


  static update(values){
    const newLocalConfig = {...this.localConfig(), ...values}
    fs.writeFile(this.localFileName(), JSON.stringify(newLocalConfig), (err) => {
      if(err) { throw new Error('Failed to update config') }
      const pid = Process.pid 
      logger.info('Killing pid: ' + pid);
      Process.kill(pid);
    })
  }
}
