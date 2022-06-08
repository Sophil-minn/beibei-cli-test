'use strict';

const Package = require('@snowlepoard520/package');
const log = require('@snowlepoard520/log');

const SETTINGS = {
  init: '@snowlepoard520/init'
}

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj._name;
  console.log(cmdObj.opts().force, cmdObj._name, 'force');
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'lattest';
  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion
  });
  
  console.log(pkg, 1234);
  console.log('exec', 111);
}

module.exports = exec;