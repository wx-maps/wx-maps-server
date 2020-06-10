require('dotenv').config();
const express = require('express');
const enableWs = require('express-ws')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');

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

app.listen(port, () => logger.info(`Metar Map listening on port ${port}!`));


process.on('SIGTERM', () => {
  console.log("Exiting on SUGTERM");
  process.exit()
})
