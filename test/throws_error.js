var assert = require('assert');
var common = require('./common');

describe('Throws error', function () {
  
  it('#undefined filter', function (done) {
    var context = common.newContext();
    context.setLocals('a', 123);
    common.render(context, '{{a | my_filter}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err.code, 'UNDEFINED_FILTER');
      done();
    });
  });

  it('#unknow tag', function (done) {
    var context = common.newContext();
    common.render(context, '{% unknow_tag %}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err.code, 'UNKNOWN_TAG');
      done();
    });
  });
  
  it('#run() not enough arguments', function (done) {
    function testErr (err) {
      assert.notEqual(err, null);
      assert.equal(/not enough arguments/img.test(err.toString()), true);
    }
    try {
      common.me.run();
      throw new Error();
    } catch (err) {
      testErr(err);
    }
    common.me.run(testErr);
    common.me.run(1, testErr);
    done();
  });

  it('#run() timeout', function (done) {
    var context = common.newContext();
    context.setTimeout(50);
    context.setAsyncFilter('timeout', function (ms, callback) {
      setTimeout(callback, ms);
    });
    common.render(context, '{{100 | timeout}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(/timeout/img.test(err.toString()), true);
      done();
    });
  });

});