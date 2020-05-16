const {createLogger, format, transports}  = require('winston');
const config = require('./config');

// A unified logger that allows us to identify which
// components are doing the logging. It logs to screen as well 
// as a log file
//
// This should be required as follows:
//
//     this.logger = require('../logger')('ExampleLogger');
//
// Which will produce a log line like this:
//
//     info: Your message {"service":"ExampleLogger","timestamp":"2020-04-24 20:21:59"}
//
// This class will expose the following log levels/priorities:
//     {
//       emerg: 0,
//       alert: 1,
//       crit: 2,
//       error: 3,
//       warning: 4,
//       notice: 5,
//       info: 6,
//       debug: 7
//     }


class Logger{
  constructor(serviceName = 'server'){
    const logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: serviceName },
      transports: [
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        new transports.File({ filename: config.error_log_file, level: 'error' }),
        new transports.File({ filename: config.log_file })
      ]
    });

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (process.env.NODE_ENV !== 'production') { 
      logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      );
    }
    return logger
  }
}

module.exports = (serviceName) => { return new Logger(serviceName) }
