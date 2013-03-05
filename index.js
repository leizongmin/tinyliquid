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
exports.run = function () {
  if (arguments.length < 1) throw new Error('Not enough arguments.');
  var originCallback = arguments[arguments.length - 1];
  var hasCallback = false;
  var callback = function (err) {
    // 保证回调函数只执行一次
    if (hasCallback) return;
    hasCallback = true;
    originCallback.apply(null, arguments);
  };
  arguments[arguments.length - 1] = callback;
  // 如果抛出异常，以回调方式返回
  try {
    vm.run.apply(null, arguments);
  } catch (err) {
    callback(err);
  }
};


// 执行中间件代码时的环境对象
exports.Context = require('./lib/context');


// 工具函数
exports.utils = require('./lib/utils');
