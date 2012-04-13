var should = require('should');
var utils = require('../lib/utils');

describe('utils.stripQuotes()', function () {
  
  it('#stripQuotes ', function () {
    utils.stripQuotes('abcd').should.equal('abcd');
    utils.stripQuotes('"abcd').should.equal('abcd');
    utils.stripQuotes('\'abcd').should.equal('abcd');
    utils.stripQuotes('"abcd"').should.equal('abcd');
    utils.stripQuotes('\'abcd\'').should.equal('abcd');
    utils.stripQuotes('abcd"').should.equal('abcd');
    utils.stripQuotes('abcd\'').should.equal('abcd');
    utils.stripQuotes('ab"cd').should.equal('ab"cd');
  });
  
});