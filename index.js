/**
 * 对外接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

 
// 版本
exports.version = require('./package.json').version;


// 解析模板，返回中间件代码
var parser = require('./lib/parser');
exports.parser = parser;
exports.parse = function () {
  return parser.apply(null, arguments);
};


// 执行中间代码
var vm = require('./lib/vm');
exports.run = vm.run;


// 执行中间件代码时的环境对象
exports.Context = vm.Context;


// 工具函数
exports.utils = require('./lib/utils');
