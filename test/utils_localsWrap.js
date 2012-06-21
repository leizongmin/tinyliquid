var should = require('should');
var utils = require('../lib/utils');

describe('utils.split()', function () {
  
  it('#localsWrap ', function () {
    utils.localsWrap('123').should.equal('123');
    utils.localsWrap('123.456').should.equal('123.456');
    utils.localsWrap('"123"').should.equal('"123"');
    utils.localsWrap('"%B %d, %Y"').should.equal('"%B %d, %Y"');
    utils.localsWrap('true').should.equal('true');
    utils.localsWrap('false').should.equal('false');
    utils.localsWrap('blank').should.equal('blank');
    utils.localsWrap('nil').should.equal('nil');
    utils.localsWrap('null').should.equal('null');
    utils.localsWrap('empty').should.equal('empty');
    utils.localsWrap('abc').should.equal('locals.abc');
    utils.localsWrap('abc123').should.equal('locals.abc123');
    utils.localsWrap('_abc').should.equal('locals._abc');
    utils.localsWrap('0abc').should.equal('locals["0abc"]');
    // utils.localsWrap('"abc').should.equal('locals["\\"abc"]');
    utils.localsWrap('abc efg').should.equal('locals["abc efg"]');
    utils.localsWrap('abc.efg').should.equal('locals.abc.efg');
    utils.localsWrap('abc.efg.').should.equal('locals.abc.efg');
    utils.localsWrap('abc-efg').should.equal('locals["abc-efg"]');
    utils.localsWrap('a-b-c').should.equal('locals["a-b-c"]');
    utils.localsWrap('a-b-c-e').should.equal('locals["a-b-c-e"]');
    utils.localsWrap('xxx.abc-efg').should.equal('locals.xxx["abc-efg"]');
    utils.localsWrap('xxx.a-b-c').should.equal('locals.xxx["a-b-c"]');
  });
  
  it('#variable index', function () {
    utils.localsWrap('abc[0]').should.equal('locals.abc[0]');
    utils.localsWrap('abc.[0]').should.equal('locals.abc[0]');
    utils.localsWrap('abc["cde"]').should.equal('locals.abc["cde"]');
    utils.localsWrap('abc.["cde"]').should.equal('locals.abc["cde"]');
    utils.localsWrap('abc.[cde]').should.equal('locals.abc[locals.cde]');
    utils.localsWrap('abc.[cde].fg').should.equal('locals.abc[locals.cde].fg');
    utils.localsWrap('abc.[cde].[fg]').should.equal('locals.abc[locals.cde][locals.fg]');
    utils.localsWrap('abc.[cde.[hi.j].k].[fg]')
      .should.equal('locals.abc[locals.cde[locals.hi.j].k][locals.fg]');
    utils.localsWrap('a.[b.[c.[e].[f.[g]].[h]].h.[i.[j]].k].l.[m].n')
      .should.equal('locals.a[locals.b[locals.c[locals.e][locals.f[locals.g]][locals.h]].h[locals.i[locals.j]].k].l[locals.m].n');
    utils.localsWrap('abc[cde]').should.equal('locals.abc[locals.cde]');
    utils.localsWrap('abc[cde].fg').should.equal('locals.abc[locals.cde].fg');
    utils.localsWrap('abc[cde][fg]').should.equal('locals.abc[locals.cde][locals.fg]');
    utils.localsWrap('abc[cde[hi.j].k].[fg]')
      .should.equal('locals.abc[locals.cde[locals.hi.j].k][locals.fg]');
    utils.localsWrap('a.b-c.[e].f-g')
      .should.equal('locals.a["b-c"][locals.e]["f-g"]');
  });
  
  it('#analysis', function () { 
    var v = [];
    utils.localsWrap('abc.efg.hi', undefined, function (a) { v.push(a) });
    v.should.eql(['abc.efg.hi']);
    
    var v = [];
    utils.localsWrap('abc.[efg]', undefined, function (a) { v.push(a) });
    v.should.eql(['abc', 'efg']);
    
    var v = [];
    utils.localsWrap('abc.efg[hij]', undefined, function (a) { v.push(a) });
    v.should.eql(['abc.efg', 'hij']);
    
    var v = [];
    utils.localsWrap('abc.e-f-g[hij]', undefined, function (a) { v.push(a) });
    v.should.eql(['abc.e-f-g', 'hij']);
    
    var v = [];
    utils.localsWrap('a.[b.[c.[e].[f.[g]].[h]].h.[i.[j]].k].l.[m].n', undefined, function (a) { v.push(a) });
    v.should.eql(['a', 'e', 'g', 'h', 'j', 'm']);
  });
  
  it('#filtered', function () {
    utils.filtered('abc.efg | append: "bbc"').should.equal('filters.append(locals.abc.efg, "bbc")');
  });
  
});