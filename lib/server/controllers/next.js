'use strict';

async function universal(next) {
  const { body } = this.request;
  const { method, args } = body;
  this.state.value = await this.device.next(method, ...args);
  await next();
}

module.exports = {
  universal,
};
