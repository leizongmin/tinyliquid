var should = require('should');
var liquid = require('../');

describe('Tag: assign', function () {
  
  it('#assign', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{% assign freestyle = false %}{{ freestyle }}',
      {freestyle: true}).should.equal('false');
      
    render('{{ freestyle }}',
      {freestyle: true}).should.equal('true');
    
    render('{% assign value = \'1\' %}{{ value }}',
      {freestyle: true}).should.equal('1');
    
    render('{% assign value = 12 %}{{ value }}',
      {freestyle: true}).should.equal('12');
    
    render('{% assign value = true %}{{ value }}',
      {freestyle: true}).should.equal('true');
      
    render('{% assign value = [] %}{{value}}').should.equal('');
    
    render('{% assign value = array() %}{{value}}').should.equal('');
    
    render('{% assign value = {} %}{% assign value.a = 20 %}{{value.a}}').should.equal('20');
    
    render('{% assign value = object() %}{% assign value.a = 50 %}{{value.a}}').should.equal('50');
    
    render('{% assign value = {"a":55} %}{{value.a}}').should.equal('55');
    
    render('{% assign value = "HeLlO" | downcase %}{{ value }}',
      {downcase: function (x) { return x.toLowerCase(); }
      }).should.equal('hello');
      
    render('{% assign value = 1 | plus: 2 | minus: 3 %}1+2-3={{ value }}',
      {plus: function (a, b) { return a + b; },
       minus: function (a, b) { return a - b; }
      }).should.equal('1+2-3=0');
      
    render('{% assign freestyle = false %}\
{% for t in collections.tags %}{% if t == \'freestyle\' %}\
{% assign freestyle = true %}\
{% endif %}{% endfor %}\
{% if freestyle %}\
  <p>Freestyle!</p>\
{% endif %}', {collections: {tags: ['cat', 'hat', 'pen']}})
      .should.equal('');
      
    render('{% assign freestyle = false %}\
{% for t in collections.tags %}{% if t == \'freestyle\' %}\
{% assign freestyle = true %}\
{% endif %}{% endfor %}\
{% if freestyle %}\
<p>Freestyle!</p>\
{% endif %}', {collections: {tags: ['cat', 'hat', 'freestyle', 'pen']}})
      .should.equal('<p>Freestyle!</p>');
     
    
    render('{% assign sum = 0 %}{% for i in (1..10) %}{% assign sum = i | plus: sum %}\
{% endfor %}{{ sum }}', {})
      .should.equal('55');
    
    
    // loop局部变量优先
    render('{%assign sum = 0%}{%assign i = 10%}{%for i in (1..10)%}\
{%assign sum = sum | plus: i%}{%endfor%}{{sum}}')
      .should.equal('55');
      
    render('{%assign sum = 0%}{%for i in (1..10)%}\
{%assign sum = sum | plus: forloop.index%}{%endfor%}{{sum}}', {forloop: {index: 10}})
      .should.equal('55');

    // 在loop内部定义的变量可用
    render('{% for i in (0..9) %}{% assign j = i %}{{j}}{% endfor %}-{{j}}')
      .should.equal('0123456789-9');

    // 嵌套多个forloop
    render('{% assign sum = 0 %}{% for i in (0..9) %}{% for j in (0..9) %}{% assign sum = sum | plus: j %}{% endfor %}{% endfor %}{{sum}}')
      .should.equal('450');

    render('{% for i in (0..9) %}{% assign sum = 0 %}{% for j in (0..9) %}{% assign sum = sum | plus: j %}{% endfor %}{{sum}}{% endfor %}')
      .should.equal('45454545454545454545');
     
  });

  it('#include file', function () {

    var files = {
      abc:  liquid.parse('{{ name }}').code
    };

    var render = function (text, data, filters, options) {
      options = options || {};
      options.original = true;
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text, options);
      //console.log(fn.toString());
      //console.log(fn);
      var html = fn(data, filters);
      return html;
    };

    render('{% assign name = "老雷" %}{% include "abc" %}hello, all',
      {}, {}, {files: files}).should.equal('老雷hello, all');
  });
});