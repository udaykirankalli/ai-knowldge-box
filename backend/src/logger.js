const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor(context) {
    this.context = context;
  }

  _log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...meta
    };
    console.log(JSON.stringify(logEntry));
  }

  error(message, meta) {
    this._log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta) {
    this._log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta) {
    this._log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      this._log(LOG_LEVELS.DEBUG, message, meta);
    }
  }
}

export default Logger;