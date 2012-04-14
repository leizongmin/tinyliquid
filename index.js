/**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
// 版本
exports.version = '0.0.1';
 
// 解析代码
exports.parse = require('./lib/template').parse;

// 编译函数
exports.compile = require('./lib/template').compile;

// 渲染函数
exports.render = require('./lib/template').render;

// 编译整套模板
exports.compileAll = require('./lib/advtemplate').compileAll;

// 高级渲染
exports.advRender = require('./lib/advtemplate').advRender;

// 转换为高级渲染函数
exports.toAdvRender = require('./lib/advtemplate').toAdvRender;

// 过滤器
exports.filters = require('./lib/filters');

