/**
 * Simple logger that prefixes messages with a timestamp and context name.
 */
class Logger {
  /**
   * @param {string} context - Label shown in every log line (e.g. "App")
   */
  constructor(context) {
    this.context = context;
  }

  _timestamp() {
    return new Date().toISOString();
  }

  log(message) {
    console.log(`[${this._timestamp()}] [${this.context}] INFO: ${message}`);
  }

  error(message) {
    console.error(`[${this._timestamp()}] [${this.context}] ERROR: ${message}`);
  }
}

module.exports = Logger;
