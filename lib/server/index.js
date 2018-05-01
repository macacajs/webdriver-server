'use strict';

const koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');

const router = require('./router');
const logger = require('../common/logger');
const middlewares = require('./middlewares');
const responseHandler = require('./responseHandler');

module.exports = (options) => {

  return new Promise((resolve, reject) => {
    logger.debug('webdriver server start with config:\n %j', options);

    try {
      const app = koa();

      const devices = new Map();

      app.use(cors());

      app.use(function *(next) {
        this.devices = devices;
        this._options = options;
        yield next;
      });

      app.use(bodyParser());

      middlewares(app);

      app.use(responseHandler);

      router(app);

      app.listen(options.port, resolve);
    } catch (e) {
      logger.debug(`webdriver server failed to start: ${e.stack}`);
      reject(e);
    }
  });
};
