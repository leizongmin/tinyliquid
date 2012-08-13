/**
 * 使用EventProxy来获取数据并渲染
 */
 
var EventProxy = require('eventproxy').EventProxy;
var data = require('./data');

var proxy = new EventProxy();

proxy.assign('data1', 'data2', 'data3', 'data4', 'data5',
function (data1, data2, data3, data4, data5) {
  console.log(data.render({
    data1:  data1,
    data2:  data2,
    data3:  data3,
    data4:  data4,
    data5:  data5
  }));
});

// 异步获取各个数据
data.getData1(function (err, data1) {
  if (err)
    return console.log(err.stack);
  proxy.trigger('data1', data1);
});
data.getData2(function (err, data2) {
  if (err)
    return console.log(err.stack);
  proxy.trigger('data2', data2);
});
data.getData3(function (err, data3) {
  if (err)
    return console.log(err.stack);
  proxy.trigger('data3', data3);
});
data.getData4(function (err, data4) {
  if (err)
    return console.log(err.stack);
  proxy.trigger('data4', data4);
});
data.getData5(function (err, data5) {
  if (err)
    return console.log(err.stack);
  proxy.trigger('data5', data5);
});
