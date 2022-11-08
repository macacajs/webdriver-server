'use strict';

async function universal(next) {
  this.state.value = await this.device.getScreenshot(this, this.request.query);
  await next();
}

module.exports = {
  universal,
};
