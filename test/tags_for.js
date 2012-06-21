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
      
    // 特殊格式写法
    render('{% for item in array limit: 2 offset: 2 %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6]}).should.equal('34');
      
    render('{%for item in array limit: 2 offset: 2%}{{item}}{%endfor%}',
      {array: [1,2,3,4,5,6]}).should.equal('34');
      
    // 参数为变量
    render('{% for item in array limit:limit offset:offset %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6], limit:2, offset:2}).should.equal('34');
    
    render('{% for item in array limit:limit %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6], limit:2}).should.equal('12');
      
    render('{% for item in array offset:offset %}{{ item }}{% endfor %}',
      {array: [1,2,3,4,5,6], offset:3}).should.equal('456');
      
    // 循环变量为对象
    render('{% for item in object %}{{item}}{% endfor %}', {object: {a:123, b:456, c:'abc'}})
      .should.equal('123456abc');
      
  });
  
  
  
  it('#forloop', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
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
      
    render('{%for item in array%} {{forloop.index}} {%endfor%}', {array: [1,2,3]})
      .should.equal(' 1  2  3 ');
      
    render('{%for item in array%} {{forloop.index0}} {%endfor%}', {array: [1,2,3]})
      .should.equal(' 0  1  2 ');
    
    render('{%for item in array%} {{forloop.rindex0}} {%endfor%}', {array: [1,2,3]})
      .should.equal(' 2  1  0 ');
    
    render('{%for item in array%} {{forloop.rindex}} {%endfor%}', {array: [1,2,3]})
      .should.equal(' 3  2  1 ');
      
    render('{% for i in array %}{{forloop.name}}={{i}}{% unless forloop.last%},{%endunless%}{%endfor%}', {array: [1,2,3]})
      .should.equal('i=1,i=2,i=3');
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
  
  it('#for...else...endfor', function () {
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{%for item in array%}+{%else%}-{%endfor%}', {array: [1,2,3]}).should.equal('+++');
    render('{%for item in array%}+{%else%}-{%endfor%}', {array: []}).should.equal('-');
    render('{%for item in array%}+{%else%}-{%endfor%}', {array: null}).should.equal('-');
  });
  
  it('#strict', function () {
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    render('{%for item in array limit:1%}{{item}}{%endfor%}-{%for item in array limit:2 offset:1%}{{item}}{%endfor%}'
          + '-{%for item in array%}{{item}}{%endfor%}', {array: [1,2,3,4,5]})
      .should.equal('1-23-12345');
    render('{%for item in array%}{{item}}{%endfor%}-{{array.a}}{{array.b}}', {array: {a:1, b:2, c:3, f:4, g:5}})
      .should.equal('12345-12');
  });
});