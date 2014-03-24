var assert = require('assert');
var common = require('./common');
var me = common.me;

describe('Context', function () {

  it('#callFilter', function (done) {
    var c = common.newContext();
    c.setFilter('a', function (a, b) {
      return a + b;
    });
    c.setAsyncFilter('b', function (a, b, callback) {
      callback(null, a + b);
    });
    c.setFilter('c', function () {
      return 12345;
    });
    c.callFilter('a', [1, 2], function (err, s) {
      assert.equal(err, null);
      assert.equal(s, 3);
      c.callFilter('b', [4, 5], function (err, s) {
        assert.equal(err, null);
        assert.equal(s, 9);
        c.callFilter('c', function (err, s) {
          assert.equal(err, null);
          assert.equal(s, 12345);
          done();
        });
      });
    });
  });

  it('#fetchLocals - 1', function (done) {
    var c = common.newContext();
    c.setLocals('a', 123);
    c.setSyncLocals('b', function () {
      return 456;
    });
    c.setAsyncLocals('c', function (name, callback) {
      callback(null, 789);
    });
    c.fetchLocals(['a', 'b', 'c'], function (err, values) {
      assert.equal(err, null);
      assert.deepEqual(values, [123, 456, 789]);
      // do it again, will use context._astCache
      c.fetchLocals(['a', 'b', 'c'], function (err, values) {
        assert.equal(err, null);
        assert.deepEqual(values, [123, 456, 789]);
        done();
      });
    });
  });

  it('#fetchLocals - 2', function (done) {
    var c = common.newContext();
    c.setLocals('a', {v: 123});
    c.setSyncLocals('b', function () {
      return {v: 456};
    });
    c.setAsyncLocals('c', function (name, callback) {
      callback(null, {v: 789});
    });
    c.fetchLocals(['a', 'b', 'c'], function (err, values) {
      assert.equal(err, null);
      assert.deepEqual(values, [{v: 123}, {v: 456}, {v: 789}]);
      // do it again, will use context._astCache
      c.fetchLocals(['a', 'b', 'c'], function (err, values) {
        assert.equal(err, null);
        assert.deepEqual(values, [{v: 123}, {v: 456}, {v: 789}]);
        done();
      });
    });
  });

});