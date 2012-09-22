var should = require('should');
var liquid = require('../');

describe('parse: includes', function () {
  
  it('#parse() require includes', function () {
  
    liquid.parse('{% include "abc" %}')
      .includes.should.eql({abc: 1});
    
    liquid.parse('{% include "abc" %}{% include "abc" with c %}')
      .includes.should.eql({abc: 2});
    
    liquid.parse('{% include "abc" %} {{ a }} {% include "ccc" %}')
      .includes.should.eql({abc: 1, ccc: 1});
    
  });
  
});