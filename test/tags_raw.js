var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {

  it('#tags raw / endraw', function () {
    var text = '{% raw %}{{ 5 | plus: 6 }}{% endraw %} is equal to {{ 5 | plus: 6 }}.';
    var ret = liquid.parse(text);
    //console.log(ret);
    
    var fn = liquid.compile(text);
    //console.log(fn.toString());
    var html = fn({}, {plus: function () {
      var ret = 0;
      for (var i in arguments) {
        ret += Number(arguments[i]);
      }
      return ret;
    }});
    
    //console.log(html);
    html.should.equal('{{ 5 | plus: 6 }} is equal to 11.'); 
  });

});