var liquid = require('../');
var flow = require('bright-flow');

var debug1 = function () {};
var debug2 = function () {};
if (/1/.test(process.env.DEBUG)) debug1 = console.log;
if (/2/.test(process.env.DEBUG)) debug2 = console.log;


// The TinyLiquid
exports.me = liquid;

/**
 * Create a new Context
 *
 * @param {Object} options
 * @return {Object}
 */
exports.newContext = function (options) {
  return new liquid.Context(options);
};

/**
 * Parse the template
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Array}
 */
exports.parse = function (tpl, options) {
  return liquid.parse(tpl, options);
};

/**
 * Render
 *
 * @param {Object} context
 * @param {String} tpl
 * @param {String} options
 * @param {Function} callback
 */
exports.render = function (context, tpl, options, callback) {
  if (typeof(context) === 'string') {
    callback = options;
    options = tpl;
    tpl = context;
    context = exports.newContext();
  }
  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }
  var ast = liquid.parse(tpl, options);
  debug2(liquid.utils.jsonStringify(ast, 1));
  debug1(ast);
  liquid.run(ast, context, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, context.getBuffer());
    }
  });
};

/**
 * Create async task list
 *
 * @return {Object}
 */
exports.taskList = function () {
  var task = flow.series();
  var ret = {
    add: function (fn) {
      task.do(function (me) {
        fn(function () {
          me.done();
        });
      });
      return ret;
    },
    end: function (fn) {
      task.end(function (isTimeout) {
        if (isTimeout) return fn(new Error('Task timeout.'));
        fn();
      });
      return ret;
    }
  };
  return ret;
};
