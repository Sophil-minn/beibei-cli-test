'use strict';

module.exports = core;
const pkg = require('../package.json');
const log = require('@snowlepoard520/log');


function core() {
  checkPkgVersion();
}


function checkPkgVersion() {
  // TODO
  console.log( '版本号 ：', pkg.version);
  log.success('test', 'success...');
}


