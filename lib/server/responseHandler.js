'use strict';

const chalk = require('chalk');
const codes = require('webdriver-dfn-error-code').codes;

const _ = require('../common/helper');
const logger = require('../common/logger');

module.exports = function *(next) {
  try {
    logger.debug(`${chalk.green('Recieve HTTP Request from Client')}[${_.moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]: method: ${this.method} url: ${this.url}, jsonBody: ${JSON.stringify(this.request.body)}`);

    yield next;

    if (this.url === '/') {
      return;
    }

    const statusCode = this.response.status;
    const message = this.response.message;

    if (typeof this.state.value === 'undefined' && (statusCode === 404 || statusCode === 405 || statusCode === 501)) {
      logger.debug(`${chalk.red('Send HTTP Respone to Client')}[${_.moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]: ${statusCode} ${message}`);
      return;
    }

    var hitNoProxy = () => {
      if (this.device) {
        return this.device.whiteList(this) || !this.device.isProxy() || !this.device.proxyMode;
      } else {
        return true;
      }
    };

    if (hitNoProxy()) {
      const result = {
        sessionId: this.sessionId || '',
        status: 0,
        value: this.state.value
      };
      this.body = result;
      var log = _.clone(result);

      if (log.value) {
        log.value = _.truncate(JSON.stringify(log.value), {
          length: 400
        });
      }
      logger.debug(`${chalk.magenta('Send HTTP Respone to Client')}[${_.moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]: ${JSON.stringify(log)}`);
    }

    if (this.device) {
      this.device.proxyMode = this.device.isProxy();
    }
  } catch (e) {
    logger.debug(`${chalk.red('Send Error Respone to Client: ')}${e}`);

    if (!(e instanceof Error)) {
      this.throw(500);
    }
    if (e.stack) {
      logger.debug(e.stack);
    }
    const errorName = e.name;
    const errorMsg = e.message;
    const errorNames = Object.keys(codes);

    if (_.includes(errorNames, errorName)) {
      const error = codes[errorName];
      const errorCode = error.code;
      const badResult = {
        sessionId: this.sessionId || '',
        status: errorCode,
        value: {
          message: errorMsg
        }
      };
      logger.debug(`${chalk.red('Send Bad HTTP Respone to Client')}[${_.moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}]: ${JSON.stringify(badResult)}`);
      this.body = badResult;
    } else if (errorName === 'NotImplementedError') {
      this.throw(501, errorMsg);
    } else {
      this.throw(e);
    }
  }
};
