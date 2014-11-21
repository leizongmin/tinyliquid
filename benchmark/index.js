var fs = require('fs');
var async = require('async');
var TinyLiquid = require('../');
require('../other/ejs');

var TPL_EJS = fs.readFileSync(__dirname + '/tpl.ejs').toString();
var TPL_LIQUID = fs.readFileSync(__dirname + '/tpl.liquid').toString();


var _data = Object.keys(TinyLiquid).map(function (k) {
  return {name: k, value: TinyLiquid[k]};
}).slice(0, 10);
var data = [];
for (var i = 0; i < 2000; i++) {
  data = data.concat(_data);
}

var loop = [];
for (var i = 1; i <= 20; i++) {
  loop.push(i);
}

var RESULTS_EJS = [];
var RESULTS_LIQUID = [];

function getAverage (list) {
  var sum = list.reduce(function (a, b) {
    return a + b;
  });
  return sum / list.length;
}


function renderLiquid (callback) {

  var ast = TinyLiquid.parse(TPL_LIQUID);
  var c = TinyLiquid.newContext();
  c.setLocals('list', data);
  c.setFilter('to_string', function (v) {
    return typeof v === 'function' ? '[Function]' : v;
  });

  var timestamp = Date.now();

  TinyLiquid.run(ast, c, function (err) {
    if (err) throw err;

    var spent = Date.now() - timestamp;
    RESULTS_LIQUID.push(spent);

    console.log('TinyLiquid: total ' + data.length + ' items, spent ' + spent + 'ms');

    callback && callback();
  });
}

function renderEjs (callback) {

  var render = ejs.compile(TPL_EJS);

  var timestamp = Date.now();

  var html = render({
    data: data,
    to_string: function (v) {
      return typeof v === 'function' ? '[Function]' : v;
    }
  });

  var spent = Date.now() - timestamp;
  RESULTS_EJS.push(spent);

  console.log('EJS: total ' + data.length + ' items, spent ' + spent + 'ms');

  callback && callback();
}


async.series([
  function (done) {
    async.eachSeries(loop, function (item, next) {
      renderLiquid(next);
    }, function (err) {
      if (err) return next(err);
      console.log('Average: ' + getAverage(RESULTS_LIQUID));
      console.log('---------');
      done();
    });
  },
  function (done) {
    async.eachSeries(loop, function (item, next) {
      renderEjs(next);
    }, function (err) {
      if (err) return next(err);
      console.log('Average: ' + getAverage(RESULTS_EJS));
      console.log('---------');
      done();
    });
  }
], function (err) {
  if (err) throw err;
  console.log('TinyLiquid Average: %sms', getAverage(RESULTS_LIQUID));
  console.log('EJS Average: %sms', getAverage(RESULTS_EJS));
  console.log('TinyLiquid is %sx slower than EJS', (getAverage(RESULTS_LIQUID) / getAverage(RESULTS_EJS)).toFixed(1));
});
