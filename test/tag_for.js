var assert = require('assert');
var common = require('./common');


describe('Tag: for', function () {

  var context = common.newContext();
  context.setLocals('array', [1,2,3,4,5,6]);
  context.setLocals('object', {a:123, b:456, c:'abc'});
  context.setLocals('range_start', 1);
  context.setLocals('range_end', 5);

  it('#for', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% for array %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '123456');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '123456');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array limit:2 offset:2 %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '34');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array limit:2 %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array offset:3 %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '456');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        // 特殊格式写法
        common.render(context, '{% for item in array limit: 2 offset: 2 %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '34');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        // 特殊格式写法
        common.render(context, '{%for item in array limit: 2 offset: 2%}{{item}}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '34');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        // 参数为变量
        common.render(context, '{% for item in object %}{{item}}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '123456abc');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in (1..5) %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12345');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in (1..range_end) %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12345');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in (range_start..5) %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12345');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in (range_start..range_end) %}{{ item }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12345');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#forloop', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{% for item in array %}{{ item }}{{ forloop.first }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1true2false3false4false5false6false');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array %}{{ item }}{{ forloop.last }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1false2false3false4false5false6true');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array limit:2 %}{{ item }}{{ forloop.first }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1true2false');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array limit:2 %}{{ item }}{{ forloop.last }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1false2true');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array offset:2 %}{{ item }}{{ forloop.first }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '3true4false5false6false');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array offset:2 %}{{ item }}{{ forloop.last }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '3false4false5false6true');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for item in array limit:2 offset:2 %}{{ item }}{{ forloop.first }}{% endfor %}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '3true4false');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array%} {{forloop.index}} {%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, ' 1  2  3  4  5  6 ');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array%} {{forloop.index0}} {%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, ' 0  1  2  3  4  5 ');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array%}{{forloop.rindex0}}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '543210');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array%}{{forloop.rindex}}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '654321');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for i in array %}{{forloop.name}}={{i}},{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, 'i=1,i=2,i=3,i=4,i=5,i=6,');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{% for i in array %}{{forloop.length}}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '666666');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });
  
  it('#else', function (done) {
    context.setLocals('array2', []);
    context.setLocals('array3', null);
    common.taskList()
      .add(function (done) {
        common.render(context, '{%for item in array%}+{%else%}-{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '++++++');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array2%}+{%else%}-{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '-');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array3%}+{%else%}-{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '-');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#other', function (done) {
    context.setLocals('array4', {a:1, b:2, c:3, f:4, g:5});
    common.taskList()
      .add(function (done) {
        common.render(context, '{%for item in array4%}{{item}}{%endfor%}-{{array4.a}}{{array4.b}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '12345-12');
          context.clearBuffer();
          done();
        });
      })
      .add(function (done) {
        common.render(context, '{%for item in array limit:2%}{%for item in array offset:2%}{{item}}{%endfor%}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '34563456');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

  it('#item', function (done) {
    context.setLocals('array5', [{v:123}, {v:456}, {v:789}]);
    common.taskList()
      .add(function (done) {
        common.render(context, '{%for item in array5%}{{item.v}}{%endfor%}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '123456789');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});
