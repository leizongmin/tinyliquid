var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#assign', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
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
    return;
      
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
  });
});