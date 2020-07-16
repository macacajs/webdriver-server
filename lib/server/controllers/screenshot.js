'use strict';

function *getScreenshot(next) {
  const params = this.request.query;
  if (params.fullPage) {
    params.fullPage = params.fullPage === 'true';
  }

  this.state.value = yield this.device.getScreenshot(this, params);
  yield next;
}

module.exports = {
  getScreenshot
};
