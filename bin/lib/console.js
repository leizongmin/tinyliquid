'use strict';

/**
 * color console
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var util = require('util');


// 文本颜色
var color = {
  info:     ['\x1B[36m', '\x1B[39m'],
  debug:    ['\x1B[32m', '\x1B[39m'],
  error:    ['\x1B[31m', '\x1B[39m'],
  warn:     ['\x1B[33m', '\x1B[39m']
};

var getMethod = function (method) {
  var c = color[method] || ['', ''];
  return function () {
    var msg = util.format.apply(null, arguments);
    console.log(c[0] + msg + c[1]);
  };
};

var methods = ['error', 'warn', 'info', 'log', 'debug'];
for (var i in methods) {
  var method = methods[i];
  exports[method] = getMethod(method);
};
