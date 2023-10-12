'use strict';

function *getWindow(next) {
  this.state.value = yield this.device.getWindow();
  yield next;
}

function *getWindows(next) {
  this.state.value = yield this.device.getWindows();
  yield next;
}

function *getWindowSize(next) {
  const windowHandle = this.params.windowHandle;
  this.state.value = yield this.device.getWindowSize(windowHandle);
  yield next;
}

function *setWindowSize(next) {
  const body = this.request.body;
  const width = body.width;
  const height = body.height;
  const windowHandle = this.params.windowHandle;

  this.state.value = yield this.device.setWindowSize(windowHandle, width, height);
  yield next;
}

function *maximize(next) {
  const windowHandle = this.params.windowHandle;

  this.state.value = yield this.device.maximize(windowHandle);
  yield next;
}

function *setWindow(next) {
  const body = this.request.body;
  const name = body.name;

  this.state.value = yield this.device.setWindow(name);
  yield next;
}

function *deleteWindow(next) {
  this.state.value = yield this.device.deleteWindow();
  yield next;
}

function *setFrame(next) {
  const body = this.request.body;
  const frame = body.id;

  this.state.value = yield this.device.setFrame(frame);
  yield next;
}

module.exports = {
  getWindow,
  getWindows,
  getWindowSize,
  setWindowSize,
  maximize,
  setWindow,
  deleteWindow,
  setFrame
};
