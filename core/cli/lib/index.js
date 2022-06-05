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

async function core() {
  try {
    checkUserHome(); 
    checkPkgVersion();
    checkNodeVersion();
    checkRoot(); 
    checkInputArgs();
    // log.verbose('debugg', 'test debub log');
    checkEnv();
    checkGlobalUpdate();
  } catch (error) {
    log.error(error.message);
  }
  
  
}

async function checkGlobalUpdate() {
  // 获取当前版本和模块
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 调用npm API, 获取所有版本号
  // const { getNpmVersions } = require('@snowlepoard520/get-npm-info');
  const { getNpmSemverVersions } = require('@snowlepoard520/get-npm-info');

  
  // 提取所有版本号，比对那些版本号是大于当前版本号
  // const data = await  getNpmVersions(npmName);
  const lastVersion  = await  getNpmSemverVersions(currentVersion, npmName);
  // console.log(newVersion, 'newVersion');
  // 获取最新的版本号，提示用户更新到该版本
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新${npmName}, 当前版本：${currentVersion} ， 最新版本： ${lastVersion}
    更新命令： npm install -g ${npmName}
    `));
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