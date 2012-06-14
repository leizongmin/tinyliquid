/**
 * 普通方式获取数据并渲染
 */
 
var data = require('./data');


data.getData1(function (err, data1) {
  if (err)
    return console.log(err.stack);
  data.getData2(function (err, data2) {
    if (err)
      return console.log(err.stack);
    data.getData3(function (err, data3) {
      if (err)
        return console.log(err.stack);
      data.getData4(function (err, data4) {
        if (err)
          return console.log(err.stack);
        data.getData5(function (err, data5) {
          if (err)
            return console.log(err.stack);
          console.log(data.render({
            data1:  data1,
            data2:  data2,
            data3:  data3,
            data4:  data4,
            data5:  data5
          }));
        });
      });
    });
  });
});
