var should = require('should');
var utils = require('../lib/utils');

describe('utils.toArray()', function () {
  
  it('#toArray ', function () {
    
    utils.toArray([1,2,3,4,5]).should.eql([1,2,3,4,5]);
    
    utils.toArray({a:123, b:456, c:789}).should.eql([123,456,789]);
    
    utils.toArray(123).should.eql([]);
    
  });
  
});