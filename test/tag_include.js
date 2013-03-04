/**
 * 测试 include 标签
 */

var assert = require('assert');
var common = require('./common');


describe('Tag: include', function () {
  
  var context = common.newContext();
  context.onInclude(function (name, callback) {
    switch (name) {
      case 'file1':
        var tpl = 'abc-{{a}}';
        break;
      case 'file2':
        var tpl = 'efg-{% include "file1" %}-end';
        break;
      case 'file3':
        var tpl = 'b={{b}}';
        break;
      default:
        var tpl = '';
    }
    return callback(null, common.parse(tpl));
  });

  it('#include', function (done) {
    context.setLocals('a', 123);
    context.setLocals('b', 456);
    context.setLocals('c', {
      b: 789
    });
    common.taskList()
      .add(function (done) {
        common.render(context, 'hello,{% include "file1" %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,abc-123.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'hello,{% include "file2" %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,efg-abc-123-end.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'b={{b}},{% include "file3" with c %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'b=456,b=789');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  
});