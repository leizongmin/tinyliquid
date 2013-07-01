var assert = require('assert');
var common = require('./common');

describe('Throws error', function () {
  
  it('#locals unexpected error - callback', function (done) {
    var context = common.newContext();
    var unexpectedErr = new Error('unexpected');
    context.setAsyncLocals('a', function (name, callback) {
      setTimeout(function () {
        return callback(unexpectedErr);
      }, 20);
    });
    common.render(context, 'a={{a}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err, unexpectedErr);
      done();
    });
  });

  it('#undefined filter', function (done) {
    var context = common.newContext();
    context.setLocals('a', 123);
    common.render(context, '{{a | my_filter}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err.code, 'UNDEFINED_FILTER');
      done();
    });
  });

  it('#filter unexpected error - callback', function (done) {
    var context = common.newContext();
    context.setLocals('a', 123);
    var unexpectedErr = new Error('unexpected');
    context.setAsyncFilter('my_filter', function (a, callback) {
      setTimeout(function () {
        return callback(unexpectedErr);
      }, 20);
    });
    common.render(context, '{{a | my_filter}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err, unexpectedErr);
      done();
    });
  });

  it('#filter unexpected error - throw', function (done) {
    var context = common.newContext();
    context.setLocals('a', 123);
    var unexpectedErr = new Error('unexpected');
    context.setAsyncFilter('my_filter', function (a, callback) {
      throw callback(unexpectedErr);
    });
    common.render(context, '{{a | my_filter}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err, unexpectedErr);
      done();
    });
  });
  /*
  it('#filter unexpected error - throw - cannot catch', function (done) {
    var context = common.newContext();
    context.setLocals('a', 123);
    var unexpectedErr = new Error('unexpected');
    context.setAsyncFilter('my_filter', function (a, callback) {
      setTimeout(function () {
        throw callback(unexpectedErr);
      }, 20);
    });
    common.render(context, '{{a | my_filter}}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err, unexpectedErr);
      done();
    });
  });
  */
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

  it('#include file unexpected error - callback', function (done) {
    var context = common.newContext();
    var unexpectedErr = new Error('unexpected');
    context.onInclude(function (name, callback) {
      setTimeout(function () {
        unexpectedErr.name = name;
        return callback(unexpectedErr);
      }, 20);
    });
    common.render(context, '{% include "abc" %}', function (err, buf) {
      assert.notEqual(err, null);
      assert.equal(err, unexpectedErr);
      assert.equal(err.name, 'abc');
      done();
    });
  });

});