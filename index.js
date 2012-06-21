'use strict';

/**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var template = require('./lib/template');
var advtemplate = require('./lib/advtemplate');
var filters = require('./lib/filters'); 
 

// 兼容Liquid中数组和字符串的size属性
try {
  Object.defineProperty(Array.prototype, 'size', {get: function () { return this.length; }});
}
catch (err) {}
try {
  Object.defineProperty(String.prototype, 'size', {get: function () { return this.length; }});
}
catch (err) {}

// 版本
exports.version = '0.0.5';
 
// 解析代码
exports.parse = wrap('parse', template.parse);

// 编译函数
exports.compile = wrap('compile', template.compile);

// 渲染函数
exports.render = wrap('render', template.render);

// 编译整套模板
exports.compileAll = wrap('compileAll', advtemplate.compileAll);

// 高级渲染
exports.advRender = wrap('advRender', advtemplate.advRender);

// 内置函数
exports.filters = filters;

// 支持在express内渲染
exports.__express = wrap('__express', require('./lib/express'));


// 用于测试函数被调用次数及来源
function wrap (name, fn) {
  if (typeof process !== 'undefined' && process.env && /true/.test(process.env.TINYLIQUID_TEST)) {
    var i = 0;
    return function () {
      i++;
      var source = new Error().stack.split('\n').slice(2).join('\n');
      console.log('call tinyliquid.' + name + '() ' + i + ' times \n' + source);
      return fn.apply(null, arguments);
    };
  }
  else {
    return fn;
  }
};
