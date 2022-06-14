'use strict';

const semver = require('semver');
const LOWEST_NODE_VERSION = '13.0.0';
const colors = require('colors/safe');

class Command {
  constructor(argv) {
    // console.log('Command constructor', argv);
    this._argv = argv;
    let runner = new Promise(() => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain.catch(err => {
        console.log(err.message);
      });
    });
  }

  checkNodeVersion() {
    // 获取当前node版本号
    const currentVersion = process.version;
    // 比对最低版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    // console.log(semver, 'semversemversemver');
    if(semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以上版本的Node.js`))
    } else {
      throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以下版本的Node.js`))
    }
  }

  init() {
    throw new Error('init必须实现');
  }
  
  exec() {
    throw new Error('exec必须实现');
  }
}

module.exports = Command;