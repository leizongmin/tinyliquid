var assert = require('assert');
var common = require('./common');


describe('Tag: cycle', function () {
  
  it('#cycle', function (done) {
    common.taskList()
      .add(function (done) {
        common.render('{% cycle 1,"b",false %}-{% cycle 1,"b",false %}-{% cycle 1,"b",false %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1-b-false');
          done();
        });
      })
      .add(function (done) {
        common.render('{% cycle 1,"b",false %}-{% cycle 1,"b",false %}-{% cycle cc:1,"b",false %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1-b-1');
          done();
        });
      })
      .add(function (done) {
        common.render('{% cycle 1,2,3 %}{% cycle 1,2,3 %}{% cycle 1,2,3 %}{% cycle 1,2,3 %}{% cycle 1,2,3 %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12312');
          done();
        });
      })
      .end(done);
  });
  
});