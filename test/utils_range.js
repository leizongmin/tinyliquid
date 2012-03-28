var should = require('should');
var utils = require('../lib/utils');

describe('utils.range()', function () {
  
  it('#range ', function () {
    utils.range(1, 2).should.eql([1,2]);
    utils.range(1, 5).should.eql([1,2,3,4,5]);
    utils.range(3, 5).should.eql([3,4,5]);
    utils.range(0, 5).should.eql([0,1,2,3,4,5]);
    utils.range(-5, 5).should.eql([-5,-4,-3,-2,-1,0,1,2,3,4,5]);
    utils.range(5, -5).should.eql([]);
    utils.range({}, -5).should.eql([]);
  });
  
});