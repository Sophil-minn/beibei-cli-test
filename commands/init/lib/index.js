'use strict';

const Command = require('@snowlepoard520/command');
const log = require('@snowlepoard520/log');

class InitCommand extends Command {

  init() {
    this.projectName = this._argv[0] || '没有名字的projectName';
    this.force = !!this._cmd._optionValues.force;
    log.verbose('this.projectName', this.projectName);
    log.verbose(this.force, 'force');
  }
  exec() {
    log.verbose('init的业务逻辑');
  }

}

function init(argv) {
  // console.log('init new ', projectName,process.env.CLI_TARGET_PATH, 'CLI_TARGET_PATH');
  // 测试初始化 参数为空
  // return new InitCommand([]);
  return new InitCommand(argv);
}
module.exports = init;
module.exports.InitCommand = InitCommand;