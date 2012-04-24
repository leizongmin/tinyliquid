var path = require('path');
var should = require('should');

describe('build', function () {

  it('load', function () {
    
    var tinyliquid = require(path.resolve(__dirname, './target/tinyliquid'));
    //console.log(tinyliquid);
    
    should.equal(typeof tinyliquid.version, 'string');
    should.equal(typeof tinyliquid.parse, 'function');
    should.equal(typeof tinyliquid.compile, 'function');
    should.equal(typeof tinyliquid.render, 'function');
    should.equal(typeof tinyliquid.compileAll, 'function');
    should.equal(typeof tinyliquid.advRender, 'function');
    should.equal(typeof tinyliquid.filters, 'object');
    
  });
  
  
  it('load min', function () {
    
    var tinyliquid = require(path.resolve(__dirname, './target/tinyliquid.min'));
    //console.log(tinyliquid);
    
    should.equal(typeof tinyliquid.version, 'string');
    should.equal(typeof tinyliquid.parse, 'function');
    should.equal(typeof tinyliquid.compile, 'function');
    should.equal(typeof tinyliquid.render, 'function');
    should.equal(typeof tinyliquid.compileAll, 'function');
    should.equal(typeof tinyliquid.advRender, 'function');
    should.equal(typeof tinyliquid.filters, 'object');
    
  });

});