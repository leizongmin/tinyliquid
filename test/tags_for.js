var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#for', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{% for array %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('123456');
     
    render('{% for item in array %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('123456');
    
    render('{% for item in array limit:2 offset:2 %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('34');
    
    render('{% for item in array limit:2 %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('12');
      
    render('{% for item in array offset:3 %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('456');
      
  });
  
  
  
  it('#forloop.last and forloop.first', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{% for item in array %}{{ item }}{{ forloop.first }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('1true2false3false4false5false6false');
      
    render('{% for item in array %}{{ item }}{{ forloop.last }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('1false2false3false4false5false6true');
      
      
    render('{% for item in array limit:2 %}{{ item }}{{ forloop.first }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('1true2false');
    
    render('{% for item in array limit:2 %}{{ item }}{{ forloop.last }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('1false2true');
    
    
    render('{% for item in array offset:2 %}{{ item }}{{ forloop.first }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('3true4false5false6false');
      
    render('{% for item in array offset:2 %}{{ item }}{{ forloop.last }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('3false4false5false6true');
    
    render('{% for item in array limit:2 offset:2 %}{{ item }}{{ forloop.first }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('3true4false');
      
    render('{% for item in array limit:2 offset:2 %}{{ item }}{{ forloop.last }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('3false4true');
  });
  
  it('#range', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
  
    render('{% for item in (1..5) %}{{ item }}{% endfor %}',
      {}).should.equal('12345');
      
    render('{% for item in (1..length) %}{{ item }}{% endfor %}',
      {length: 6}).should.equal('123456');
      
    render('{% for item in (start..length) %}{{ item }}{% endfor %}',
      {start:2, length: 6}).should.equal('23456');
      
    render('{% for item in (1..length) limit:2 %}{{ item }}{% endfor %}',
      {length: 6}).should.equal('12');
      
    render('{% for item in (1..length) limit:2 offset:2 %}{{ item }}{% endfor %}',
      {length: 6}).should.equal('34');
      
  });
});