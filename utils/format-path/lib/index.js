'use strict';

const path = require('path');

function formatPath(p) {
  if(p && typeof p === 'string') {
    const sep = path.sep;
    // mac返回的是/ window返回的是 \
    // console.log(sep, 'sep');
    if (sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
    // console.log(p, 'formatPath方法');
  }
}


module.exports = formatPath;