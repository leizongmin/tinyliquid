var should = require('should');
var utils = require('../lib/utils');

describe('utils.splitBy()', function () {
  
  it('#splitBy', function () {
    utils.splitBy('a,b,c', ',').should.eql(['a','b','c']);
    utils.splitBy('a,b|c', '|').should.eql(['a,b','c']);
    utils.splitBy('a | "b|c | d" | e', '|').should.eql(['a','"b|c | d"', 'e']);
    utils.splitBy('a | \'b|c | d\' | e', '|').should.eql(['a','\'b|c | d\'', 'e']);
    utils.splitBy('a | "b|c | d | e', '|').should.eql(['a','"b', 'c', 'd', 'e']);
    utils.splitBy('a | b|c | d | e"', '|').should.eql(['a','b', 'c', 'd', 'e"']);
    utils.splitBy('a | "b|c | d" | "e|e"', '|').should.eql(['a','"b|c | d"', '"e|e"']);
  });
  
});