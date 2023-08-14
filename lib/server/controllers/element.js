'use strict';

function *click(next) {
  const elementId = this.params.elementId;
  this.state.value = yield this.device.click(elementId);
  yield next;
}

function *setValue(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const value = body.value;

  this.state.value = yield this.device.setValue(elementId, value);
  yield next;
}

function *getText(next) {
  const elementId = this.params.elementId;
  this.state.value = yield this.device.getText(elementId);
  yield next;
}

function *clearText(next) {
  const elementId = this.params.elementId;
  this.state.value = yield this.device.clearText(elementId);
  yield next;
}

function *findElement(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const strategy = body.using;
  const selector = body.value;

  this.state.value = yield this.device.findElement(strategy, selector, elementId);
  yield next;
}

function *findElements(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const strategy = body.using;
  const selector = body.value;

  this.state.value = yield this.device.findElements(strategy, selector, elementId);
  yield next;
}

function *isDisplayed(next) {
  const elementId = this.params.elementId;
  this.state.value = yield this.device.isDisplayed(elementId);
  yield next;
}

function *getAttribute(next) {
  const elementId = this.params.elementId;
  const name = this.params.name;

  this.state.value = yield this.device.getAttribute(elementId, name);
  yield next;
}

function *getProperty(next) {
  const elementId = this.params.elementId;
  const name = this.params.name;

  this.state.value = yield this.device.getProperty(elementId, name);
  yield next;
}

function *getComputedCss(next) {
  const elementId = this.params.elementId;
  const propertyName = this.params.propertyName;

  this.state.value = yield this.device.getComputedCss(elementId, propertyName);
  yield next;
}

function *getRect(next) {
  const elementId = this.params.elementId;

  this.state.value = yield this.device.getRect(elementId);
  yield next;
}


function *takeElementScreenshot(next) {
  const elementId = this.params.elementId;
  this.state.value = yield this.device.takeElementScreenshot(elementId, this.request.query);
  yield next;
}

module.exports = {
  click,
  getText,
  clearText,
  setValue,
  findElement,
  findElements,
  getAttribute,
  getProperty,
  getComputedCss,
  getRect,
  isDisplayed,
  takeElementScreenshot
};
