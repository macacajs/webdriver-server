'use strict';

function *implicitWait(next) {
  const body = this.request.body;
  const ms = body.ms;
  this.implicitWaitMs = parseInt(ms, 10);
  this.state.value = null;
  yield next;
}

module.exports = {
  implicitWait
};
