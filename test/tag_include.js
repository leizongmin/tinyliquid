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
      case 'file6':
        var tpl = 'a={{a}},b={{b}},c={{c}}';
        break;
      case 'file7':
        var tpl = '{% for item in arr %}{{item}},{% endfor %}{{forloop.index}}|';
        break;
      case 'file8':
        var tpl = 'v={{v}}{% assign v=234 %}';
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
        // with whitespaces
        common.render(context, 'hello,{% include {{  f2}} %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,efg-abc-123-end.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'b={{b}},{% include {{  f3  }} with c %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'b=456,b=789');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#variables & filters within include', function (done) {
    context.setLocals('a', 123);
    context.setLocals('b', 456);
    context.setLocals('c', {
      b: 789
    });
    context.setLocals('page', {
      f1: 'file1',
      f2: 'file2',
      f3: 'file3',
      f:  'file'
    });
    common.taskList()
      .add(function (done) {
        common.render(context, 'hello,{% include {{page.f|append:1}} %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,abc-123.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        // with whitespaces
        common.render(context, 'hello,{% include {{ "f" | append: "il" | append: "e2" }} %}.', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'hello,efg-abc-123-end.');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'b={{b}},{% include {{  page.f3  }} with c %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'b=456,b=789');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, 'b={{b}},{% include {{  page.f | append: 6 }} a = 111 b = 220 | plus: 2 c=222|plus:100|plus:11%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'b=456,a=111,b=222,c=333');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#nested', function (done) {
    context.setLocals('v', 789);
    common.taskList()
      .add(function (done) {
        var tpl = '{% include file4 v=123 %},v={{v}}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log('#nested', buf)
          assert.equal(buf, 'v=123,v=789');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{% include {{ "file" | append:4}} v=123 %},v={{v}}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log('#nested', buf)
          assert.equal(buf, 'v=123,v=789');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#assign can affected parent template', function (done) {
    context.setLocals('v', 789);
    common.taskList()
      .add(function (done) {
        var tpl = '{% include file8 v=123 %},v={{v}}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log('#nested', buf)
          assert.equal(buf, 'v=123,v=234');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#forloop & nested', function (done) {
    var arr = [{v:123}, {v:456}, {v:789}];
    var arr2 = [{v: 123, c: [{v: 789, c: null}, {v: 988, c: [{v: 877, c: null}]}]}, {v: 456, c: null}];
    var arr3 = [
      [123, 456, 789, 101112],
      [131415, 161718, 192021, 222324],
      [252627, 282930, 313233, 343536]
    ];
    context.setLocals('arr', arr);
    context.setLocals('arr2', arr2);
    context.setLocals('arr3', arr3);
    common.taskList()
      .add(function (done) {
        var tpl = '{% for item in arr %}{% include "file4" with item %}{% unless forloop.last %},{% endunless %}{% endfor %}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log(buf)
          assert.equal(buf, 'v=123,v=456,v=789');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{% for item in arr2 %}{% include "file5" with item %}{% unless forloop.last %},{% endunless %}{% endfor %}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log('done', buf)
          assert.equal(buf, 'v=123,v=789,v=988,v=877,v=456');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{% for item in arr3 %}{% include "file7" arr=item b=12 %}{% endfor %}';
        var ret = '123,456,789,101112,1|131415,161718,192021,222324,2|252627,282930,313233,343536,3|';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log('done', buf)
          assert.equal(buf, ret);
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});