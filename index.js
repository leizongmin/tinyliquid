/**
 * TinyLiquid
 *
 * @author Lei Zongmin<leizongmin@gmail.com>
 */

 
// version
exports.version = require('./package.json').version;


// AST parser
var parser = require('./lib/parser');
exports.parser = parser;

/**
 * parse template
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Array}
 */
exports.parse = function (tpl, options) {
  return parser.apply(null, arguments);
};


// VM
var domain = require('domain');
var vm = require('./lib/vm');

/**
 * run AST code
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
exports.run = function (astList, context, callback) {
  var d = domain.create();
  if (arguments.length < 3) throw new Error('Not enough arguments.');

  // if astList is not an AST array, then parse it firstly
  if (!Array.isArray(astList)) astList = parser(astList);

  // ensure that the callback function is called only once
  var originCallback = callback;
  var hasCallback = false;
  var callback = function (err) {
    if (hasCallback) return;
    hasCallback = true;
    clearTimeout(tid);
    d.dispose();
    originCallback.apply(null, arguments);
  };
  
  // if it throws an error, catch it
  d.on('error', callback);
  d.run(function () {
    vm.run.apply(null, [astList, context, callback]);
  });

  // timeout
  if (context.options && context.options.timeout > 0) {
    var tid = setTimeout(function () {
      callback(new Error('Timeout.'));
    }, context.options.timeout);
  }
};


/**
 * compile to a function
 *
 * @param {String} tpl
 * @param {Object} options
 * @return {Function}
 */
exports.comiple = function (tpl, options) {
  var ast = exports.parse(tpl, options);
  return function (context, callback) {
    exports.run(ast, context, callback);
  };
};


// Context
var Context = exports.Context = require('./lib/context');

/**
 * create a new context
 *
 * @param {Object} options
 * @return {Object}
 */
exports.newContext = function (options) {
  return new Context(options);
};


// utils
exports.utils = require('./lib/utils');


// default filters
exports.filters = require('./lib/filters');
