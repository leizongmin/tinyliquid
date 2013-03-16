var assert = require('assert');
var common = require('./common');
var me = common.me;

describe('Custom tag', function () {
  
  it('#parse & run', function (done) {
    var customTags = {
      'say_hello': function (context, name, body) {
        var ast = me.parse('Hello, {{' + body.trim() + '}}!');
        context.astStack.push(ast);
      }
    };
    var c = common.newContext();
    c.setLocals('a', 'ABC');
    c.setLocals('b', 'EFG');
    common.render(c, '{% say_hello a %} {% say_hello b %}', {customTags: customTags}, function (err, text) {
      assert.equal(err, null);
      assert.equal(text, 'Hello, ABC! Hello, EFG!');
      done();
    });
  });

  it('#unknow tag', function (done) {
    var c = common.newContext();
    common.render(c, '{% wahaha %}', function (err, text) {
      assert.equal(err instanceof Error, true);
      done();
    });
  });
  
});