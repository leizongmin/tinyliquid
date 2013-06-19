/**
 * TinyLiquid
 *
 * @author Lei Zongmin<leizongmin@gmail.com>
 */

var packageInfo = require('../package.json');
var parser = require('./parser');
var vm = require('./vm');
var Context = require('./context');
var filters = require('./filters');
var utils = require('./utils');


// TinyLiquid version
exports.version = packageInfo.version;


// AST parser
exports.parser = parser;


/**
 * Parse template
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Array}
 */
exports.parse = function (tpl, options) {
  return parser.apply(null, arguments);
};


/**
 * Run AST code
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
exports.run = function (astList, context, callback) {
  if (arguments.length < 3) throw new Error('Not enough arguments.');

  // if astList is not an AST array, then parse it firstly
  if (!Array.isArray(astList)) astList = exports.parse(astList);

  // ensure that the callback function is called only once
  var originCallback = callback;
  var hasCallback = false;
  var callback = function (err) {
    if (hasCallback) return;
    hasCallback = true;
    clearTimeout(tid);
    originCallback.apply(null, arguments);
  };
  
  // timeout
  if (context.options && context.options.timeout > 0) {
    var tid = setTimeout(function () {
      callback(new Error('Timeout.'));
    }, context.options.timeout);
  }

  // if it throws an error, catch it
  try {
    vm.run(astList, context, callback);
  } catch (err) {
    return callback(err);
  }
};


/**
 * Compile to a function
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Function}
 */
exports.compile = function (tpl, options) {
  var ast = exports.parse(tpl, options);
  return function (context, callback) {
    exports.run(ast, context, function (err) {
      callback(err, context.getBuffer());
    });
  };
};


// Context
exports.Context = Context;

/**
 * Create a new context
 *
 * @param {Object} options
 * @return {Object}
 */
exports.newContext = function (options) {
  return new Context(options);
};


// Utils
exports.utils = utils;


// Default filters
exports.filters = filters;
