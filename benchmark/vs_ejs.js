/**
 * 性能测试：  VS ejs
 */
 

var ejs = require('ejs');
var me = require('../');
var fs = require('fs');
var path = require('path');

var readFile = function (filename) {
  return fs.readFileSync(path.resolve(__dirname, filename), 'utf8');
}

var run = function (title, fn, n) {
  if (isNaN(n))
    n = 1;
  var s = new Date();
  for (var i = 0; i < n; i++)
    fn();
  var e = new Date();
  console.log('  Test ' + title);
  console.log('    spent ' + ((e - s) / n) + ' ms');
}


var data = {items: []}
var COUNT = 200;
for (var i = 0; i < COUNT; i++) {
  data.items[i] = [];
  for (var j = 0; j < COUNT; j++) {
    data.items[i].push('' + Math.random());
  }
}
console.log('start...');


var TEST_COUNT = 100;
// ejs
var test_ejs = function () {
  var text = readFile('template.ejs');
  var render;
  
  var test_compile = function () {
    render = ejs.compile(text);
  }
  run('ejs.compile()', test_compile, TEST_COUNT);
  
  var ret;
  var test_render = function () {
    ret = render(data);
  }
  run('ejs.render()', test_render, TEST_COUNT);
  //console.log(ret);
}


// me
var test_me = function () {
  var text = readFile('template.liquid');
  var render;
  
  var test_compile = function () {
    render = me.compile(text);
  }
  run('me.compile()', test_compile, TEST_COUNT);
  
  var ret;
  var test_render = function () {
    ret = render(data);
  }
  run('me.render()', test_render, TEST_COUNT);
  //console.log(ret);
}


test_ejs();
console.log('==========================');
test_me();