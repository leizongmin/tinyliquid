var assert = require('assert');
var common = require('./common');


describe('Parse filters', function () {

  var context = common.newContext();

  it('#normal', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{{"a"|append:" b, c"}}', function (err, buf) {
          assert.equal(err, null);
          // console.log(buf);
          assert.equal(buf, 'a b, c');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{{"a"|append:" | b | "|append:"c"}}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log(buf);
          assert.equal(buf, 'a | b | c');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = '{{"a"|append: " | b | "| append:"c"}}';
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log(buf);
          assert.equal(buf, 'a | b | c');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = "{{ 'Test Replace' | replace: 'a', 'A' }}";
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log(buf);
          assert.equal(buf, 'Test ReplAce');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        var tpl = "{{ 'Test Replace' | replace: ' ', '%20' }}";
        common.render(context, tpl, function (err, buf) {
          assert.equal(err, null);
          // console.log(buf);
          assert.equal(buf, 'Test%20Replace');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});