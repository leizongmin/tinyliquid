var should = require('should');
var utils = require('../lib/utils');

describe('utils.split()', function () {
  
  it('#split ', function () {
    utils.split('abc').should.eql(['abc']);
    utils.split('"abc"').should.eql(['"abc"']);
    utils.split('123').should.eql(['123']);
    utils.split('apple and banana').should.eql(['apple', 'and', 'banana']);
    utils.split('"apple and banana"').should.eql(['"apple and banana"']);
  });
  
});