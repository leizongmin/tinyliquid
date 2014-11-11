/**
 * TinyLiquid
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var packageInfo = require('../package.json');
var parser = require('./parser');
var vm = require('./vm');
var Context = require('./context');
var filters = require('./filters');
var utils = require('./utils');
var OPCODE = require('./opcode');


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
  if (arguments.length < 3) {
    var callback = arguments[arguments.length - 1];
    var err = new Error('Not enough arguments.')
    if (typeof callback === 'function') {
      return callback(err);
    } else {
      throw err;
    }
  }

  // if astList is not an AST array, then parse it firstly
  if (!Array.isArray(astList)) {
    try {
      astList = exports.parse(astList);
    } catch (err) {
      return callback(err);
    }
  }

  // ensure that the callback function is called only once
  var originCallback = callback;
  var hasCallback = false;
  var callback = function (err) {
    if (hasCallback) {
      if (err) throw err;
      return;
    }
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
    vm.run(astList, context, function (err, ret) {
      if (err) return callback(err);
      if (!context._layout) {
        return callback(err, ret);
      }

      // if layout was set, then render the layout template
      var c = exports.newContext();
      c.from(context);
      c._isLayout = true;
      c.extends(c._layout, function (err, astList) {
        if (err) return callback(err);

        delete c._layout;
        vm.run(astList, c, function (err) {
          context.setBuffer(c.getBuffer());
          callback(err);
        });
      });

    });
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


// OPCODE define
exports.OPCODE = OPCODE;

/**
 * Insert filename
 *
 * @param {Array} astList
 * @param {String} filename
 * @return {Array}
 */
exports.insertFilename = function (astList, filename) {
  astList.unshift([0, 0, OPCODE.TEMPLATE_FILENAME_PUSH, filename]);
  astList.push([0, 0, OPCODE.TEMPLATE_FILENAME_POP]);
  return astList;
};
