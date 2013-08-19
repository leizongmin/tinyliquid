var assert = require('assert');
var common = require('./common');
var me = common.me;

describe('Module exports', function () {
  
  it('#parse & run & newContext', function (done) {
    var ast = me.parse('value={{a}}');
    assert.equal(Array.isArray(ast), true);
    var c = me.newContext();
    c.setLocals('a', 123);
    me.run(ast, c, function (err) {
      assert.equal(err, null);
      assert.equal(c.clearBuffer(), 'value=123');
      done();
    });
  });

  it('#compile', function (done) {
    var render = me.compile('value={{a}}');
    var c = me.newContext();
    c.setLocals('a', 789);
    render(c, function (err, text) {
      assert.equal(err, null);
      assert.equal(text, 'value=789');
      done();
    });
  });

  it('#insertFilename - 1', function (done) {
    var ast = me.parse('just for test');
    ast = me.insertFilename(ast, 'test.liquid');
    var c = me.newContext();
    me.run(ast, c, function (err) {
      assert.equal(err, null);
      assert.equal(c.clearBuffer(), 'just for test');
      done();
    });
  });

  it('#insertFilename - 2', function (done) {
    var ast = me.parse('this is file1. {% include "file2" %} {% include "file3" %}');
    ast = me.insertFilename(ast, 'file1');
    var c = me.newContext();
    c.onInclude(function (name, callback) {
      var ast= me.parse('this is ' + name + '.' + (name === 'file3' ? ' {% include "file4" %}' : ''));
      ast = me.insertFilename(ast, name);
      //console.log(this._filenameStack);
      callback(null, ast);
    });
    me.run(ast, c, function (err) {
      assert.equal(err, null);
      assert.equal(c.clearBuffer(), 'this is file1. this is file2. this is file3. this is file4.');
      done();
    });
  });
  
});