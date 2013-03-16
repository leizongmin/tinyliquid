var assert = require('assert');
var common = require('./common');


describe('Tag: tablerow', function () {
  
  var context = common.newContext();
  context.setLocals('data', [1,2,3,4,5,6]);

  it('#tablerow', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% tablerow n in data cols:3%}{{n}}{% endtablerow %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '<tr class="row1"><td class="col1">1</td><td class="col2">2</td><td class="col3">3</td></tr><tr class="row2"><td class="col1">4</td><td class="col2">5</td><td class="col3">6</td></tr>');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% tablerow n in data cols:5%}{{n}}{% endtablerow %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '<tr class="row1"><td class="col1">1</td><td class="col2">2</td><td class="col3">3</td><td class="col4">4</td><td class="col5">5</td></tr><tr class="row2"><td class="col1">6</td></tr>');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  
});
