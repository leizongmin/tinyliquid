var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#include', function () {
  
    var files = {
      abc:  liquid.parse('{{ name }}').code
    };
    //console.log(files);
    
    var render = function (text, data, filters, options) {
      options = options || {};
      options.original = true;
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text, options);
      //console.log(fn.toString());
      console.log(fn);
      var html = fn(data, filters);
      return html;
    }
    
    render('{% include "abc" %}hello, all',
      {}, {}).should.equal('hello, all');
    
    render('{% include "abc" %}hello, all',
      {name: '老雷'}, {}, {files: files}).should.equal('老雷hello, all');
    
    render('{% include "abc" with a %}hello, all',
      {a: {name: '老雷'}}, {}, {files: files}).should.equal('老雷hello, all');
    
  });
  
});