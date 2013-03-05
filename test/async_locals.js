/**
 * 测试异步 locals
 */

var assert = require('assert');
var common = require('./common');


describe('Async: locals', function () {
  
  var context = common.newContext();
  context.setLocals('a', 123);
  context.setSyncLocals('b', function (name) {
    return 456;
  });
  context.setAsyncLocals('c', function (name, callback) {
    setTimeout(function () {
      callback(null, 789);
    }, 50);
  });
  context.setAsyncLocals(/^d.*/, function (name, callback) {
    callback(null, name);
  });
  context.setAsyncLocals('aa', function (name, callback) {
    return callback(null, {
      a:  123,
      b: {
        c: 456
      }
    });
  });
  context.setLocals('aa.c', {
    d: {
      e: {
        f: 789
      }
    }
  });
  
  it('#normal', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, 'a={{a}},b={{b}},c={{c}},d={{d}}:{{d2}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'a=123,b=456,c=789,d=d:d2');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'aa.a={{aa.a}},aa.b.c={{aa.b.c}},aa.c.d.e.f={{aa.c.d.e.f}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'aa.a=123,aa.b.c=456,aa.c.d.e.f=789');
          context.clearBuffer();
          done();
        })
      })
      .end(done);
  });

});