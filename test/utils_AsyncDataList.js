var should = require('should');
var utils = require('../lib/utils');

describe('utils.AsyncDataList', function () {
  
  it('#saveItem', function () {
    
    var dataList = utils.AsyncDataList();
    
    var data = {};
    dataList.saveItem('a.b.c', 123, data);
    data.should.eql({a:{b:{c:123}}});
    
    var data = {};
    dataList.saveItem('a.b.c', 123, data);
    dataList.saveItem('a.b.e', 456, data);
    dataList.saveItem('a.f', 789, data);
    data.should.eql({a:{b:{c:123, e:456}, f:789}});
    
    try {
      var data = {};
      dataList.saveItem('a.b.c', 123, data);
      dataList.saveItem('a.b.c.d', 456, data);
      var isOk = false;
    }
    catch (err) {
      var isOk = true;
    }
    should.exist(isOk);
    
  });
  
  
  it('#getItem', function (done) {
    
    var dataList = utils.AsyncDataList();
    
    var models = {
      'site.config': function (callback) {
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (callback) {
        setTimeout(function () {
          return callback(Error());
        }, 50);
      }, 
      'products': function (callback) {
        throw Error();
      }
    };
    
    var data = {};
    
    dataList.getItem('site.config', data, models, function (err) {
      should.not.exist(err);
      should.exist(data.site.config);
      should.equal(data.site.config.title, 'Just for Test');
      
      dataList.getItem('site.title', data, models, function (err) {
        should.exist(err);
        
        dataList.getItem('products', data, models, function (err) {
          should.exist(err);
          
          done();
        });
      });  
    });
    
  });
  
  
  it('#getItem 2', function (done) {
    
    var dataList = utils.AsyncDataList();
    
    var models = {
      'a.b.c': function (callback) {
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
      'a.b': function (callback) {
        setTimeout(function () {
          return callback(null, 'error');
        }, 50);
      }
    };
    
    var data = {};
    
    dataList.getItem('a.b.c.d', data, models, function (err) {
      should.not.exist(err);
      should.equal(data.a.b.c.d, 123);
      
      dataList.getItem('a.b.c.e', data, models, function (err) {
        should.not.exist(err);
        should.exist(data.a.b.c.e);
        should.equal(data.a.b.c.e.f1, 456);
        should.equal(data.a.b.c.e.f2, 789);
        
        done();
      });
    });
    
  });
  
  
  it('#getItem 3', function (done) {
    
    var dataList = utils.AsyncDataList();
    
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
    
    var data = {};
    
    dataList.getItem('a.b.c.d', data, models, function (err) {
      should.not.exist(err);
      should.equal(data.a.b.c.d, 123);
      
      dataList.getItem('a.b.c.e', data, models, function (err) {
        should.not.exist(err);
        should.exist(data.a.b.c.e);
        should.equal(data.a.b.c.e.f1, 456);
        should.equal(data.a.b.c.e.f2, 789);
        
        done();
      });
    });
    
  });
  
  
  it('#start', function (done) {
    
    var models = {
      'site.config': function (callback) {
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (callback) {
        setTimeout(function () {
          return callback(null, 'OK');
        }, 50);
      }, 
      'products': function (callback) {
        return callback(null, [{title: 'Bag'}, {title: 'Ring'}]);
      },
      'error': function () {
        throw Error();
      }
    };
    
    var data = {};
  
    
    var dataList = utils.AsyncDataList(models, ['site.config', 'site.title', 'products']);
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
      
      var dataList = utils.AsyncDataList(models, ['site.config', 'error', 'site.title', 'products']);
      dataList.start(function (err, data) {
        should.exist(err);
        done();
      });
      
    });
  
  });
  
  
  it('#startParallel', function (done) {
    
    var models = {
      'site.config': function (callback) {
        setTimeout(function () {
          return callback(null, {title: 'Just for Test'});
        }, 50);
      },
      'site.title': function (callback) {
        setTimeout(function () {
          return callback(null, 'OK');
        }, 50);
      }, 
      'products': function (callback) {
        return callback(null, [{title: 'Bag'}, {title: 'Ring'}]);
      },
      'error': function () {
        throw Error();
      }
    };
    
    var data = {};
  
    
    var dataList = utils.AsyncDataList(models, ['site.config', 'site.title', 'products']);
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
      
      var dataList = utils.AsyncDataList(models, ['site.config', 'error', 'site.title', 'products']);
      dataList.startParallel(function (err, data) {
        should.exist(err);
        done();
      });
      
    });
  
  });
  
});