'use strict';

/**
 * 构建用于浏览器端的库
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
 
var fs = require('fs');
var path = require('path');
var tinyliquid = require('../');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;


/**
 * 读取模块文件
 *
 * @param {string} name
 * @return {string}
 */
var readModuleFile = function (name) {
  if (name === 'index')
    var filename = path.resolve('../index.js');
  else
    var filename = path.resolve('../lib', path.basename(name));
  var content = fs.readFileSync(filename, 'utf8');
  return content.replace(/require\s*\(\s*['"].*['"]\s*\)/mg, function (name) {
    var mn = /require\s*\(\s*['"](.*)['"]\s*\)/.exec(name)[1];
    return 'modules.' + path.basename(mn, '.js');
  });
};

/**
 * 压缩js代码
 *
 * @param {string} code
 * @return {string}
 */
var compress = function (code) {
  var ast = jsp.parse(code);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
};

/**
 * 读入各个模块
 *
 * @return {object}
 */
var readAllFiles = function () {
  var models = {
    main:     readModuleFile('index'),
    files:    {}
  };
  var dir = fs.readdirSync(path.resolve('../lib'));
  for (var i in dir) {
    if (path.extname(dir[i]) === '.js') {
      models.files[path.basename(dir[i], '.js')] = readModuleFile(dir[i])
    }
  }
  return models;
};

/**
 * 渲染指定模板
 *
 * @param {object} files
 * @param {string} name
 */
var renderTemplate = function (files, name) {
  var template = fs.readFileSync(name + '.liquid', 'utf8');
  var output = tinyliquid.render(template, files);
  fs.writeFileSync('./target/' + name + '.js', output);
  fs.writeFileSync(path.resolve('./target/' + name + '.min.js'), compress(output));
  console.log('    ' + path.resolve('./target/' + name + '.js'));
  console.log('    ' + path.resolve('./target/' + name + '.min.js'));
};




process.chdir(__dirname);
var files = readAllFiles();
renderTemplate(files, 'tinyliquid');
