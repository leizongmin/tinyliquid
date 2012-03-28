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
    
    var data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    
    
    render('{% tablerow item in items cols:3 limit:12 %}{{ item }}{% endtablerow %}',
      {items:data}).should.equal('123456789101112');
      
    render('{% tablerow item in items cols:3 offset:5 limit:12 %}{{ item }}{% endtablerow %}',
      {items:data}).should.equal('67891011121314151617');
      
    render('{% tablerow item in items cols:3 limit:6 %}{{ tablerowloop.col_first }}{% endtablerow %}',
      {items:data}).should.equal('truefalsefalsetruefalsefalse');
      
    render('{% tablerow item in items cols:3 limit:6 %}{{ tablerowloop.col_last }}{% endtablerow %}',
      {items:data}).should.equal('falsefalsetruefalsefalsetrue');
    
    render('{% tablerow item in items cols:3 limit:7 %}{{ tablerowloop.col_last }}{% endtablerow %}',
      {items:data}).should.equal('falsefalsetruefalsefalsetruetrue');
      
    render('{% tablerow item in items cols:3 limit:6 %}{{ tablerowloop.col }}{% endtablerow %}',
      {items:data}).should.equal('123123');
      
    render('{% tablerow item in items cols:3 limit:6 %}{{ tablerowloop.col0 }}{% endtablerow %}',
      {items:data}).should.equal('012012'); 
    
      
    render('{% tablerow item in items cols:3 limit:5 %}\
{% if tablerowloop.col_first %}\
F:{{ item }}\
{% else %}\
|D:{{ item }}\
{% endif %}\
{% endtablerow %}', {items: data}).should.equal('F:1|D:2|D:3F:4|D:5');
      
  });

});