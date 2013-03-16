var assert = require('assert');
var common = require('./common');


describe('Tag: comment', function () {
  
  it('#comment', function (done) {
    common.taskList()
      .add(function (done) {
        common.render('{% comment %}Hello,{% endcomment %}abc', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'abc');
          done();
        });
      })
      .add(function (done) {
        common.render('{% comment %}Hello,{{"abc"|upcase}}{% endcomment %}abc', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'abc');
          done();
        });
      })
      .end(done);
  });
  
});
