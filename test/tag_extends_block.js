var assert = require('assert');
var common = require('./common');


describe('Tag: extends & block', function () {

  var context = common.newContext();
  context.onInclude(function (name, callback) {
    switch (name) {
      case 'menu':
        var tpl = '{{b}}...menu...{{a}}';
        break;
      case 'parent':
        var tpl = '<html><body>{% include "menu" %}{% block foo %}{% endblock %}</body></html>';
        break;
      case 'parent1':
        var tpl = '<html><body>{% include "menu" %}{% block foo %}parent 1{% endblock %}</body></html>';
        break;
      default:
        var tpl = '';
    }
    return callback(null, common.parse(tpl));
  });

  it('#include', function (done) {
    context.setLocals('a', 123);
    context.setLocals('b', 456);
    context.setLocals('c', 789);
    common.taskList()
      .add(function (done) {
        var c = common.newContext();
        c.from(context);
        common.render(c, '{% extends "parent" %}{% block foo %}Foo text{% endblock %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '<html><body>456...menu...123Foo text</body></html>');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var c = common.newContext();
        c.from(context);
        common.render(c, '{% extends "parent" %}{% block foo %}Another kid {{c}}{% endblock %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '<html><body>456...menu...123Another kid 789</body></html>');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var c = common.newContext();
        c.from(context);
        common.render(c, '{% extends "parent1" %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '<html><body>456...menu...123parent 1</body></html>');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});