'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');


const testUrl = '@imooc-cli/core'

function getNpmInfo(npmName, registry) {
  console.log(npmName, 'npmName');
  if(!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  const testUrl = '@imooc-cli/core'
  const npmInfoUrl = urlJoin(registryUrl, testUrl);
  return axios.get(npmInfoUrl).then(response => {
    if(response.status === 200) {
      // console.log(response, 'response');
      return response.data;
    }
    return null;
  }).catch(
    err => {
      return Promise.reject(err);
    }
  );
}

async function getNpmVersions(npmName, registry){
  const data = await getNpmInfo(npmName);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}


function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org/': 'https://registry.npm.taobao.org/'
}

module.exports = {
  getNpmInfo,
  getNpmVersions
};

