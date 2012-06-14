/**
 * 使用Jscex来获取数据并渲染
 */
 
var Jscex = require("jscex");
require("jscex-jit").init(Jscex);
require("jscex-async").init(Jscex);
require("jscex-async-powerpack").init(Jscex);
var Jscexify = Jscex.Async.Jscexify;
var data = require('./data');

// 将异步获取数据函数封装成Jscex异步函数
for (var i in data) {
  if (i.substr(0, 7) !== 'getData')
    continue;
  data[i + 'Async'] = Jscexify.fromStandard(data[i]);
}

eval(Jscex.compile('async', function () {
  var data1, data2, data3, data4, data5;
  try {
    data1 = $await(data.getData1Async());
    data2 = $await(data.getData2Async());
    data3 = $await(data.getData3Async()); 
    data4 = $await(data.getData4Async());
    data5 = $await(data.getData5Async());
    console.log(data.render({
      data1:  data1,
      data2:  data2,
      data3:  data3,
      data4:  data4,
      data5:  data5
    }));
  }
  catch (err) {
    console.log(err.stack);
  }
}))().start();