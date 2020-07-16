'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Boom = require('boom');
const Router = require('koa-router');

const pkg = require('../../package');
const _ = require('../common/helper');
const logger = require('../common/logger');

const rootRouter = new Router();
const sessionRouter = new Router();

const getControllers = function() {
  const res = {};
  const controllersDir = path.join(__dirname, 'controllers');
  try {
    const list = fs.readdirSync(controllersDir);
    list.forEach(file => {
      if (path.extname(file) === '.js') {
        res[path.basename(file, '.js')] = require(path.join(controllersDir, file));
      }
    });
  } catch (e) {
  }
  return res;
};

// W3C: https://w3c.github.io/webdriver/webdriver-spec.html
module.exports = function(app) {
  let controllers = getControllers();
  // Server status
  rootRouter
    .get('/', function *(next) {
      var dist = [].concat(rootRouter.stack, sessionRouter.stack);
      var res = [];
      dist.forEach(router => {
        res.push(`${router.path}#[${router.methods.join('|')}]`);
      });
      var temp = _.sortBy(res, string => {
        return string.length;
      });
      var num = temp[temp.length - 1].length;
      res.forEach((router, i) => {
        res[i] = router.replace('#', new Array(num - router.length + 2).join(' '));
      });
      res.unshift([`${pkg.name}@${pkg.version}`], new Array(num + 1).join('-'), '');
      this.body = res.join(os.EOL);
      yield next;
    })
    .get('/wd/hub/status', controllers.status)
    .post('/wd/hub/session', controllers.session.createSession)
    .get('/wd/hub/sessions', controllers.session.getSessions)
    .del('/wd/hub/session/:sessionId', controllers.session.delSession);

  sessionRouter
    // session related method
    .prefix('/wd/hub/session/:sessionId')
    .param('sessionId', controllers.session.sessionAvailable)
    // context
    .get('/context', controllers.context.getContext)
    .post('/context', controllers.context.setContext)
    .get('/contexts', controllers.context.getContexts)
    // timeout
    .post('/timeouts/implicit_wait', controllers.timeouts.implicitWait)
    // screenshot
    .get('/screenshot', controllers.screenshot.getScreenshot)
    // source
    .get('/source', controllers.source)
    // element
    .post('/click', controllers.element.click)
    .post('/keys', controllers.keys)
    .post('/element', controllers.element.findElement)
    .post('/elements', controllers.element.findElements)
    .post('/element/:elementId/element', controllers.element.findElement)
    .post('/element/:elementId/elements', controllers.element.findElements)
    .post('/element/:elementId/value', controllers.element.setValue)
    .post('/element/:elementId/click', controllers.element.click)
    .get('/element/:elementId/text', controllers.element.getText)
    .post('/element/:elementId/clear', controllers.element.clearText)
    .get('/element/:elementId/displayed', controllers.element.isDisplayed)
    .get('/element/:elementId/attribute/:name', controllers.element.getAttribute)
    .get('/element/:elementId/property/:name', controllers.element.getProperty)
    .get('/element/:elementId/css/:propertyName', controllers.element.getComputedCss)
    .get('/element/:elementId/rect', controllers.element.getRect)
    .post('/actions', controllers.actions)
    // execute
    .post('/execute', controllers.execute)
    // title
    .get('/title', controllers.title)
    // alert
    .post('/accept_alert', controllers.alert.acceptAlert)
    .post('/dismiss_alert', controllers.alert.dismissAlert)
    .get('/alert_text', controllers.alert.alertText)
    .post('/alert_text', controllers.alert.alertKeys)
    // cookie
    .get('/cookie/:name', controllers.cookie.getNamedCookie)
    .get('/cookie', controllers.cookie.getAllCookies)
    .post('/cookie', controllers.cookie.addCookie)
    .del('/cookie/:name', controllers.cookie.deleteCookie)
    .del('/cookie', controllers.cookie.deleteAllCookies)
    // url
    .get('/url', controllers.url.url)
    .post('/url', controllers.url.getUrl)
    .post('/forward', controllers.url.forward)
    .post('/back', controllers.url.back)
    .post('/refresh', controllers.url.refresh)
    // window
    .get('/window_handle', controllers.window.getWindow)
    .get('/window_handles', controllers.window.getWindows)
    .post('/window', controllers.window.setWindow)
    .del('/window', controllers.window.deleteWindow)
    .get('/window/:windowHandle/size', controllers.window.getWindowSize)
    .post('/window/:windowHandle/size', controllers.window.setWindowSize)
    .post('/window/:windowHandle/maximize', controllers.window.maximize)
    .post('/frame', controllers.window.setFrame);

  app
    .use(rootRouter.routes())
    .use(rootRouter.allowedMethods({
      notImplemented: () => new Boom.notImplemented(),
      methodNotAllowed: () => new Boom.methodNotAllowed()
    }))
    .use(sessionRouter.routes())
    .use(sessionRouter.allowedMethods({
      notImplemented: () => new Boom.notImplemented(),
      methodNotAllowed: () => new Boom.methodNotAllowed()
    }));

  logger.debug('router set');
};
