require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const pigpio = require('pigpio');

const app = express();
enableWs(app)

// Local libs
const getPort = require('./lib/getPort');
const port = getPort();
const WeatherRequest = require('./lib/metar_request').WeatherRequest
const MapLightControllerFactory = require('./lib/map_light_controller_factory');
const mapLightController = MapLightControllerFactory.create()

const BLEPeripheral = require('./lib/bluetooth/BLEPeripheral');

const logger = require('./lib/logger')('server');

const Message = require('./lib/message');
const WebSocket = require('./lib/web_socket')

const isProductionMode = () => { return process.env.NODE_ENV === 'production' }

// Solution for failed restarts
// https://raspberrypi.stackexchange.com/questions/70672/initmboxblock-init-mbox-zaps-failed-when-using-piio-library-in-a-daemon-usi
const shutdown = () => {
  // FIXME We need to kill the tail process from a log message subsscription here
  // Issue#6
  logger.info("Goodbye!")
  pigpio.terminate()
  process.exit()
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGCONT', shutdown);
process.on('SIGTERM', shutdown);

app.use(bodyParser.json());
app.use(cors());

app.ws('/metar.ws', (ws, req) => {
  let websocket = new WebSocket(ws)

  ws.on('message', (msg) => {
    logger.info("Got message " + msg);

    const message = Message.create(msg, websocket, mapLightController, WeatherRequest)
    message ? message.call() : false;
  })
})


// Begin fetching metars
WeatherRequest.call();
mapLightController.call();

// Start Bluetooth device
(new BLEPeripheral).call();
isProductionMode();

logger.info('Running in ' + (isProductionMode() ? 'production' : 'development') + ' mode');
app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`));


