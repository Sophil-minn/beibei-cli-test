'use strict';



function utils() {
    // TODO
    console.log('I am utils');
}

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}
/*  */

module.exports = {
  isObject,
  utils
};