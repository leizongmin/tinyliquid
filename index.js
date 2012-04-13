
// 解析代码
exports.parse = require('./lib/template').parse;

// 编译函数
exports.compile = require('./lib/template').compile;

// 渲染函数
exports.render = require('./lib/template').render;

// 编译整套模板
exports.compileAll = require('./lib/package').compileAll;


// 过滤器
exports.filters = require('./lib/filters');

