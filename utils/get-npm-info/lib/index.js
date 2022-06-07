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

function getSemverVersions(baseVersion, versions) {
  versions = versions
  .filter(version => {
    return semver.satisfies(version, `^${baseVersion}`);
  })
  .sort((a, b) => {
    // console.log(semver.gt(b, a), 'semver.gt(b, a)');
    return semver.gt(b, a) ? 0 : -1;
  });
  // console.log(versions, 'sorted versions');
  return versions;
}

async function getNpmSemverVersions(baseVersion, npmName, registry) {
 const versions = await getNpmVersions(npmName, registry);
//  console.log(versions, 'versions');
//  console.log(baseVersion, 'baseVersion');
 
 const newVersions = getSemverVersions(baseVersion, versions);
//  console.log(newVersions, 'newVersions');
 if (newVersions && newVersions.length ) {
    return newVersions[0];
 }
}


function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org/': 'https://registry.npm.taobao.org/'
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersions
};

