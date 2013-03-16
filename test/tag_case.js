var assert = require('assert');
var common = require('./common');


describe('Tag: case', function () {
  
  it('#case', function (done) {
    var context = common.newContext();
    context.setLocals('va', 1)
    common.taskList()
      .add(function (done) {
        common.render(context, '{% case va %}{% when 1 %}A{% when 2 %}B{% endcase %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'A');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% case va %}{% when 0 %}A{% when 2 or 1 %}B{% endcase %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'B');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% case va %}{% when 0 %}A{% when 2 or 3 %}B{%else%}C{% endcase %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'C');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  
});