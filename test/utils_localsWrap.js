var should = require('should');
var utils = require('../lib/utils');

describe('utils.split()', function () {
  
  it('#localsWrap ', function () {
    utils.localsWrap('123').should.equal('123');
    utils.localsWrap('123.456').should.equal('123.456');
    utils.localsWrap('"123"').should.equal('"123"');
    utils.localsWrap('true').should.equal('true');
    utils.localsWrap('false').should.equal('false');
    utils.localsWrap('blank').should.equal('blank');
    utils.localsWrap('nil').should.equal('nil');
    utils.localsWrap('null').should.equal('null');
    utils.localsWrap('empty').should.equal('empty');
    utils.localsWrap('abc').should.equal('locals.abc');
    utils.localsWrap('abc123').should.equal('locals.abc123');
    utils.localsWrap('_abc').should.equal('locals._abc');
    utils.localsWrap('0abc').should.equal('"0abc"');
    utils.localsWrap('"abc').should.equal('"\\"abc"');
    utils.localsWrap('abc efg').should.equal('"abc efg"');
    utils.localsWrap('abc.efg').should.equal('locals.abc.efg');
    utils.localsWrap('abc.efg.').should.equal('"abc.efg."');
  });
  
});