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
      {item: {title: 'OK'}}, {handleize: function (a) { return a; }}).should.equal('OK--color');
        
    render('YY-{% capture name %}{{ title }}-{{ page }}{% endcapture %}\
{% if name %}{{ name }}{% else %}Fuck!{% endif %}-End',
      {title: 'Cat', page: 12}).should.equal('YY-Cat-12-End');    
        
  });
});