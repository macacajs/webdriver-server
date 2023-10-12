'use strict';

function *getContext(next) {
  this.state.value = yield this.device.getContext();
  yield next;
}

function *getContexts(next) {
  this.state.value = yield this.device.getContexts();
  yield next;
}

function *setContext(next) {
  const body = this.request.body;
  const name = body.name;
  const opts = body.opts;
  yield this.device.setContext(name, opts);
  this.state.value = null;
  yield next;
}

module.exports = {
  getContext,
  getContexts,
  setContext
};
