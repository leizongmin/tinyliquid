/**
 * 测试异步 filter
 */

var assert = require('assert');
var common = require('./common');


describe('Async: filter', function () {
  
  var context = common.newContext();
  context.setFilter('a', function (v) {
    return 'sync:' + v;
  });
  context.setAsyncFilter('b', function (v, callback) {
    setTimeout(function () {
      callback(null, 'async:' + v);
    }, 50);
  });

  it('#normal', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, 'a={{123|a}},b={{456|b}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'a=sync:123,b=async:456');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  return;
  it('#timeout', function (done) {
    context.options.timeout = 100;
    context.setAsyncFilter('c', function (v, callback) {
      callback(new Error('....'))
    })
    common.taskList()
      .add(function (done) {
        common.render(context, 'c={{789|c}}', function (err, buf) {
          console.log(typeof err);
          assert.ok(err instanceof Error);
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});