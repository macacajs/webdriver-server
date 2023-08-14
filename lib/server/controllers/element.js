'use strict';

async function click(next) {
  const elementId = this.params.elementId;
  this.state.value = await this.device.click(elementId);
  await next;
}

async function setValue(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const value = body.value;

  this.state.value = await this.device.setValue(elementId, value);
  await next;
}

async function getText(next) {
  const elementId = this.params.elementId;
  this.state.value = await this.device.getText(elementId);
  await next;
}

async function clearText(next) {
  const elementId = this.params.elementId;
  this.state.value = await this.device.clearText(elementId);
  await next;
}

async function findElement(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const strategy = body.using;
  const selector = body.value;

  this.state.value = await this.device.findElement(strategy, selector, elementId);
  await next;
}

async function findElements(next) {
  const elementId = this.params.elementId;
  const body = this.request.body;
  const strategy = body.using;
  const selector = body.value;

  this.state.value = await this.device.findElements(strategy, selector, elementId);
  await next;
}

async function isDisplayed(next) {
  const elementId = this.params.elementId;
  this.state.value = await this.device.isDisplayed(elementId);
  await next;
}

async function getAttribute(next) {
  const elementId = this.params.elementId;
  const name = this.params.name;

  this.state.value = await this.device.getAttribute(elementId, name);
  await next;
}

async function getProperty(next) {
  const elementId = this.params.elementId;
  const name = this.params.name;

  this.state.value = await this.device.getProperty(elementId, name);
  await next;
}

async function getComputedCss(next) {
  const elementId = this.params.elementId;
  const propertyName = this.params.propertyName;

  this.state.value = await this.device.getComputedCss(elementId, propertyName);
  await next;
}

async function getRect(next) {
  const elementId = this.params.elementId;

  this.state.value = await this.device.getRect(elementId);
  await next;
}


async function takeElementScreenshot(next) {
  const elementId = this.params.elementId;
  this.state.value = await this.device.takeElementScreenshot(elementId, this.request.query);
  await next;
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
