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

  it('#timeout & error', function (done) {
    context.options.timeout = 100;
    context.setAsyncFilter('timeout', function (a, callback) {
      // do nothing
    });
    context.setAsyncFilter('error', function (a, callback) {
      throw new Error('Just for test.');
    });
    common.taskList()
      .add(function (done) {
        common.render(context, '{{123|timeout}}', function (err, buf) {
          assert.equal(err instanceof Error, true);
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{{123|error}}', function (err, buf) {
          assert.equal(err instanceof Error, true);
          done();
        });
      })
      .end(done);
  });

});