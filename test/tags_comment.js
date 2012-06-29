var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#capture', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    
    render('{% comment %}Hello,{% endcomment %}laolei')
      .should.equal('laolei');
      
    render('{% comment %}Hello,{% endcomment %}laolei-{{msg}}-', {msg: 'wahaha'})
      .should.equal('laolei-wahaha-');
      
    render('{% comment %}{{msg}}abc{% endcomment %}laolei-{{msg}}-', {msg: 'wahaha'})
      .should.equal('laolei-wahaha-');
      
  });
});
