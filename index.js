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

/**
 * 解析模板
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Array}
 */
exports.parse = function (tpl, options) {
  return parser.apply(null, arguments);
};


// 执行中间代码
var domain = require('domain');
var vm = require('./lib/vm');

/**
 * 执行中间件代码
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
exports.run = function (astList, context, callback) {
  var d = domain.create();
  if (arguments.length < 3) throw new Error('Not enough arguments.');

  // 如果astList不是数组，表示为解析，则先解析
  if (!Array.isArray(astList)) astList = parser(astList);

  // 保证回调函数只执行一次
  var originCallback = callback;
  var hasCallback = false;
  var callback = function (err) {
    if (hasCallback) return;
    hasCallback = true;
    clearTimeout(tid);
    d.dispose();
    originCallback.apply(null, arguments);
  };
  
  // 如果抛出异常，以回调方式返回
  d.on('error', callback);
  d.run(function () {
    vm.run.apply(null, [astList, context, callback]);
  });

  // 设置超时时间
  var tid = setTimeout(function () {
    callback(new Error('Timeout.'));
  }, context.options.timeout);
};


// 执行中间件代码时的环境对象
exports.Context = require('./lib/context');


// 工具函数
exports.utils = require('./lib/utils');


// 默认的filters
exports.filters = require('./lib/filters');
