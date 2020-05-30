const logger = require('./logger')('WebSocket')
const Cache = require('./cache');
const { spawn } = require('child_process')
const Config = require('./config')

class WebSocket{
  constructor(ws){
    this.ws = ws
  }

  // Send data to the websocket client.
  // * ws           - the websocket
  // * payloadName  - populates the 'type' field of the message
  // * payload      - the data to be sent
  // * repeat       - if the data should be sent repeatedly
  // * sendInterval - how often to send the data
  sendData(payloadName, payload, repeat=true, sendInterval=10){
    logger.debug('Sending ' + payloadName + ' data');
    if(!this.ws){ logger.info("WS is null"); return false }

    if(this.ws.readyState === 1){
      if(payload.has_errors){
        ws.send(JSON.stringify({
          type: 'error',
          payload: payload
        }));
      } else {
        this.ws.send(JSON.stringify({
          type: payloadName,
          payload: payload,
        }));
      }
      if(repeat){
        setTimeout(() => this.sendData(payloadName, payload, repeat), sendInterval * 1000)
      }
    }else{
      logger.info("Unknown ready state: " + this.ws.readyState);
    }
  }

  sendLogData(){
    let logLines = new Cache(100)

    logger.info("Sending log data");
    const latestLines = spawn('tail', ['-100', Config.log_file]);
    latestLines.stdout.on('data', (line) => { logLines.store(line.toString()) })

    const tail = spawn('tail', ['-F', Config.log_file]);

    if(!this.ws){ logger.info("WS is null"); return false }
    if(this.ws.readyState === 1){
      tail.stdout.on('data', (line) => {
        logLines.store(line.toString());
        if(this.ws.readyState === 1){
          this.ws.send(JSON.stringify({
            type: "logs",
            payload: logLines
          }));
        }
      })
    }
  }
}


module.exports = WebSocket
