var assert = require('assert');
var common = require('./common');


describe('Tag: capture', function () {
  
  it('#capture', function (done) {
    common.taskList()
      .add(function (done) {
        common.render('{% capture a %}ABC{% endcapture %}{{a}}-{{a}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'ABC-ABC');
          done();
        });
      })
      .end(done);
  });

  it('#capture (no name)', function (done) {
    common.taskList()
      .add(function (done) {
        common.render('{% capture %}ABC{% endcapture %}{{a}}-{{a}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'warning: missing name in {% capture %}-');
          done();
        });
      })
      .end(done);
  });
  
});