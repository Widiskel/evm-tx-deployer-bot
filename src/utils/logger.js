import { createLogger, format, transports } from "winston";
import fs from "fs";
const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

class Logger {
  constructor() {
    this.logger = createLogger({
      level: "debug",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        colorize(),
        customFormat
      ),
      transports: [new transports.File({ filename: "log/app.log" })],
      exceptionHandlers: [new transports.File({ filename: "log/app.log" })],
      rejectionHandlers: [new transports.File({ filename: "log/app.log" })],
    });
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  setLevel(level) {
    this.logger.level = level;
  }

  clear() {
    fs.truncate("log/app.log", 0, (err) => {
      if (err) {
        this.logger.error("Failed to clear the log file: " + err.message);
      } else {
        this.logger.info("Log file cleared");
      }
    });
  }
}

export default new Logger();
