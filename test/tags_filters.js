var should = require('should');
var liquid = require('../');

describe('filters', function () {

  var render = function (text, data, filters) {
    //console.log(liquid.parse(text).code);
    var fn = liquid.compile(text);
    //console.log(fn.toString());
    var html = fn(data, filters);
    return html;
  };

  it('#output and filters #1', function () { 
    render('hello, {{ name }} -> {{ name | uppercase }}.', {name: 'qw'}, {
      uppercase: function (a) {
        return a.toUpperCase();
      }
    }).should.equal('hello, qw -> QW.');
  });

  it('value: undefined & null & false', function () {
    render('a={{a}},b={{b}},c={{c}},d={{d}}', {a: null, b: undefined, c:false, d:123})
      .should.equal('a=,b=,c=false,d=123');
  });
  
});