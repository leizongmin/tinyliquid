var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {

  it('#output and filters', function () { 
    var text = 'hello, {{ name }} -> {{ name | uppercase }}.';
    var ret = liquid.parse(text);
    //console.log(ret);
    
    var fn = liquid.compile(text);
    //console.log(fn.toString());
    var html = fn({name: 'qw'}, {uppercase: function (a) { return a.toUpperCase(); }});
    //console.log(html);
    html.should.equal('hello, qw -> QW.');
  });
  
  it('#output and filters', function () { 
    var text = 'N={{ 5 | plus: 6,7 }}';
    var ret = liquid.parse(text);
    //console.log(ret);
    
    var fn = liquid.compile(text);
    //console.log(fn.toString());
    var html = fn({name: 'qw'}, {plus: function () {
      var ret = 0;
      for (var i in arguments) {
        ret += Number(arguments[i]);
      }
      return ret;
    }});
    //console.log(html);
    html.should.equal('N=18');
  });
  
});