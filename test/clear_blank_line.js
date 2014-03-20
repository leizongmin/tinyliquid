var assert = require('assert');
var common = require('./common');


describe('clear blank line', function () {

  var context = common.newContext();

  it('#normal', function (done) {
    common.taskList()
      .add(function (done) {
        context._isAutoEscape= false;
        common.render(context, '{% if true %}\nhello\n{% endif %}\nend', function (err, buf) {
          console.log(buf);
          assert.equal(err, null);
          assert.equal(buf, 'hello\nend');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        context._isAutoEscape= false;
        common.render(context, '{% if true %} a \nhello\n{% endif %}\nend', function (err, buf) {
          console.log(buf);
          assert.equal(err, null);
          assert.equal(buf, ' a \nhello\nend');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});