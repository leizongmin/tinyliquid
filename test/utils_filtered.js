var should = require('should');
var utils = require('../lib/utils');

describe('utils.filtered()', function () {
  
  it('#normal', function () {
    utils.filtered('a').should.equal('locals.a');
    utils.filtered('123').should.equal('123');
    utils.filtered('"abc"').should.equal('"abc"');
  });
  
  it('#use filters', function () {
    utils.filtered('"abc"|call').should.equal('filters.call("abc")');
    utils.filtered('abc|call').should.equal('filters.call(locals.abc)');
    utils.filtered('123|call').should.equal('filters.call(123)');
  });
  
  it('#use filters and params', function () {
    utils.filtered('abc|call:a').should.equal('filters.call(locals.abc, locals.a)');
    utils.filtered('abc|call:123').should.equal('filters.call(locals.abc, 123)');  
    utils.filtered('abc|call:"abc"').should.equal('filters.call(locals.abc, "abc")');
    utils.filtered('abc|call:a,b,c').should.equal('filters.call(locals.abc, locals.a, locals.b, locals.c)');
  });
  
  it('#use multi filters', function () {
    utils.filtered('"abc"|call1|call2').should.equal('filters.call2(filters.call1("abc"))');
    utils.filtered('"abc"|call1|call2|call3').should.equal('filters.call3(filters.call2(filters.call1("abc")))');
    utils.filtered('"abc"|call1|call2|call3|call4').should.equal('filters.call4(filters.call3(filters.call2(filters.call1("abc"))))');
  });
  
  it('#use multi filters with params', function () {
    utils.filtered('"abc"|call1|call2:a').should.equal('filters.call2(filters.call1("abc"), locals.a)');
    utils.filtered('"abc"|call1:b|call2:a').should.equal('filters.call2(filters.call1("abc", locals.b), locals.a)');
    utils.filtered('"abc"|call1:c|call2:b|call3:a').should.equal('filters.call3(filters.call2(filters.call1("abc", locals.c), locals.b), locals.a)'); 
  });
  
});