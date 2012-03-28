var should = require('should');
var utils = require('../lib/utils');

describe('utils.tableSplit()', function () {
  
  it('#tableSplit ', function () {
    
    var data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    
    utils.tableSplit(data, 5).should.eql([
      [1,2,3,4,5], [6,7,8,9,10], [11,12,13,14,15], [16,17,18,19,20]
    ]);
    
    utils.tableSplit(data, 8).should.eql([
      [1,2,3,4,5,6,7,8], [9,10,11,12,13,14,15,16], [17,18,19,20]
    ]);
    
    utils.tableSplit(data, 8, 5).should.eql([
      [6,7,8,9,10,11,12,13], [14,15,16,17,18,19,20]
    ]);
    
    utils.tableSplit(data, 8, 5, 10).should.eql([
      [6,7,8,9,10,11,12,13], [14, 15]
    ]);
    
  });
  
});