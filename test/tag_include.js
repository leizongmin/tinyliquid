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
      case 'file4':
        var tpl = 'v={{v}}';
        break;
      case 'file5':
        var tpl = 'v={{v}}{% if c %},{% for item in c %}{% include "file5" with item %}{% unless forloop.last %},{% endunless %}{% endfor %}{% endif %}';
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

it('#variables within include', function (done) {
    context.setLocals('a', 123);
    context.setLocals('b', 456);
    context.setLocals('c', {
      b: 789
    });
    context.setLocals('f1', 'file1');
    context.setLocals('f2', 'file2');
    context.setAsyncLocals('f3', function (name, callback) {
      callback(null, "file3");
    });
    common.taskList()
      .add(function (done) {
        common.render(context, 'hello,{% include {{f1}} %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,abc-123.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'hello,{% include {{f2}} %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,efg-abc-123-end.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'b={{b}},{% include {{f3}} with c %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'b=456,b=789');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#forloop & nested', function (done) {
    var arr = [{v:123}, {v:456}, {v:789}];
    var arr2 = [{v: 123, c: [{v: 789}, {v: 988, c: [{v: 877}]}]}, {v: 456}];
    context.setLocals('arr', arr);
    context.setLocals('arr2', arr2);
    common.taskList()
      .add(function (done) {
        var tpl = '{% for item in arr %}{% include "file4" with item %}{% unless forloop.last %},{% endunless %}{% endfor %}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          //console.log(buf)
          assert.equal(buf, 'v=123,v=456,v=789');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{% for item in arr2 %}{% include "file5" with item %}{% unless forloop.last %},{% endunless %}{% endfor %}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          //console.log('done', buf)
          assert.equal(buf, 'v=123,v=789,v=988,v=877,v=456');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});