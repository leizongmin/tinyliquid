/**
 * 性能测试：  VS ejs
 */
 

var ejs = require('ejs');
var juicer = require('juicer');
var me = require('../');
var fs = require('fs');
var path = require('path');

var readFile = function (filename) {
  return fs.readFileSync(path.resolve(__dirname, filename), 'utf8');
};

var run = function (title, fn, n) {
  if (isNaN(n))
    n = 1;
  var s = new Date();
  for (var i = 0; i < n; i++)
    fn();
  var e = new Date();
  console.log('  Test ' + title);
  console.log('    spent ' + ((e - s) / n) + ' ms');
};


var test = function (COUNT, TEST_COUNT) {
  var data = {items: []};
  if (isNaN(COUNT))
    COUNT = 100;
  if (isNaN(TEST_COUNT))
    TEST_COUNT = 10000;
  for (var i = 0; i < COUNT; i++) {
    data.items[i] = [];
    for (var j = 0; j < COUNT; j++) {
      data.items[i].push('' + Math.random());
    }
  }
  console.log('using ' + (COUNT * COUNT) + ' data items to test...');

  
  // ejs
  var test_ejs = function () {
    var text = readFile('template.ejs');
    var render;
    
    var test_compile = function () {
      render = ejs.compile(text);
    };
    run('ejs.compile()', test_compile, TEST_COUNT);
    
    var ret;
    var test_render = function () {
      ret = render(data);
    };
    run('ejs.render()', test_render, TEST_COUNT);
    // console.log(ret);
  };
  
  // juicer
  var test_juicer = function () {
    var text = readFile('template.juicer');
    var render;
    
    var test_compile = function () {
      render = juicer.compile(text).render;
    };
    run('juicer.compile()', test_compile, TEST_COUNT);
    
    var ret;
    var test_render = function () {
      ret = render(data);
    };
    run('juicer.render()', test_render, TEST_COUNT);
    // console.log(ret);
  };
  
  // me
  var test_me = function () {
    var text = readFile('template.liquid');
    var render;
    
    var test_compile = function () {
      render = me.compile(text);
    };
    run('me.compile()', test_compile, TEST_COUNT);
    
    var ret;
    var test_render = function () {
      ret = render(data);
    };
    run('me.render()', test_render, TEST_COUNT);
    // console.log(ret);
    
    var c = 0;
    var test_advRender = function () {
      me.advRender(render, data, {}, function (err, text) {
        if (err)
          throw err;
        ret = text;
        //c++;
        //if (c >= TEST_COUNT)
        //  console.log('.');
      });
    };
    run('me.advRender()', test_advRender, TEST_COUNT);
  };


  console.log('-----------------------------------------------');
  test_ejs();
  console.log('==========================');
  test_juicer();
  console.log('==========================');
  test_me();
  console.log('\n\n');
};


test(1, 1);
test(5);
test(10);
test(20);
test(33);
