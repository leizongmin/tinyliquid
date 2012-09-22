var should = require('should');
var liquid = require('../');

describe('Tag: cycle', function () {
  
  it('#cycle', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    /*
    // 使用字符串
    render("{% cycle 'one', 'two', 'three' %},\
{% cycle 'one', 'two', 'three' %},\
{% cycle 'one', 'two', 'three' %},\
{% cycle 'one', 'two', 'three' %}")
    .should.equal('one,two,three,one');
    
    // 使用数字
    render("{% cycle 1, 2, 3 %},\
{% cycle 1, 2, 3 %},\
{% cycle 1, 2, 3 %},\
{% cycle 1, 2, 3 %}")
    .should.equal('1,2,3,1');
    
    // 使用变量 （必须是渲染之前已确定的变量）
    render("{% cycle a, b, c %},\
{% cycle a, b, c %},\
{% cycle a, b, c %},\
{% cycle a, b, c %}", {a: 'Fo', b: 2, c: 'WwZ'})
    .should.equal('Fo,2,WwZ,Fo');
      
    // 循环
    render("{% cycle 'one', 'two', 'three' %},\
{% for item in (1..3) %}\
{%  cycle 'one', 'two', 'three' %},\
{% endfor %}\
{%  cycle 'one', 'two', 'three' %}")
    .should.equal('one,two,three,one,two');
    
    // 嵌套循环
    render("{% cycle 'one', 'two', 'three' %},\
{% for item in (1..3) %}\
{% for item in (1..3) %}\
{%  cycle 'one', 'two', 'three' %},\
{% endfor %}\
{% endfor %}\
{%  cycle 'one', 'two', 'three' %}")
    .should.equal('one,two,three,one,two,three,one,two,three,one,two');
    */
    // 分组
    render("{% for item in (1..3) %}{% cycle 'group 1': 'one', 'two', 'three' %},{% endfor %}")
      .should.equal('one,two,three,');
    render("{% for item in (1..6) %}{% cycle 'group 1' : 'one', 'two', 'three' %},{% endfor %}")
      .should.equal('one,two,three,one,two,three,');
  });
});