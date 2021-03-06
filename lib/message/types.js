
//
// Types of messages that we can recieve from the client
// We take action based on the type and message payload
//

module.exports = {
  SUBSCRIBE: 'subscribe',
  subscribe: {
    METARS: 'metars',
    AIRPORTS_AND_CATEGORIES: 'airports-and-categories',
    LOGS: 'logs',
  },
  LEDS: 'leds',
  leds: {
    ON: 'on',
    OFF: 'off',
    STATUS: 'status',
    MODE: {
      RAINBOW: 'rainbow',
      METAR: 'metar',
    }
  },
  DATA: 'data',
  data: {
    UPDATE: 'update',
  },
  SYSTEM: 'system',
  system: {
    RESTART: 'restart',
    GET_CONFIG: 'get_config',
    UPDATE_CONFIG: 'update_config',
  }
}
