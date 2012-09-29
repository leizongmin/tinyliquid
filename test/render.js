var should = require('should');
var liquid = require('../');

describe('render', function () {

  it('#default', function () {
    var fn = liquid.compile('{% for item in (1..5) %}{{item}}{% endfor %}');
    fn().should.equal('12345');
  });

  it('#non-pollution', function () {
    var fn = liquid.compile('{% for item in data %}{{item}}{% endfor %}');
    var locals = {
      data: [1,2,3,4,5]
    };
    fn(locals).should.equal('12345');
    locals.should.eql({
      data: [1,2,3,4,5]
    });
  });

});