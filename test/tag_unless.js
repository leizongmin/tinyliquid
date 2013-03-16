var assert = require('assert');
var common = require('./common');


describe('Tag: unless', function () {
  
  var context = common.newContext();
  context.setLocals('array', [1,2,3,4,5]);
  context.setLocals('object', {a: 1, b: 2, c: 3, d: 4, e: 5});

  it('#unless', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% unless true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true %}YES{% endunless %}-END', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '-END');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless false %}YES{% endunless %}-END', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES-END');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless not true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless not false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true and true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true && true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true and false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless false and false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true or true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true || true %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless true or false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% unless false or false %}YES{% else %}NO{% endunless %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  
});
