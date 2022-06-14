'use strict';

const cp = require('child_process');
const path = require('path');
const Package = require('@snowlepoard520/package');
const log = require('@snowlepoard520/log');

const SETTINGS = {
  init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies/';

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg = '';
  // log.verbose('targetPath', targetPath);
  // log.verbose('homePath', homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj._name;
  // console.log(cmdObj.opts().force, cmdObj._name, 'force');
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';


  if (!targetPath) {
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
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package 异步执行
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    });
  }

  // console.log('npminstall @@@@@@@', await pkg.exists());
  const rootFile = pkg.getRootFilePath();
  // console.log(rootFile,  'rootFilerootFilerootFile');
  if (rootFile) {
    try {
      // 当前进程中调用，无法充分利用CPU资源
      // require(rootFile).call(null, Array.from(arguments));
      // 改造成 在node子进程中调用，可以额外的获取更多的CPU资源， 以便获得更高的性能
      const args =  Array.from(arguments);
      const cmd = args[args.length -1];
      const o = Object.create(null);
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;
      // console.log(cmd, 'cmd');
      const code = ` require(${rootFile}).call(null, ${JSON.stringify(args)});`;
      const child = cp.spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      child.on('error', e => {
        log.error(e.message);
        process.exit(1);
      });
      child.on('exit', e => {
        log.verbose('命令执行成功：' + e );
        process.exit(e);
      });
      // child.stdout.on('data', function (chunk) {
      //   console.log('stdout', chunk.toString());
      // });
      // child.stderr.on('data', function (chunk) {
      //   console.log('stderr', chunk.toString());
      // });
    } catch (error) {
      console.log(error, 'error');
    }
    // console.log( require(rootFile), ' require(rootFile)');
    // require(rootFile).apply(null, arguments);
  }
  // const dir = pkg.getRootFilePath();

  // console.log(pkg, 1234);
  // console.log(dir, 111);
}

module.exports = exec;