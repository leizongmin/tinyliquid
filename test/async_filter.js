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

  it('#cache - 1', function (done) {
    var ctx = common.newContext();
    ctx.from(context);
    var c1 = 0;
    var c2 = 0;
    function filter1 (a, callback) {
      c1++;
      callback(null, a + c1);
    }
    filter1.enableCache = true;
    function filter2 (a, callback) {
      c2++;
      callback(null, a + c2);
    }
    ctx.setAsyncFilter('filter1', filter1);
    ctx.setAsyncFilter('filter2', filter2);
    common.taskList()
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err, buf);
          assert.equal(err, null);
          assert.equal(buf, '124-124');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err, buf);
          assert.equal(err, null);
          assert.equal(buf, '124-125');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '124-126');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{789|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '791-127');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{789|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '791-128');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        assert.equal(c1, 2);
        assert.equal(c2, 5);
        done();
      })
      .end(done);
  });

  it('#cache - 2', function (done) {
    var ctx = common.newContext();
    ctx.from(context);
    var c1 = 0;
    var c2 = 0;
    function filter1 (a, callback) {
      c1++;
      callback(null, a + c1);
    }
    filter1.enableCache = true;
    function filter2 (a, callback) {
      c2++;
      callback(null, a + c2);
    }
    ctx.setAsyncFilter('filter1', filter1);
    ctx.setAsyncFilter('filter2', filter2);
    common.taskList()
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err, buf);
          assert.equal(err, null);
          assert.equal(buf, '124-124');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err, buf);
          assert.equal(err, null);
          assert.equal(buf, '124-125');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{123|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '124-126');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{789|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '791-127');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(ctx, '{{789|filter1}}-{{123|filter2}}', function (err, buf) {
          //console.log(err);
          assert.equal(err, null);
          assert.equal(buf, '791-128');
          ctx.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        assert.equal(c1, 2);
        assert.equal(c2, 5);
        done();
      })
      .end(done);
  });

});