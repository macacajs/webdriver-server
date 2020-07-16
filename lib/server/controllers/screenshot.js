'use strict';

function *getScreenshot(next) {
  const params = this.request.body;
  this.state.value = yield this.device.getScreenshot(this, params);
  yield next;
}

module.exports = {
  getScreenshot
};
