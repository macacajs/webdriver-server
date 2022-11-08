'use strict';

async function universal(next) {
  const body = this.request.body;
  const { funcName, params } = body;
  this.state.value = await this.device.next(funcName, ...params);
  await next();
}

module.exports = {
  universal,
};
