/**
 * 使用内置的advRender()来自动获取数据并渲染
 */

var tinyliquid = require('tinyliquid');
var data = require('./data');

// 将异步获取数据函数封装为符合advRender()调用格式的函数
var wrap = function (fn) {
  return function (env, callback) {
    fn(callback);
  };
};

var models = {
  data1:    wrap(data.getData1),
  data2:    wrap(data.getData2),
  data3:    wrap(data.getData3),
  data4:    wrap(data.getData4),
  data5:    wrap(data.getData5)
};

tinyliquid.advRender(data.render, models, {}, function (err, text) {
  if (err)
    return console.log(err.stack);
  console.log(text);
});
