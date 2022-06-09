'use strict';

const path = require('path');
const Package = require('@snowlepoard520/package');
const log = require('@snowlepoard520/log');

const SETTINGS = {
  init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies/';

function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg = '';
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj._name;
  console.log(cmdObj.opts().force, cmdObj._name, 'force');
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'lattest';


  if(!targetPath) {
    // 生成缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose(targetPath, 'targetPath', storeDir, 'storeDir');
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    });
    if(pkg.exists()) {
      // 更新package

    } else {
      // 安装package
      pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    });
  }
  const rootFile = pkg.getRootFilePath();
  require(rootFile).apply(null, arguments);
  

  const dir = pkg.getRootFilePath();
  
  // console.log(pkg, 1234);
  console.log(dir, 111);
}

module.exports = exec;