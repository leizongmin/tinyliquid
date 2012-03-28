var should = require('should');
var utils = require('../lib/utils');

describe('utils.merge()', function () {
  
  it('#merge ', function () {
    utils.merge({a:1, b:2}).should.eql({a:1, b:2});
    utils.merge({a:1, b:2}, {a: 3}).should.eql({a:3, b:2});
    utils.merge({a:1, b:2}, {c: 3}).should.eql({a:1, b:2, c:3});
    utils.merge({a:1, b:2}, {c: 3}, {d:4}).should.eql({a:1, b:2, c:3, d:4});
    utils.merge({a:1, b:2}, {c: 3}, {c: 5, d:4}).should.eql({a:1, b:2, c:5, d:4});
  });
  
});