var should = require('should');
var utils = require('../lib/utils');

describe('utils.condition()', function () {
  
  it('#single', function () {
    utils.condition('123').should.equal('(123)');
    utils.condition('"haha"').should.equal('("haha")');
    utils.condition('abc').should.equal('(locals.abc)');
    utils.condition('true').should.equal('(true)');
    utils.condition('false').should.equal('(false)');
    utils.condition('nil').should.equal('(nil)');
    utils.condition('null').should.equal('(null)');
    utils.condition('empty').should.equal('(empty)');
    utils.condition('blank').should.equal('(blank)');
  });
  
  it('#single and | or', function () {
    utils.condition('abc and cde').should.equal('((locals.abc) && (locals.cde))');
    utils.condition('abc and 123').should.equal('((locals.abc) && (123))');
    utils.condition('abc and "abc"').should.equal('((locals.abc) && ("abc"))');
    utils.condition('abc or cde').should.equal('((locals.abc) || (locals.cde))');
    utils.condition('abc or 123').should.equal('((locals.abc) || (123))');
    utils.condition('abc or "abc"').should.equal('((locals.abc) || ("abc"))');
  });
  
  it('#normal', function () {
    utils.condition('abc > 1').should.equal('(locals.abc>1)');
    utils.condition('abc >= 1').should.equal('(locals.abc>=1)');
    utils.condition('abc == 1').should.equal('(locals.abc==1)');
    utils.condition('abc < 1').should.equal('(locals.abc<1)');
    utils.condition('abc <= 1').should.equal('(locals.abc<=1)');
    utils.condition('abc != 1').should.equal('(locals.abc!=1)');
    utils.condition('abc <> 1').should.equal('(locals.abc!=1)');
    utils.condition('abc contains "123"').should.equal('(Array.isArray(locals.abc) ? (locals.abc.indexOf("123") !== -1) : (String(locals.abc).toLowerCase().indexOf("123") !== -1))');
    utils.condition('abc hasValue "123"').should.equal('(Array.isArray(locals.abc) ? (locals.abc.indexOf("123") !== -1 ? true : false) : (function () {  for (var i in locals.abc) if (locals.abc[i] == "123") return true;  return false; })())');
    utils.condition('abc hasKey "123"').should.equal('(locals.abc && typeof locals.abc["123"] !== \'undefined\')');
    utils.condition('abc == nil').should.equal('(!locals.abc)');
    utils.condition('abc == null').should.equal('(!locals.abc)');
    utils.condition('abc == empty').should.equal('(!locals.abc)');
    utils.condition('abc != nil').should.equal('(locals.abc)');
    utils.condition('abc <> null').should.equal('(locals.abc)');
    utils.condition('abc == "abc"').should.equal('(locals.abc=="abc")');
    utils.condition('abc != "abc"').should.equal('(locals.abc!="abc")');
    should.equal(utils.condition('abc === 1'), null);
    should.equal(utils.condition('abc a 1'), null);
    should.equal(utils.condition('abc > empty'), null);
  });
  
  it('#multi condition', function () {
    utils.condition('a == 1 and b == 2').should.equal('((locals.a==1) && (locals.b==2))');
    utils.condition('a == 1 and b == 2 or c > 3').should.equal('((locals.a==1) && (locals.b==2) || (locals.c>3))');
    utils.condition('user and user.friends and user.friends.length > 10')
      .should.equal('((locals.user) && (locals.user.friends) && (locals.user.friends.length>10))');
  });
  
  it('#other format', function () {
    utils.condition('abc>1').should.equal('(locals.abc>1)');
    utils.condition('abc>=1').should.equal('(locals.abc>=1)');
    utils.condition('abc==1').should.equal('(locals.abc==1)');
    utils.condition('abc<1').should.equal('(locals.abc<1)');
    utils.condition('abc<=1').should.equal('(locals.abc<=1)');
    utils.condition('abc!=1').should.equal('(locals.abc!=1)');
    utils.condition('abc<>1').should.equal('(locals.abc!=1)');
    utils.condition('abc==nil').should.equal('(!locals.abc)');
    utils.condition('abc==null').should.equal('(!locals.abc)');
    utils.condition('abc==empty').should.equal('(!locals.abc)');
    utils.condition('abc!=nil').should.equal('(locals.abc)');
    utils.condition('abc<>null').should.equal('(locals.abc)');
    utils.condition('abc=="abc"').should.equal('(locals.abc=="abc")');
    utils.condition('abc!="abc"').should.equal('(locals.abc!="abc")');
    should.equal(utils.condition('abc===1'), null);
    should.equal(utils.condition('abc>empty'), null);
    utils.condition('a==1 and b==2').should.equal('((locals.a==1) && (locals.b==2))');
    utils.condition('a==1 and b==2 or c>3').should.equal('((locals.a==1) && (locals.b==2) || (locals.c>3))');
    utils.condition('user and user.friends and user.friends.length > 10')
      .should.equal('((locals.user) && (locals.user.friends) && (locals.user.friends.length>10))');
  });
  
});