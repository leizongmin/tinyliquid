var assert = require('assert');
var common = require('./common');


describe('Locals', function () {

  var context = common.newContext();
  context.setLocals('a', 123);
  var bc = 0;
  context.setSyncLocals('b', function (name) {
    var v = {
      a: 123 + bc,
      b: 456 + bc
    };
    bc++;
    return v;
  });
  var cc = 0;
  context.setAsyncLocals('c', function (name, callback) {
    setTimeout(function () {
      var v = {
        a: 345 + cc,
        b: 678 + cc
      };
      cc++;
      callback(null, v);
    }, 50);
  });
  var dc = {};
  context.setAsyncLocals(/^d.*/, function (name, callback) {
    if (!dc[name]) dc[name] = 0;
    dc[name]++;
    callback(null, dc[name]);
  });

  it('#normal', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, 'b.a={{b.a}},b.b={{b.b}},b.a={{b.a}},b.b={{b.b}}', function (err, buf) {
          //console.log(buf);
          assert.equal(err, null);
          assert.equal(buf, 'b.a=123,b.b=456,b.a=123,b.b=456');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'c.a={{c.a}},c.b={{c.b}},c.a={{c.a}},c.b={{c.b}}', function (err, buf) {
          //console.log(buf);
          assert.equal(err, null);
          assert.equal(buf, 'c.a=345,c.b=678,c.a=345,c.b=678');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'd.a={{d.a}},d.b={{d.b}},d.a={{d.a}},d.b={{d.b}}', function (err, buf) {
          //console.log(buf);
          assert.equal(err, null);
          assert.equal(buf, 'd.a=1,d.b=1,d.a=1,d.b=1');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});