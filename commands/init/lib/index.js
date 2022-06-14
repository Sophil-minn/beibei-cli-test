'use strict';

const Command = require('@snowlepoard520/command');

class InitCommand extends Command {

}

function init(argv) {
  // console.log('init new ', projectName,process.env.CLI_TARGET_PATH, 'CLI_TARGET_PATH');
  return new InitCommand(argv);
}
module.exports = init;
module.exports.InitCommand = InitCommand;