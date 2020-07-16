'use strict';

function *getScreenshot(next) {
  this.state.value = yield this.device.getScreenshot(this, this.request.query);
  yield next;
}

module.exports = {
  getScreenshot
};
