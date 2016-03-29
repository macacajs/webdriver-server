/* ================================================================
 * webdriver-server by xdf(xudafeng[at]126.com)
 
 * first created at : Tue Mar 17 2015 00:16:10 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

'use strict';

const koa = require('koa');
const path = require('path');
const installer = require('node-installer');
const bodyParser = require('koa-bodyparser');

const router = require('./router');
const _ = require('../common/helper');
const logger = require('../common/logger');
const middlewares = require('./middlewares');
const responseHandler = require('./responseHandler');

function WebdriverServer() {
  this.desiredCapabilities = null;
  this.sessions = new Map();
  this.device = null;
  this.isProxy = false;
}

WebdriverServer.prototype.start = function *(caps) {
  this.desiredCapabilities = caps;
  this.isProxy = false;
  // inject device
  this.device = this.detectDevice();
  caps.app = _.configApp(caps.app);
  yield this.device.startDevice(caps);
  return this.desiredCapabilities;
};

WebdriverServer.prototype.detectDevice = function() {
  let platformName = this.desiredCapabilities.platformName.toLowerCase();

  switch (platformName) {
    case 'ios':
      var IOS = installer('macaca-ios')
      return new IOS(this.desiredCapabilities);
      break;
    case 'android':
      var Android = installer('macaca-android');
      return new Android(this.desiredCapabilities);
      break;
  }
};

exports.init = (options) => {

  return new Promise((resolve, reject) => {
    logger.debug('webdriver server start with config:\n %j', options);

    const app = koa();

    var webdriverServer = new WebdriverServer();

    app.use(function *(next) {
      this.webdriverServer = webdriverServer;
      yield next;
    });

    app.use(bodyParser());

    middlewares(app);

    app.use(responseHandler);

    router(app);

    app.listen(options.port, resolve);
  });
};
