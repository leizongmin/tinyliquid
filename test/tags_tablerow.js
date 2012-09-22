var should = require('should');
var liquid = require('../');

describe('Tag: tablerow', function () {
  
  it('#tablerow', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      //console.log(fn.toString());
      var html = fn(data, filters);
      return html;
    }
    
    var data = [1,2,3,4,5,6];
    
    
    render('{% tablerow n in numbers cols:cols%} {{n}} {% endtablerow %}', {numbers: data, cols:3})
      .should.equal('<tr class=\"row1\">\n<td class=\"col1\"> 1 </td><td class=\"col2\"> 2 </td><td class=\"col3\"> 3 </td></tr>\n<tr class=\"row2\">\n<td class=\"col1\"> 4 </td><td class=\"col2\"> 5 </td><td class=\"col3\"> 6 </td></tr>\n');
     
    render('{% tablerow n in numbers cols:5%} {{n}} {% endtablerow %}', {numbers: data})
      .should.equal('<tr class=\"row1\">\n<td class=\"col1\"> 1 </td><td class=\"col2\"> 2 </td><td class=\"col3\"> 3 </td><td class=\"col4\"> 4 </td><td class=\"col5\"> 5 </td></tr>\n<tr class=\"row2\">\n<td class=\"col1\"> 6 </td></tr>\n');
     
    render('{% tablerow n in numbers cols:2%}{{tablerowloop.col}}{% endtablerow %}', {numbers: data})
      .should.equal('<tr class=\"row1\">\n<td class=\"col1\">1</td><td class=\"col2\">2</td></tr>\n<tr class=\"row2\">\n<td class=\"col1\">1</td><td class=\"col2\">2</td></tr>\n<tr class=\"row3\">\n<td class=\"col1\">1</td><td class=\"col2\">2</td></tr>\n');
  });

});