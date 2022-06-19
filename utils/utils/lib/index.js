'use strict';



function utils() {
    // TODO
    console.log('I am utils');
}

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function spinnerStart(msg, spinnerString = '|/-\\') {
  const Spinner = require('cli-spinner').Spinner;
  const spinner = new Spinner(msg + ' %s');
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

function sleep(timeout = 2000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = {
  isObject,
  spinnerStart,
  sleep,
  utils
};