var fs = require('fs');
var async = require('async');
var tinyliquid = require('../');
var ejs = require('ejs');

var TPL_EJS = fs.readFileSync(__dirname + '/tpl.ejs').toString();
var TPL_LIQUID = fs.readFileSync(__dirname + '/tpl.liquid').toString();

for (var i = 0; i < 10; i++) {
  TPL_LIQUID += '\n' + TPL_LIQUID;
  TPL_EJS += '\n' + TPL_EJS;
}


var LOOP_NUM = 100;

var RESULTS_EJS = [];
var RESULTS_LIQUID = [];

function getAverage (list) {
  var sum = list.reduce(function (a, b) {
    return a + b;
  });
  return sum / list.length;
}


function compileLiquid (callback) {

  for (var i = 0; i < LOOP_NUM; i++) {
    var timestamp = Date.now();
    var ast = tinyliquid.parse(TPL_LIQUID);
    var spent = Date.now() - timestamp;
    RESULTS_LIQUID.push(spent);
  }

  callback && callback();
}

function compileEjs (callback) {

  for (var i = 0; i < LOOP_NUM; i++) {
    var timestamp = Date.now();
    var render = ejs.compile(TPL_EJS);
    var spent = Date.now() - timestamp;
    RESULTS_EJS.push(spent);
  }

  callback && callback();
}


async.series([
  function (done) {
    compileLiquid(function () {
      console.log('Average: %sms', getAverage(RESULTS_LIQUID));
      console.log('---------');
      done();
    });
  },
  function (done) {
    compileEjs(function () {
      console.log('Average: %sms', getAverage(RESULTS_EJS));
      console.log('---------');
      done();
    });
  }
], function (err) {
  if (err) throw err;
  console.log('tinyliquid Average: %sms', getAverage(RESULTS_LIQUID));
  console.log('EJS Average: %sms', getAverage(RESULTS_EJS));
  console.log('tinyliquid is %sx slower than EJS', (getAverage(RESULTS_LIQUID) / getAverage(RESULTS_EJS)).toFixed(1));
});
