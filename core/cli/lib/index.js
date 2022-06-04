'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const pkg = require('../package.json');
const log = require('@snowlepoard520/log');
const constant = require('./const');


function core() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot(); 
}


function checkPkgVersion() {
  // TODO
  console.log( '版本号 ：', pkg.version);
  log.success('test', 'success...');
}

// lerna add root-check  core/cli/
function checkRoot() {
  // TODO
  const rootCheck = require('root-check');
  console.log( '所有者 ：', process.geteuid());
  rootCheck(); // root 降级
  console.log(process.geteuid());
}


function checkNodeVersion() {
  // 获取当前node版本号
  console.log(process.version);
  const currentVersion = process.version;
  // 比对最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if(semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以上版本的Node.js`))
  } else {
    throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以下版本的Node.js`))
  }
}


