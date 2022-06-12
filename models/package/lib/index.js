// import {packageDirectory} from 'pkg-dir';
const npminstall = require('npminstall');
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;


const { isObject } = require('@snowlepoard520/utils');
const formatPath = require('@snowlepoard520/format-path');
const { getDefaultRegistry, getNpmLatestVersion } = require('@snowlepoard520/get-npm-info');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('package 参数不能为空');
    }
    if (!isObject(options)) {
      throw new Error('package类 options参数必须为对象');
    }
    // package的目标路径
    this.targetPath = options.targetPath;
    // package的缓存路径
    this.storeDir = options.storeDir;
    // package的存储路径
    // this.storePath = options.storePath;
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.packageVersion;
    // console.log('初始化 package constructor');
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  async prepare() {
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
    // _@imooc-cli_init@1.1.3@@imooc-cli
    // packageName: imooc-cli/init version: 1.1.3
    // console.log(this.packageVersion, '最新的版本');
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  // 判断当前package是否存在
  async exists() {
    // 处于缓存模式
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }

  }

  // 安装package
  async install() {
    // 安装依赖使用
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      regitry: getDefaultRegistry(true),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })
    
  }

  // 更新package
  update() {

  }

  // 获取入口文件的路径
  getRootFilePath() {
    // 1、获取package.json所在目录- pkg-dir
    // console.log(await packageDirectory(this.targetPath));
    const dir = pkgDir(this.targetPath);
    // console.log(dir, 'dir');
    if (dir) {
      // 2、读取package.json
      const pkgFile = require(path.resolve(dir, 'package.json'));
      // 3、寻找main/lib
      if (pkgFile && pkgFile?.main) {
        // 4、路径的兼容（macOS/windows）
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }

    return null;
  }
}

module.exports = Package;
