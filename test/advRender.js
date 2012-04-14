var should = require('should');
var liquid = require('../');

describe('advRender', function () {
  
  it('#advRender', function (done) {
    
    var models = {
      'title':    function (callback) {
        setTimeout(function () {
          return callback(null, '调查');
        }, 50);
      },
      'man.name':    function (callback) {
        setTimeout(function () {
          return callback(null, '老雷');
        }, 100);
      },
      'man.age':    function (callback) {
        setTimeout(function () {
          return callback(null, '23');
        }, 50);
      },
      'error':    function (callback) {
        throw Error();
      }
    };
    
    var fn = liquid.compile('{{ title }}: 姓名:{{ man.name }}, 年龄:{{ man.age }}');
    liquid.advRender(fn, models, {}, function (err, text) { 
      should.not.exist(err);
      text.should.equal('调查: 姓名:老雷, 年龄:23');
      
      var fn = liquid.compile('{{ title }}: {{ error }}');
      liquid.advRender(fn, models, {}, function (err, text) { 
        should.exist(err);
        
        done();
      });
    });
  });
  
});