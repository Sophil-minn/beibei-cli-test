#! /usr/bin/env node

const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 本地版本')
} else {
  console.log(77777)
  require('../lib')(process.argv.slice(2));
}

console.log(11111)