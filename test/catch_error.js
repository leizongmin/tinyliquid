var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#catch error', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{{name}}');
  
    render('{{ name }}');
  
    render('{% for items %}{{ item }}{{ endif}}');
    
    render('{% for items %}{{ item }}{% endif %}');
    
    render('{% if a %}hello');
    
    render('{% if a %}hello{% endfor %}');
    
  });
});