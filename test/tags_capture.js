var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#capture', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    
    render('{% capture attribute_name %}{{ item.title | handleize }}-{{ i }}-color{% endcapture %}\
{{ attribute_name }}',
      {item: {title: 'OK'}, i: 123}, {handleize: function (a) { return a; }}).should.equal('OK-123-color');
        
    render('YY-{% capture name %}{{ title }}-{{ page }}{% endcapture %}\
{% if name %}{{ name }}{% else %}Fuck!{% endif %}-End',
      {title: 'Cat', page: 12}).should.equal('YY-Cat-12-End');    
        
    render('Number:{% capture a%}{% for i in (1..10) %}{{i}}{%endfor%}{% endcapture %}{% capture b%}{% for i in (1..5) %}0{{i}}{%endfor%}{% endcapture %}'
         + '{{a}} and {{b}}').should.equal('Number:12345678910 and 0102030405');
  });
});