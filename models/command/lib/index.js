'use strict';

const semver = require('semver');
const colors = require('colors/safe');
const log = require('@snowlepoard520/log');
// const { isObject } = require('@snowlepoard520/utils');

const LOWEST_NODE_VERSION = '12.0.0';

class Command {
  constructor(argv) {
    console.log('Command constructor', argv);
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    }
    // if (!isObject(argv)) {
    //   throw new Error('参数必须为对象！');
    // }
    if (argv.length < 1) {
      throw new Error('参数列表为空！');
    }
    this._argv = argv;
    let runner = new Promise(() => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain = chain.then(() => {
        this.initArgs();
      });
      chain = chain.then(() => {
        this.init();
      });
      chain = chain.then(() => {
        this.exec();
      });
      chain.catch(err => {
        log.error(err.message);
      });
    });
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length -1);
    // console.log(this.cmd, this._argv, 'this._argvthis._argvthis._argv');
  }

  checkNodeVersion() {
    // 获取当前node版本号
    const currentVersion = process.version;
    // 比对最低版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    // console.log(semver, 'semversemversemver');
    if(semver.gte(currentVersion, lowestVersion)) {
      // throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以上版本的Node.js`))
      // log.error(`beibei-cli 需要安装${lowestVersion}以上版本的Node.js`);
    } else {
      log.error(`beibei-cli 需要安装${lowestVersion}以下版本的Node.js`);
      // throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以下版本的Node.js`))
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