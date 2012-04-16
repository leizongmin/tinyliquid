var should = require('should');
var utils = require('../lib/utils');

describe('utils.AsyncDataList', function () {
  
  it('#saveItem', function () {
    
    var dataList = utils.AsyncDataList();
    
    dataList.saveItem('a.b.c', 123);
    dataList.data.should.eql({a:{b:{c:123}}});
    
    dataList.saveItem('a.b.c', 123);
    dataList.saveItem('a.b.e', 456);
    dataList.saveItem('a.f', 789);
    dataList.data.should.eql({a:{b:{c:123, e:456}, f:789}});
    
    try {
      dataList.saveItem('a.b.c', 123);
      dataList.saveItem('a.b.c.d', 456);
      var isOk = false;
    }
    catch (err) {
      var isOk = true;
    }
    should.exist(isOk);
    
  });
  
  
  it('#getItem', function (done) {
    
    var models = {
      'site.config': function (env, callback) {
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (env, callback) {
        setTimeout(function () {
          return callback(Error());
        }, 50);
      }, 
      'products': function (env, callback) {
        throw Error();
      }
    };
    
    var dataList = utils.AsyncDataList(models);
    
    dataList.getItem('site.config', function (err) {
      should.not.exist(err);
      should.exist(dataList.data.site.config);
      should.equal(dataList.data.site.config.title, 'Just for Test');
      
      dataList.getItem('site.title', function (err) {
        should.exist(err);
        
        dataList.getItem('products', function (err) {
          should.exist(err);
          
          done();
        });
      });  
    });
    
  });
  
  
  it('#getItem father & env', function (done) {
    
    var env = {
      path: 'test'
    };
    
    var models = {
      'a.b.c': function (env, callback) {
        should.exist(env);
        should.equal(env.path, 'test');
        setTimeout(function () {
          return callback(null, {
            d: 123,
            e: {
              f1: 456,
              f2: 789
            }
          });
        }, 50);
      },
      'a.b': function (env, callback) {
        setTimeout(function () {
          return callback(null, 'error');
        }, 50);
      }
    };
    
    var dataList = utils.AsyncDataList(models, [], env);
    
    dataList.getItem('a.b.c.d', function (err) {
      should.not.exist(err);
      should.equal(dataList.data.a.b.c.d, 123);
      
      dataList.getItem('a.b.c.e', function (err) {
        should.not.exist(err);
        should.exist(dataList.data.a.b.c.e);
        should.equal(dataList.data.a.b.c.e.f1, 456);
        should.equal(dataList.data.a.b.c.e.f2, 789);
        
        done();
      });
    });
    
  });
  
  
  it('#getItem 3', function (done) {
    
    var models = {
      'a.b.c': {
        d: 123,
        e: {
          f1: 456,
          f2: 789
        } 
      },
      'a.b': 'error'
    };
    
    var dataList = utils.AsyncDataList(models);
    
    dataList.getItem('a.b.c.d', function (err) {
      should.not.exist(err);
      should.equal(dataList.data.a.b.c.d, 123);
      
      dataList.getItem('a.b.c.e', function (err) {
        should.not.exist(err);
        should.exist(dataList.data.a.b.c.e);
        should.equal(dataList.data.a.b.c.e.f1, 456);
        should.equal(dataList.data.a.b.c.e.f2, 789);
        
        done();
      });
    });
    
  });
  
  
  it('#start', function (done) {
    
    var env = {
      test1:  'TEST_1',
      test2:  '2_TEST'
    };
    
    var models = {
      'site.config': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        setTimeout(function () {
          return callback(null, 'OK');
        }, 50);
      }, 
      'products': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        return callback(null, [{title: 'Bag'}, {title: 'Ring'}]);
      },
      'error': function () {
        throw Error();
      }
    };
    
    var data = {};
  
    
    var dataList = utils.AsyncDataList(models, ['site.config', 'site.title', 'products'], env);
    dataList.start(function (err, data) {
      should.not.exist(err);
      data.should.eql({
        site: {
          config: {
            title: 'Just for Test'
          },
          title: 'OK'
        },
        products: [
          {title: 'Bag'},
          {title: 'Ring'}
        ]
      });
      
      var dataList = utils.AsyncDataList(models, ['site.config', 'error', 'site.title', 'products'], env);
      dataList.start(function (err, data) {
        should.exist(err);
        done();
      });
      
    });
  
  });
  
  
  it('#startParallel', function (done) {
    
    var env = {
      test1:  'TEST_1',
      test2:  '2_TEST'
    };
    
    var models = {
      'site.config': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        setTimeout(function () {
          return callback(null, 'OK');
        }, 50);
      }, 
      'products': function (env, callback) {
        should.exist(env);
        should.equal(env.test1, 'TEST_1');
        should.equal(env.test2, '2_TEST');
        return callback(null, [{title: 'Bag'}, {title: 'Ring'}]);
      },
      'error': function () {
        throw Error();
      }
    };
    
    var data = {};
  
    
    var dataList = utils.AsyncDataList(models, ['site.config', 'site.title', 'products'], env);
    dataList.startParallel(function (err, data) {
      should.not.exist(err);
      data.should.eql({
        site: {
          config: {
            title: 'Just for Test'
          },
          title: 'OK'
        },
        products: [
          {title: 'Bag'},
          {title: 'Ring'}
        ]
      });
      
      var dataList = utils.AsyncDataList(models, ['site.config', 'error', 'site.title', 'products'], env);
      dataList.startParallel(function (err, data) {
        should.exist(err);
        done();
      });
      
    });
  
  });
  
});