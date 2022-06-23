'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');
const userHome = require('user-home');
const glob = require('glob');
const ejs = require('ejs');
const Command = require('@snowlepoard520/command');
const Package = require('@snowlepoard520/package');
const log = require('@snowlepoard520/log');
const { spinnerStart, sleep, execAsync } = require('@snowlepoard520/utils');

const getProjectTemplate = require('./getProjectTemplate');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

// 白名单命令
const WHITE_COMMAND = ['npm', 'cnpm'];

class InitCommand extends Command {

  init() {
    this.projectName = this._argv[0] || '没有名字的projectName';
    this.force = !!this._cmd?._optionValues?.force;
    // console.log(this._cmd, 'this._cmdthis._cmd');
    // log.verbose('this.projectName', this.projectName);
    // log.verbose(this.force, 'force');
  }
  async exec() {
    try {
      // 1，准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        log.verbose(111, projectInfo);
        // 2、下载模板
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        // 3、安装模板
        await this.installTemplate();
      }
     
    } catch (e) {
      log.error(e.message)
    }

  }

  async installTemplate () {

    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 自定义安装
        await this.installCustomTemplate();
      } else {
        throw new Error('无法识别项目模板类型！安装已终止');
      }
    } else {
      throw new Error('项目模板信息不存在！');
    }
  }

  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

  async execCommand(command, errMsg) {
    let ret;
    if (command) {
      const cmdArray = command.split(' ');
      const cmd = this.checkCommand(cmdArray[0]);
      if (!cmd) {
        throw new Error('命令不存在！命令：' + command);
      }
      const args = cmdArray.slice(1);
      console.log(cmd, args, 'cmd, argscmd, args');
      ret = await execAsync(cmd, args, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }
    log.verbose(ret, command + '执行成功');
    if (ret !== 0) {
      throw new Error(errMsg);
    }
    return ret;
  }

  async ejsRender(options) {
    const dir = process.cwd();
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      glob('**', {
        cwd: dir,
        ignore: options.ignore || '',
        nodir: true,
      }, function(err, files) {
        console.log(files, 'files-----');
        if (err) {
          console.log(err,  'ejsRender glob出错了 ');
          reject(err);
        }
        Promise.all(files.map(file => {
          const filePath = path.join(dir, file);
          return new Promise((resolve1, reject1) => {
            ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
              if (err) {
                console.log(err, 'renderFile时候 出错了', filePath, 'filePath');
                reject1(err);
              } else {
                fse.writeFileSync(filePath, result);
                resolve1(result);
              }
            });
          });
        })).then(() => {
          resolve();
        }).catch(err => {
          console.log(err, 'promiseAll 捕获到的异常');
          reject(err);
        });
      });
    });
  }

  async installNormalTemplate() {
    log.verbose('安装标准模板');
    // console.log(this.templateNpm, 'this.templateNpm');
    // console.log(this.templateNpm.cacheFilePath, 'this.templateNpm.cacheFilePath 缓存路径');
    // 拷贝模板代码至当前目录
    let spinner = spinnerStart('正在安装模板...');
    await sleep();
    const targetPath = process.cwd();
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (e) {
      throw e;
    } finally {
      spinner.stop(true);
      log.success('模板安装成功');
    }  
    const templateIgnore = this.templateInfo.ignore || [];
    const ignore = ['**/node_modules/**', '**/img/**', ...templateIgnore];
    await this.ejsRender({ ignore });
    // 安装依赖
    const { installCommand, startCommnand } = this.templateInfo;
    // 依赖安装
    await this.execCommand(installCommand, '依赖安装失败！');
    // 启动命令执行
    await this.execCommand(startCommnand, '启动执行命令失败！');
    
  }
  async installCustomTemplate() {
    log.verbose('安装自定义模板');
  }

  async downloadTemplate() {
    // 1，通过项目模板API获取项目模板信息
    // 1.1， 通过egg.js搭建一套后端系统
    // 1.2 通过npm 存储项目模板
    // 1.3 将项目模板存储到mongodb数据库中
    // 1.4 通过egg.js获取mongodb中的数据 并且通过API返回
    // console.log(this.template, '模板信息');
    console.log(this.projectInfo, '我填写的项目信息');
    const { packageVersion: myCustomVersion } = this.projectInfo;
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(item => item.npmName === projectTemplate);
    const { npmName, version } = templateInfo;
    // console.log(userHome, 'userHome');
    const targetPath = path.resolve(userHome, '.beibei-cli-dev', 'template');
    const storeDir = path.resolve(userHome, '.beibei-cli-dev', 'template', 'node_modules');
    this.templateInfo = templateInfo;
    log.verbose('templateInfo', this.templateInfo);
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
      myCustomVersion
    });
    console.log(targetPath, storeDir,npmName, version, templateNpm );
    // 如果不存在直接安装npm， 如果存在直接更新
    if (!await templateNpm.exists()) {
      // console.log('安装 start');
      const spinner = spinnerStart('正在下载模板...');
      await sleep(5000);
      try {
        await templateNpm.install();
        // spinner.stop(true);
        this.templateNpm = templateNpm;
        if (await templateNpm.exists()) {
          log.success('下载模板成功');
        }
      } catch (error) {
        console.log('下载模板出错了～');
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('下载模板成功');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      console.log('更新 start');
      const spinner = spinnerStart('正在更新模板...');
      await sleep(5000);
      try {
        await templateNpm.update();
        console.log('更新模板start～');
        spinner.stop(true);
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
      if (await templateNpm.exists()) {
        log.success('更新模板成功');
        this.templateNpm = templateNpm;
      }
      console.log('更新后');
      }
    }
  }

  async prepare() {
    // 判断项目模板是否存在
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      throw new Error('项目模板不存在');
    }
    this.template = template;
    // 1，判断当前目录是否为空
    const localPath = process.cwd();
    const ret = this.isDirEmpty(localPath);
    if (!ret) {
      let ifContinue = false;
      // console.log(this.force, 'this.force');
      if (!this.force) {
        // 询问是否继续创建
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？'
        })).ifContinue;
        // 用户选否 直接终止流程
        if (!ifContinue) {
          return;
        }
      }
      // 2. 是否启动强制更新
      if (ifContinue || this.force) {
        // 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？',
        });
        if (confirmDelete) {
          // 清空当前目录
          fse.emptyDirSync(localPath);
        }
      }
    }
    return this.getProjectInfo();
  }

  async getProjectInfo() {
    function isValidName(v) {
      return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
    }
    let projectInfo = {};
    let isProjectNameValid = false;
    if (isValidName(this.projectName)) {
      isProjectNameValid = true;
      projectInfo.projectName = this.projectName;
    }
    // 1、选择创建项目或组件
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [{
        name: '项目',
        value: TYPE_PROJECT,
      }, {
        name: '组件',
        value: TYPE_COMPONENT,
      }],
    });
    const title = type === TYPE_PROJECT ? '项目' : '组件';
    const projectNamePrompt = {
      type: 'input',
      name: 'projectName',
      message: `请输入${title}名称`,
      default: '',
      validate: function(v) {
        const done = this.async();
        setTimeout(function() {
          // 1.首字符必须为英文字符
          // 2.尾字符必须为英文或数字，不能为字符
          // 3.字符仅允许"-_"
          if (!isValidName(v)) {
            done(`请输入合法的${title}名称`);
            return;
          }
          done(null, true);
        }, 0);
      },
      filter: function(v) {
        return v;
      },
    };
    const projectPrompt = [];
    if (!isProjectNameValid) {
      projectPrompt.push(projectNamePrompt);
    }
    projectPrompt.push({
      type: 'input',
      name: 'projectVersion',
      message: `请输入${title}版本号`,
      default: '1.0.0',
      validate: function(v) {
        const done = this.async();
        setTimeout(function() {
          if (!(!!semver.valid(v))) {
            done('请输入合法的版本号');
            return;
          }
          done(null, true);
        }, 0);
      },
      filter: function(v) {
        if (!!semver.valid(v)) {
          return semver.valid(v);
        } else {
          return v;
        }
      },
    },
    {
      type: 'list',
      name: 'projectTemplate',
      message: `请选择${title}模板`,
      choices: this.createTemplateChoice(),
    }
    );
    if (type === TYPE_PROJECT) {
      // 2. 获取项目的基本信息
      const project = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...project,
      };
    } else if (type === TYPE_COMPONENT) {
      const descriptionPrompt = {
        type: 'input',
        name: 'componentDescription',
        message: '请输入组件描述信息',
        default: '',
        validate: function(v) {
          const done = this.async();
          setTimeout(function() {
            if (!v) {
              done('请输入组件描述信息');
              return;
            }
            done(null, true);
          }, 0);
        },
      };
      projectPrompt.push(descriptionPrompt);
      // 2. 获取组件的基本信息
      const component = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...component,
      };
    }
    // 2、获取项目的基本信息


    // 生成className
    if (projectInfo.projectName) {
      projectInfo.name = projectInfo.projectName;
      projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }
    // 给用户输出 项目的基本 信息
    return projectInfo;
    // throw new Error('出错了');
  }

  isDirEmpty(localPath) {

    // console.log(localPath, 'localPath');
    // console.log(path.resolve('.'), 'path.resolve .');
    // console.log(__dirname, '__dirname'); 当前执行代码所在路径
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(file => (
      !file.startsWith('.') && (['node_modules'].indexOf(file) < 0)
    ));
    // console.log(fileList, 'fileList');
    return !fileList || fileList.length <= 0;
  }
  createTemplateChoice() {
    return this.template.map(item => ({
      value: item.npmName,
      name: item.name,
    }));
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