var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
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
     
    render('{%assign sum = 0%}{%assign i = 10%}{%tablerow i in (1..10) cols:1%}\
{%assign sum = sum | plus: i%}{%endtablerow%}{{sum}}')
      .should.equal('55');
      
    render('{%assign sum = 0%}{%tablerow i in (1..10) cols:2%}\
{%assign sum = sum | plus: tablerowloop.index%}{%endtablerow%}{{sum}}', {tablerowloop: {index: 10}})
      .should.equal('55'); 
     
  });
});