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
  
});