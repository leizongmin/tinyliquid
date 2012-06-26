var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#Array & String', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      var html = fn(data, filters);
      return html;
    }
    
    render('{{str}}.size={{str.size}}', {str: 'abcdefg'})
      .should.equal('abcdefg.size=7');
  
    render('size={{arr.size}},first={{arr.first}},last={{arr.last}}', {arr: [1,4,3,2,3,5,4]})
      .should.equal('size=7,first=1,last=4');
  
  });
});