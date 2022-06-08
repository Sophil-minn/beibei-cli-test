'use strict';

module.exports = core;

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;


const pkg = require('../package.json');
const commander = require('commander');
const log = require('@snowlepoard520/log');
const init = require('@snowlepoard520/init');
const constant = require('./const');


let args;

const program = new commander.Command();

let config;

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地文件路径', '');

    program 
      .command('init [projectName]')
      .option('-f, --force', '是否 强制初始化项目', false)
      .action(init)

    program.on('option:debug', function() {
      log.verbose('test',34567, log);
      if (program.opts().debug) {
        process.env.LOG_LEVEL = 'verbose';
      } else {
        process.env.LOG_LEVEL = 'info';
      }
      log.level = process.env.LOG_LEVEL;
      log.verbose('test', 'program.on');
    });

    program.on('option:targetPath', function() {
      process.env.CLI_TARGET_PATH = program.opts().targetPath;
      console.log('targetPathtargetPath');
      console.log(program.opts().targetPath, 'program');
      log.verbose('test', 'targetPath');
    });



    // 对未知命令监听
    program.on('command:*', function(obj) {
      const avaiableCommands = program.commands.map(cmd => cmd.name());
      console.log(colors.red('未知的命令：' + obj[0]), program);
      if(avaiableCommands.length) {
        console.log(colors.red('可用命令：' + avaiableCommands.join(',')));
      }
    });

    if(process.argv.length < 3) {
      program.outputHelp();
    }
    if(program.args && program.args.length < 1) {
      program.outputHelp();
    }
  
    program.parse(process.argv);
  

}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot(); 
  checkUserHome(); 
  // checkInputArgs();
  // log.verbose('debugg', 'test debub log');
  checkEnv();
  await checkGlobalUpdate();
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
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登陆用户主目录不存在！'))
  }
}

// lerna add root-check  core/cli/
function checkRoot() {
  // TODO
  const rootCheck = require('root-check');
  rootCheck(); // root 降级
}

function checkNodeVersion() {
  // 获取当前node版本号
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