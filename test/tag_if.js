var assert = require('assert');
var common = require('./common');


describe('Tag: if', function () {
  
  var context = common.newContext();
  context.setLocals('array', [1,2,3,4,5]);
  context.setLocals('object', {a: 1, b: 2, c: 3, d: 4, e: 5});

  it('#if', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% if true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true %}YES{% endif %}-END', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES-END');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% endif %}-END', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '-END');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if not true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if not false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true and true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true && true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true and false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false and false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true or true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true || true %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if true or false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false or false %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 > 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 < 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 >= 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 3 >= 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 < 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 3 <= 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 <= 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 3 <= 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 = 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 3 == 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 == 1 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 == "1" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 === 1 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 === "1" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 != 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if 1 != 1 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if "abcd" contains "c" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if "abcd" contains "e" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if array hasValue 1 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if array hasValue 6 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if object hasValue 2 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if object hasValue 6 %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if object hasKey "a" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if object hasKey "x" %}YES{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'NO');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#else', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif true %}YES2{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES2');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif true %}YES2{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES2');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif false %}YES2{% elseif true %}YES3{% else %}NO{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES3');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif false %}YES2{% elseif true %}YES3{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'YES3');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif false %}YES2{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% if false %}YES{% elseif false %}YES2{% elseif false %}YES3{% endif %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});
