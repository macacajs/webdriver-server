'use strict';

function *extraFunc(next) {
  const body = this.request.body;
  const { funcName, params } = body;
  yield this.device.extraFunc(funcName, ...params);
  this.state.value = null;
  yield next;
}

module.exports = {
  extraFunc
};
