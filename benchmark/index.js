var fs = require('fs');
var async = require('async');
var tinyliquid = require('../');
var ejs = require('ejs');

var TPL_EJS = fs.readFileSync(__dirname + '/tpl.ejs').toString();
var TPL_LIQUID = fs.readFileSync(__dirname + '/tpl.liquid').toString();


var _data = Object.keys(tinyliquid).map(function (k) {
  return {name: k, value: tinyliquid[k]};
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

  var ast = tinyliquid.parse(TPL_LIQUID);
  var c = tinyliquid.newContext();
  c.setLocals('list', data);
  c.setFilter('to_string', function (v) {
    return typeof v === 'function' ? '[Function]' : v;
  });

  var timestamp = Date.now();

  tinyliquid.run(ast, c, function (err) {
    if (err) throw err;

    var spent = Date.now() - timestamp;
    RESULTS_LIQUID.push(spent);

    console.log('tinyliquid: total ' + data.length + ' items, spent ' + spent + 'ms');

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
      console.log('Average: %sms', getAverage(RESULTS_LIQUID));
      console.log('---------');
      done();
    });
  },
  function (done) {
    async.eachSeries(loop, function (item, next) {
      renderEjs(next);
    }, function (err) {
      if (err) return next(err);
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
