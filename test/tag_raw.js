var assert = require('assert');
var common = require('./common');


describe('Tag: raw', function () {
  
  it('#raw', function (done) {
    common.taskList()
      .add(function (done) {
        common.render('{% raw a %}{{"abc"|upcase|size}}{% endraw %}{{"abc"|upcase|size}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '{{"abc"|upcase|size}}3');
          done();
        });
      })
      .end(done);
  });
  
});