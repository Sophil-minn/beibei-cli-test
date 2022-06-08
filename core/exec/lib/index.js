'use strict';

const Package = require('@snowlepoard520/package');

function exec() {
  const pkg = new Package();
  console.log(pkg, 1234);
  console.log('exec', 111);
}

module.exports = exec;