'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;


const pkg = require('../package.json');
const log = require('@snowlepoard520/log');
const constant = require('./const');


let args;
let config;

function core() {
  try {
    checkUserHome(); 
    checkPkgVersion();
    checkNodeVersion();
    checkRoot(); 
    checkInputArgs();
    // log.verbose('debugg', 'test debub log');

    checkEnv();
  } catch (error) {
    log.error(error.message);
  }
  
  
}


function checkPkgVersion() {
  // TODO
  console.log( '版本号 ：', pkg.version);
  log.success('test', 'success...');
}

function checkUserHome() {

  console.log(userHome, 'userHome');
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登陆用户主目录不存在！'))
  }
}

// lerna add root-check  core/cli/
function checkRoot() {
  // TODO
  const rootCheck = require('root-check');
  console.log( '所有者 ：', process.geteuid());
  rootCheck(); // root 降级
  console.log(process.geteuid());
}

function checkInputArgs() {
   const minimist = require('minimist');
   args = minimist(process.argv.slice(2));
   console.log(args, 'checkInputArgs');
   checkArgs();
}

function checkArgs() {
  if(args.debug) {
    process.env.LOG_LEVEL = 'vebose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}


function checkNodeVersion() {
  // 获取当前node版本号
  console.log(process.version);
  const currentVersion = process.version;
  // 比对最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if(semver.gte(currentVersion, lowestVersion)) {
    // throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以上版本的Node.js`))
  } else {
    // throw new Error(colors.red(`beibei-cli 需要安装${lowestVersion}以下版本的Node.js`))
  }
}


function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    });
  }
  createDefaultConfig();
  log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  return cliConfig;
}