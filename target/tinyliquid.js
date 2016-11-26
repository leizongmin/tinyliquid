(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TinyLiquid = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Context Object
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var vm = require('./vm');
var OPCODE = require('./opcode');
var debug = utils.debug('Context');
var merge = utils.merge;


/**
 * Context
 *
 * @param {Object} options
 *   - {Object} filters
 *   - {Object} asyncFilters
 *   - {Object} locals
 *   - {Object} syncLocals
 *   - {Object} asyncLocals
 *   - {Object} blocks
 *   - {Boolean} isLayout   default:false
 *   - {Integer} timeout  unit:ms, default:120000
 *   - {Object} parent
 */
var Context = module.exports = exports = function (options) {
  options = options || {};
  this._locals = {};
  this._syncLocals = {};
  this._asyncLocals = {};
  this._asyncLocals2 = [];
  this._filters = merge(filters, options.filters);
  this._asyncFilters = {};
  this._cycles = {};
  this._buffer = '';
  this._forloops = [];
  this._isInForloop = false;
  this._tablerowloops = [];
  this._isInTablerowloop = false;
  this._includeFileHandler = null;
  this._position = {line: 0, column: 0};
  this._astCache = {};
  this._filenameStack = [];
  this._filterCache = {};
  this._blocks = {};
  this._isLayout = !!options.isLayout;

  // default configuration
  options = merge({
    timeout: 120000
  }, options);
  this.options = options;

  // parent
  this._parent = options.parent || null;

  // initialize the configuration
  var me = this;
  var set = function (name) {
    if (options[name] && typeof(options[name]) === 'object') {
      Object.keys(options[name]).forEach(function (i) {
        me['_' + name][i] = options[name][i];
      });
    }
  };
  set('locals');
  set('syncLocals');
  set('asyncLocals');
  set('asyncLocals2');
  set('filters');
  set('blocks');

  if (options.asyncFilters && typeof options.asyncFilters === 'object') {
    Object.keys(options.asyncFilters).forEach(function (i) {
      me.setAsyncFilter(i, options.asyncFilters[i]);
    });
  }
};

/**
 * Copy the configuration from other context object
 *
 * @param {Object} from
 * @return {Object}
 */
Context.prototype.from = function (from) {
  var me = this;
  var set = function (name) {
    if (from[name] && typeof(from[name]) === 'object') {
      for (var i in from[name]) {
        if (i in me[name]) continue;
        me[name][i] = from[name][i];
      }
    } else if (typeof(from[name] === 'function')) {
      if (!me[name]) {
        me[name] = from[name];
      }
    }
  }
  set('_locals');
  set('_syncLocals');
  set('_asyncLocals');
  set('_asyncLocals2');
  set('_filters');
  set('_asyncFilters');
  set('options');
  set('_onErrorHandler');
  set('_includeFileHandler');
  set('_filterCache');
  set('_blocks');

  if (Array.isArray(from._filenameStack)) {
    me._filenameStack = from._filenameStack.slice();
  }

  for (var i in from) {
    if (i in me) continue;
    me[i] = from[i];
  }

  me._isInForloop = from._isInForloop;
  me._forloops = from._forloops.slice();
  me._isInTablerowloop = from._isInTablerowloop;
  me._tablerowloops = from._tablerowloops;

  me._isLayout = from._isLayout;

  return this;
};

/* constants */
Context.prototype.STATIC_LOCALS = 0;  // normal locals
Context.prototype.SYNC_LOCALS = 1;    // get value from a sync function
Context.prototype.ASYNC_LOCALS = 2;   // get value from a async function
Context.prototype.SYNC_FILTER = 0;    // normal filter
Context.prototype.ASYNC_FILTER = 1;   // async filter

/**
 * Set Timeout
 *
 * @param {Integer} ms
 */
Context.prototype.setTimeout = function (ms) {
  ms = parseInt(ms, 10);
  if (ms > 0) this.options.timeout = ms;
};

/**
 * Run AST
 *
 * @param {Array} astList
 * @param {Function} callback
 */
Context.prototype.run = function (astList, callback) {
  return vm.run(astList, this, callback);
};

/**
 * Register normal locals
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setLocals = function (name, val) {
  this._locals[name] = val;
  if (this._parent) {
    this._parent.setLocals(name, val);
  }
};

/**
 * Register sync locals
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setSyncLocals = function (name, fn) {
  this._syncLocals[name] = fn;
};

/**
 * Register async locals
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncLocals = function (name, fn) {
  if (name instanceof RegExp) {
    var name2 = name.toString();
    // remove the same name
    for (var i = 0, len = this._asyncLocals2; i < len; i++) {
      var item = this._asyncLocals2[i];
      if (item[0].toString() === name2) {
        this._asyncLocals2.splice(i, 1);
        break;
      }
    }
    this._asyncLocals2.push([name, fn]);
  } else {
    this._asyncLocals[name] = fn;
  }
};

/**
 * Register normal filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setFilter = function (name, fn) {
  this._filters[name.trim()] = fn;
};

/**
 * Register async filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncFilter = function (name, fn) {
  if (fn.enableCache) fn = utils.wrapFilterCache(name, fn);
  this._asyncFilters[name.trim()] = fn;
};

/**
 * Set layout file
 *
 * @param {String} filename
 */
Context.prototype.setLayout = function (filename) {
  this._layout = filename;
};

/**
 * Set block
 *
 * @param {String} name
 * @param {String} buf
 */
Context.prototype.setBlock = function (name, buf) {
  this._blocks[name] = buf;
  if (this._parent) {
    this._parent.setBlock(name, buf);
  }
};

/**
 * Set block if empty
 *
 * @param {String} name
 * @param {String} buf
 */
Context.prototype.setBlockIfEmpty = function (name, buf) {
  if (!(name in this._blocks)) {
    this._blocks[name] = buf;
  }
};

/**
 * Get block
 *
 * @param {String} name
 * @return {String}
 */
Context.prototype.getBlock = function (name) {
  return this._blocks[name] || null;
};

/**
 * Get locals
 *
 * @param {String} name
 * @return {Array} [type, value, isAllowCache]  return null if the locals not found
 */
Context.prototype.getLocals = function (name) {
  if (name in this._locals) return [this.STATIC_LOCALS, this._locals[name]];
  if (name in this._syncLocals) return [this.SYNC_LOCALS, this._syncLocals[name], true];
  if (name in this._asyncLocals) return [this.ASYNC_LOCALS, this._asyncLocals[name], true];
  for (var i = 0, len = this._asyncLocals2.length; i < len; i++) {
    var item = this._asyncLocals2[i];
    if (item[0].test(name)) {
      return [this.ASYNC_LOCALS, item[1], true];
    }
  }
  return null;
};

/**
 * Fetch Single Locals
 *
 * @param {String} name
 * @param {Function} callback
 */
Context.prototype.fetchSingleLocals = function (name, callback) {
  var me = this;
  var info = me.getLocals(name);
  if (!info) return callback(null, info);

  switch (info[0]) {
    case me.STATIC_LOCALS:
      callback(null, info[1]);
      break;
    case me.SYNC_LOCALS:
      var v = info[1](name, me);
      if (info[2]) me.setLocals(name, v);
      callback(null, v);
      break;
    case me.ASYNC_LOCALS:
      info[1](name, function (err, v) {
        if (err) return callback(err);
        if (info[2]) me.setLocals(name, v);
        callback(null, v);
      }, me);
      break;
    default:
      callback(me.throwLocalsUndefinedError(name));
  }
};

/**
 * Fetch locals
 *
 * @param {Array|String} list
 * @param {Function} callback
 */
Context.prototype.fetchLocals = function (list, callback) {
  var me = this;

  if (Array.isArray(list)) {

    var values = [];
    utils.asyncEach(list, function (name, i, done) {
      me.fetchSingleLocals(name, function (err, val) {
        if (err) {
          values[i] = err;
        } else {
          values[i] = val;
        }
        done();
      });
    }, callback, null, values);

  } else {
    me.fetchSingleLocals(list, callback);
  }
};

/**
 * Get filter
 *
 * @param {String} name
 * @return {Array} [type, function]  return null if the filter not found
 */
Context.prototype.getFilter = function (name) {
  name = name.trim();
  if (name in this._filters) return [this.SYNC_FILTER, this._filters[name]];
  if (name in this._asyncFilters) return [this.ASYNC_FILTER, this._asyncFilters[name]];
  return null;
};

/**
 * Call filter
 *
 * @param {String} method
 * @param {Array} args
 * @param {Function} callback
 */
Context.prototype.callFilter = function (method, args, callback) {
  if (arguments.length < 3) {
    callback = args;
    args = [];
  }

  var info = this.getFilter(method);
  if (!info) return callback(this.throwFilterUndefinedError(method));

  if (info[0] === this.ASYNC_FILTER) {
    args.push(callback);
    args.push(this);
    info[1].apply(null, args);
  } else {
    args.push(this);
    callback(null, info[1].apply(null, args));
  }
};

/**
 * Print HTML
 *
 * @param {Object} str
 */
Context.prototype.print = function (str) {
  this._buffer += (str === null || typeof(str) === 'undefined') ? '' : str;
};

/**
 * Set buffer
 *
 * @param {String} buf
 */
Context.prototype.setBuffer = function (buf) {
  this._buffer = buf;
};

/**
 * Get buffer
 *
 * @return {String}
 */
Context.prototype.getBuffer = function () {
  return this._buffer;
};

/**
 * Clear buffer
 *
 * @return {String}
 */
Context.prototype.clearBuffer = function () {
  var buf = this.getBuffer();
  this.setBuffer('');
  return buf;
};

/**
 * Set cycle
 *
 * @param {String} name
 * @param {Array} list
 */
Context.prototype.setCycle = function (name, list) {
  this._cycles[name] = {index: 0, length: list.length, list: list};
};

/**
 * Get the index of the cycle
 *
 * @param {String} name
 * @return {Integer}
 */
Context.prototype.getCycleIndex = function (name) {
  var cycle = this._cycles[name];
  if (cycle) {
    cycle.index++;
    if (cycle.index >= cycle.length) cycle.index = 0;
    return cycle.index;
  } else {
    return null;
  }
};

/**
 * Enter a forloop
 *
 * @param {Integer} length
 * @param {String} itemName
 */
Context.prototype.forloopEnter = function (length, itemName) {
  this._forloops.push({
    length:   length,
    itemName: itemName
  });
  this._isInForloop = true;
};

/**
 * Set the forloop item value
 *
 * @param {Object} item
 * @param {Integer} index
 */
Context.prototype.forloopItem = function (item, index) {
  var loop = this._forloops[this._forloops.length - 1];
  loop.item = item;
  loop.index = index;
};

/**
 * Set the forloop information
 *
 * @return {Object}
 */
Context.prototype.forloopInfo = function () {
  return this._forloops[this._forloops.length - 1];
};

/**
 * Exit the current forloop
 */
Context.prototype.forloopEnd = function () {
  this._forloops.pop();
  if (this._forloops.length < 1) {
    this._isInForloop = false;
  }
};

/**
 * Enter a tablerowloop
 *
 * @param {Integer} length
 * @param {String} itemName
 * @param {Integer} columns
 */
Context.prototype.tablerowloopEnter = function (length, itemName, columns) {
  this._tablerowloops.push({
    length:   length,
    itemName: itemName,
    columns:  columns
  });
  this._isInTablerowloop = true;
};

/**
 * Set the tablerowloop item value
 *
 * @param {Object} item
 * @param {Integer} index
 * @param {Integer} colIndex
 */
Context.prototype.tablerowloopItem = function (item, index, colIndex) {
  var loop = this._tablerowloops[this._tablerowloops.length - 1];
  loop.item = item;
  loop.index = index;
  loop.colIndex = colIndex;
};

/**
 * Get the tablerow information
 *
 * @return {Object}
 */
Context.prototype.tablerowloopInfo = function () {
  return this._tablerowloops[this._tablerowloops.length - 1];
};

/**
 * Exit the current tablerowloop
 */
Context.prototype.tablerowloopEnd = function () {
  this._tablerowloops.pop();
  if (this._tablerowloops.length < 1) {
    this._isInTablerowloop = false;
  }
};

/**
 * Include a template file
 *
 * @param {String} name
 * @param {Array} localsAst
 * @param {Array} headerAst
 * @param {Function} callback
 */
Context.prototype.include = function (name, localsAst, headerAst, callback) {
  if (typeof headerAst === 'function') {
    callback = headerAst;
    headerAst = null;
  }

  var me = this;
  if (typeof(this._includeFileHandler) === 'function') {
    this._includeFileHandler(name, function (err, astList) {
      if (err) return callback(err);

      // all include files run on new context
      var c = new Context({parent: me});
      c.from(me);

      function start () {
        c.run(astList, function (err) {
          //console.log(err, c.getBuffer(), headerAst);
          me.print(c.clearBuffer());
          callback(err);
        });
      }

      if (headerAst && headerAst.length > 0) {
        astList = [me._position.line, me._position.column,OPCODE.LIST, headerAst, astList];
      }
      if (localsAst) {
        me.run(localsAst, function (err, locals) {
          if (err) locals = {};
          Object.keys(locals).forEach(function (n) {
            c._locals[n] = locals[n];
          });
          start();
        });
      } else {
        start();
      }
    });
  } else {
    return callback(new Error('please set an include file handler'));
  }
};

/**
 * Extends layout
 *
 * @param {String} name
 * @param {Function} callback
 */
Context.prototype.extends = function (name, callback) {
  if (typeof(this._includeFileHandler) === 'function') {
    this._includeFileHandler(name, callback);
  } else {
    return callback(new Error('please set an include file handler'));
  }
};

/**
 * Set the include file handler
 *
 * @param {Function} fn format: function (name, callback)
 *                      callback format: function (err, astList)
 */
Context.prototype.onInclude = function (fn) {
  this._includeFileHandler = fn;
};

/**
 * Throw locals undefined error
 *
 * @param {String} name
 * @return {Object}
 */
Context.prototype.throwLocalsUndefinedError = function (name) {
  debug('Locals ' + name + ' is undefined');
  return null;
};

/**
 * Throw loop item undefined error
 *
 * @param {String} name
 * @return {Object}
 */
Context.prototype.throwLoopItemUndefinedError = function (name) {
  debug('Loop item ' + name + ' is undefined');
  return null;
};

/**
 * Throw forloop/tablerow locals undefined error
 *
 * @param {String} name
 * @return {Object}
 */
Context.prototype.throwLoopLocalsUndefinedError = function (name) {
  debug('Loop locals ' + name + ' is undefined');
  return null;
};

/**
 * Throw filter undefined error
 *
 * @param {String} name
 * @return {Object}
 */
Context.prototype.throwFilterUndefinedError = function (name) {
  var err = new Error('Filter ' + name + ' is undefined ' + this.getCurrentPosition(true));
  err.code = 'UNDEFINED_FILTER';
  err = this.wrapCurrentPosition(err);
  return err;
}

/**
 * Throw unknown opcode error
 *
 * @param {String} code
 * @return {Object}
 */
Context.prototype.throwUnknownOpcodeError = function (code) {
  var err = new Error('Unknown opcode ' + code + ' ' + this.getCurrentPosition(true));
  err.code = 'UNKNOWN_OPCODE';
  err = this.wrapCurrentPosition(err);
  return err;
};

/**
 * Throw unknown tag error
 *
 * @param {String} name
 * @param {String} body
 * @return {Object}
 */
Context.prototype.throwUnknownTagError = function (name, body) {
  var err = new Error('Unknown tag "' + (name + ' ' + body).trim() + '" ' + this.getCurrentPosition(true));
  err.code = 'UNKNOWN_TAG';
  err = this.wrapCurrentPosition(err);
  return err;
};

/**
 * Set current position
 *
 * @param {Integer} line
 * @param {Integer} column
 */
Context.prototype.setCurrentPosition = function (line, column) {
  this._position.line = line;
  this._position.column = column;
};

/**
 * Get current position
 *
 * @param {Boolean} getString
 * @return {Object}
 */
Context.prototype.getCurrentPosition = function (getString) {
  if (getString) {
    return 'at line ' + this._position.line + ', column ' + this._position.column;
  } else {
    return this._position;
  }
};

/**
 * Wrap current position on a error object
 *
 * @param {Object} err
 * @return {Object}
 */
Context.prototype.wrapCurrentPosition = function (err) {
  err = err || {};
  err.line = this._position.line;
  err.column = this._position.column;
  return err;
};

/**
 * Push Filename
 *
 * @param {String} filename
 * @return {String}
 */
Context.prototype.pushFilename = function (filename) {
  this._filenameStack.push(filename);
  return filename;
};

/**
 * Pop Filename
 *
 * @return {String}
 */
Context.prototype.popFilename = function () {
  return this._filenameStack.pop();
};

/**
 * Get filename
 *
 * @return {String}
 */
Context.prototype.getFilename = function () {
  return this._filenameStack[this._filenameStack.length - 1];
};

},{"./filters":2,"./opcode":5,"./parser":6,"./utils":7,"./vm":8}],2:[function(require,module,exports){
'use strict';

/**
 * Default Filters
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */


/**
 * To string, if it's undefined or null, return an empty string
 *
 * @param {Object} text
 * @return {String}
 */
var toString = function (text) {
  return (text === null || typeof(text) === 'undefined') ? '' : String(text);
};

/*---------------------------- HTML Filters ----------------------------------*/
/**
 * Generate <img> tag
 *
 * @param {String} url
 * @param {String} alt
 * @return {String}
 */
exports.img_tag = function (url, alt) {
  return '<img src="' + exports.escape(url) + '" alt="' + exports.escape(alt || '') + '">';
};

/**
 * Generate <script> tag
 *
 * @param {String} url
 * @return {String}
 */
exports.script_tag = function (url) {
  return '<script src="' + exports.escape(url) + '"></sc' + 'ript>';
};

/**
 * Generate <link> tag
 *
 * @param {String} url
 * @param {String} media
 * @return {String}
 */
exports.stylesheet_tag = function (url, media) {
  return '<link href="' + exports.escape(url) + '" rel="stylesheet" type="text/css" media="' +
         exports.escape(media || 'all') + '" />';
};

/**
 * Generate <a> tag
 *
 * @param {String} link
 * @param {String} url
 * @param {String} title
 * @return {String}
 */
exports.link_to = function (link, url, title) {
  return '<a href="' + exports.escape(url || '') + '" title="' + exports.escape(title || '') + '">' +
         exports.escape(link) + '</a>';
};

/*-----------------------------Math Filters-----------------------------------*/
/**
 * Add
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.plus = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input + operand;
};

/**
 * Subtract
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.minus = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input - operand;
};

/**
 * Multiply
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.times = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input * operand;
};

/**
 * Divide
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.divided_by = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input / operand;
};

/**
 * Round (specify how many places after the decimal)
 *
 * @param {Number} input
 * @param {Number} point
 * @return {Number}
 */
exports.round = function (input, point) {
  point = parseInt(point, 10) || 0;
  if (point < 1) return Math.round(input);
  var n = Math.pow(10, point);
  return Math.round(input * n) / n;
};

/**
 * Round
 *
 * @param {Number} input
 * @return {Number}
 */
exports.integer = function (input) {
  return parseInt(input, 10) || 0;
};

/**
 * Generate random number such that: m <= Number < n
 *
 * @param {Number} m
 * @param {Number} n
 * @return {Number}
 */
exports.random = function (m, n) {
  m = parseInt(m);
  n = parseInt(n);
  if (!isFinite(m)) return Math.random();
  if (!isFinite(n)) {
    n = m;
    m = 0;
  }
  return Math.random() * (n - m) + m;
};

/**
 *  If input > 1 return singular, otherwise plural
 *
 * @param {Number} input
 * @param {String} singular
 * @param {String} plural
 * @return {String}
 */
exports.pluralize = function (input, singular, plural) {
  return Number(input) > 1 ? plural : singular;
};

/*-------------------------- Date and Time filters ----------------------------*/
/**
 * Take the current time in milliseconds and add 0
 *
 * @param {Number} input
 * @return {Number}
 */
exports.timestamp = function (input) {
  input = parseInt(input, 10) || 0;
  return new Date().getTime() + input;
};

/**
 * Format date/time
 * see syntax reference: http://liquid.rubyforge.org/classes/Liquid/StandardFilters.html#M000012
 *
 * @param {String} input
 * @param {String} format
 * @return {String}
 */
exports.date = function (input, format) {
  if (toString(input).toLowerCase() == 'now') {
    var time = new Date();
  } else {
    var timestamp = parseInt(input, 10);
    if (timestamp == input) {
      var time = new Date(timestamp);
    } else {
      var time = new Date(input);
    }
  }
  if (!time || !isFinite(time.valueOf())) return 'Invalid Date';
  if (!format) format = '%Y-%m-%j %H:%M:%S';
  // example: ["Wed", "Apr", "11", "2012"]
  var dates = time.toDateString().split(/\s/);
  // example: ["Wednesday,", "April", "11,", "2012"]
  var dateS = time.toLocaleDateString().split(/\s/);
  // example: ["10", "37", "44", "GMT", "0800", "(中国标准时间)"]
  var times = time.toTimeString().split(/[\s:\+]/);
  var n2 = function (n) {
    return n < 10 ? '0' + n : n;
  };
  var replace = {
    a:      dates[0],                   // week day
    A:      dateS[0],
    b:      dates[1],                   // month
    B:      dateS[1],
    c:      time.toLocaleString(),
    d:      dates[2],
    H:      times[0],                   // 24 hour
    I:      times[0] % 12,              // 12 hour
    j:      dates[2],                   // date
    m:      n2(time.getMonth() + 1),    // month
    M:      times[1],                   // minute
    p:      Number(times[0]) < 12 ? 'AM' : 'PM',
    S:      times[2],                   // second
    U:      weekNo(time),               // start on Sunday
    W:      weekNo(time, true),         // start on Monday
    w:      time.getDay(),              // week day (0-6)
    x:      time.toDateString(),
    X:      time.toTimeString(),
    y:      dates[3].substr(-2),        // year
    Y:      dates[3],
    Z:      times[4]                    // time zone
  };
  var ret = toString(format);
  for (var i in replace) {
    ret = ret.replace(new RegExp('%' + i, 'g'), replace[i]);
  }
  return ret;
};

function weekNo (now, mondayFirst) {
  var totalDays = 0;
  var years = now.getFullYear();
  var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (years % 100 === 0) {
    if (years % 400 === 0) days[1] = 29;
  } else if (years % 4 === 0) {
    days[1] = 29;
  }
  if (now.getMonth() === 0) {
    totalDays = totalDays + now.getDate();
  } else {
    var curMonth = now.getMonth();
    for (var count = 1; count <= curMonth; count++) {
      totalDays = totalDays + days[count - 1];
    }
    totalDays = totalDays + now.getDate();
  }
  // default to start on Sunday
  var week = Math.round(totalDays / 7);
  if (mondayFirst && new Date(toString(years)).getDay() === 0) week += 1;
  return week;
}

/*---------------------------Strings Filters-----------------------------*/
/**
 * Append to the end of string
 *
 * @param {String} input
 * @param {String} characters
 * @return {String}
 */
exports.append = function (input, characters) {
  if (!characters) return toString(input);
  return toString(input) + toString(characters);
};

/**
 * Prepend to the begining
 *
 * @param {String} input
 * @param {String} characters
 * @return {String}
 */
exports.prepend = function (input, characters) {
  if (!characters) return toString(input);
  return toString(characters) + toString(input);
};

/**
 * Combine to one camelized name
 *
 * @param {String} input
 * @return {String}
 */
exports.camelize = function (input) {
  input = toString(input);
  return input.replace(/[^a-zA-Z0-9]+(\w)/g, function(_, ch) {
    return ch.toUpperCase();
  });
};

/**
 * Combine to one capitalized name
 *
 * @param {String} input
 * @return {String}
 */
exports.capitalize = function (input) {
  input = toString(input);
  if (input.length < 1) return input;
  return input[0].toUpperCase() + input.substr(1);
};

/**
 * To lowercase
 *
 * @param {String} input
 * @return {String}
 */
exports.downcase = function (input) {
  return toString(input).toLowerCase();
};

/**
 * To uppercase
 *
 * @param {String} input
 * @return {String}
 */
exports.upcase = function (input) {
  return toString(input).toUpperCase();
};

/**
 * Escape for use in HTML
 *
 * @param {String} input
 * @return {String}
 */
exports.escape = function (input) {
  return toString(input)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Unescape HTML
 *
 * @param {String} input
 * @return {String}
 */
exports.unescape = function (input) {
  return toString(input)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
};

/**
 * Combine to hyphen separated word: 'this-is-a-book'
 *
 * @param {String} input
 * @return {String}
 */
exports.handleize = function (input) {
  return toString(input).replace(/[^0-9a-zA-Z ]/g, '').replace(/[ ]+/g, '-').toLowerCase();
};

/**
 * Replace the first occurrence of substring with replacement
 *
 * @param {String} input
 * @param {String} substring
 * @param {String} replacement
 * @return {String}
 */
exports.replace_first = function (input, substring, replacement) {
  return toString(input).replace(substring, replacement);
};

/**
 * Replace all occurrences of substring with replacement
 *
 * @param {String} input
 * @param {String} substring
 * @param {String} replacement
 * @return {String}
 */
exports.replace = function (input, substring, replacement) {
  input = toString(input);
  while (input.indexOf(substring) > -1) {
    input = input.replace(substring, replacement);
  }
  return input;
};

/**
 * Remove all occurrences of substring
 *
 * @param {String} input
 * @param {String} substring
 * @return {String}
 */
exports.remove = function (input, substring) {
  return exports.replace(input, substring, '');
};

/**
 * Remove the first occurrence of substring
 *
 * @param {String} input
 * @param {String} substring
 * @return {String}
 */
exports.remove_first = function (input, substring) {
  return exports.replace_first(input, substring, '');
};

/**
 * Replace all newline characters with "<br>"
 *
 * @param {String} input
 * @return {String}
 */
exports.newline_to_br = function (input) {
  return toString(input).replace(/\n/img, '<br>');
};

/**
 * Split the string at each occurrence of '-' (returns an array)
 *
 * @param {String} input
 * @param {String} delimiter
 * @return {String}
 */
exports.split = function (input, delimiter) {
  if (!delimiter) delimiter = '';
  return toString(input).split(delimiter);
};

/**
 * Return the string length
 *
 * @param {array|string} input
 * @return {String}
 */
exports.size = function (input) {
  if (!input) return 0;
  var len = input.length;
  return len > 0 ? len : 0;
};

/**
 * Remove all HTML tags
 *
 * @param {String} text
 * @return {String}
 */
exports.strip_html = function (text) {
  return toString(text).replace(/<[^>]*>/img, '');
};

/**
 * Remove all newline characters
 *
 * @param {String} input
 * @return {String}
 */
exports.strip_newlines = function (input) {
  return toString(input).replace(/[\r\n]+/g, '');
};

/**
 * Return only the first N characters
 *
 * @param {String} input
 * @param {Number} n
 * @return {String}
 */
exports.truncate = function (input, n) {
  n = parseInt(n, 10);
  if (!isFinite(n) || n < 0) n = 100;
  return toString(input).substr(0, n);
};

/**
 * Return only the first N words
 *
 * @param {String} input
 * @param {Number} n
 * @return {String}
 */
exports.truncatewords = function (input, n) {
  n = parseInt(n, 10);
  if (!isFinite(n) || n < 0) n = 15;
  return toString(input).trim().split(/ +/).slice(0, n).join(' ');
};

/**
 * Reverse the characters in the string
 *
 * @param {string|array} arr
 * @return {string|array}
 */
exports.reverse = function (arr) {
  return Array.isArray(arr) ? arr.reverse() : toString(arr).split('').reverse().join('');
};

/**
 * Extracts parts of a string, beginning at the character at the specified posistion 'start',
 * and returns the specified number of characters 'length'.
 *
 * @param {String} input
 * @param {Number} start
 * @param {Number} length
 * @return {String}
 */
exports.substr = function (input, start, length) {
  return toString(input).substr(start, length);
};

/**
 * Search a substring, return its index position
 *
 * @param {string|array} arr
 * @param {Object} searchvalue
 * @param {Number} fromindex
 * @return {Number}
 */
exports.indexOf = function (arr, searchvalue, fromindex) {
  if (!Array.isArray(arr)) arr = toString(arr);
  return arr.indexOf(searchvalue, fromindex);
};

/**
 * If input is empty, default returns value, otherwise, the input.
 * Can be used with strings, arrays, and hashes.
 *
 * @param  {string|array|object} input
 * @param  {string|array|object} value
 * @return {string|array|object}
 */
exports.default = function(input, value) {
  return (input && input.length > 0)
    ? toString(input)
    : toString(value);
};


/*----------------------- Arrays and Objects Filters -------------------------*/

function objectGetKeys (obj) {
  return ((obj && typeof obj === 'object') ? Object.keys(obj) : []);
}

function getFirstKey (obj) {
  if (Array.isArray(obj)) {
    return 0;
  } else {
    var keys = objectGetKeys(obj);
    return keys[0] || '';
  }
};

function getLastKey (obj) {
  if (Array.isArray(obj)) {
    return obj.length - 1;
  } else {
    var keys = objectGetKeys(obj);
    return keys.pop() || '';
  }
};

/**
 * Return an array of the object's keys
 *
 * @param {Object} input
 * @return {Array}
 */
exports.keys = function (input) {
  try {
    return objectGetKeys(input);
  } catch (err) {
    return [];
  }
};

/**
 * Return the first element of an array
 *
 * @param {Array} array
 * @return {Object}
 */
exports.first = function (array) {
  return array && array[getFirstKey(array)];
};

/**
 * Return the last element of an array
 *
 * @param {Array} array
 * @return {Object}
 */
exports.last = function (array) {
  return array && array[getLastKey(array)];
};

/**
 * Join the array's elements into a string
 *
 * @param {Array} input
 * @param {String} segmenter
 * @return {String}
 */
exports.join = function (input, segmenter) {
  if (!segmenter) segmenter = ' ';
  if (Array.isArray(input)) {
    return input.join(segmenter);
  } else {
    return '';
  }
};

/**
 * Return a JSON string of the object
 *
 * @param {Object} input
 * @return {String}
 */
exports.json = function (input) {
  try {
    var ret = JSON.stringify(input);
  } catch (err) {
    return '{}';
  }
  return typeof ret !== 'string' ? '{}' : ret;
};

/**
 * Get an item of the Object by property name
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Object}
 */
exports.get = function(obj, prop){
  if (!obj) obj = {};
  return obj[prop];
};

/**
 * Take the specified property of each element in the array, returning a new array
 *
 * @param {Array} arr
 * @param {String} prop
 * @return {Array}
 */
exports.map = function (arr, prop) {
  if (!Array.isArray(arr)) return [];
  return arr.map(function(obj){
    return obj && obj[prop];
  });
};

/**
 * Sort the array's elements by asc or desc order
 *
 * @param {Array} arr
 * @param {Number} order
 * @return {Array}
 */
exports.sort = function (arr, order) {
  if (!Array.isArray(arr)) return [];
  order = toString(order).trim().toLowerCase();
  var ret1 = order === 'desc' ? -1 : 1;
  var ret2 = 0 - ret1;
  return arr.sort(function (a, b) {
    if (a > b)  return ret1;
    if (a < b)  return ret2;
    return 0;
  });
};

/**
 * Sort the array's elements by each element's specified property
 *
 * @param {Array} obj
 * @param {String} prop
 * @param {Number} order
 * @return {Array}
 */
exports.sort_by = function (obj, prop, order) {
  if (!Array.isArray(obj)) return [];
  order = toString(order).trim().toLowerCase();
  var ret1 = order === 'desc' ? -1 : 1;
  var ret2 = 0 - ret1;
  return Object.create(obj).sort(function (a, b) {
    a = a[prop];
    b = b[prop];
    if (a > b) return ret1;
    if (a < b) return ret2;
    return 0;
  });
};

/*------------------------------- Other Filters ------------------------------*/
/**
 * Get page count of the items when paginated
 *
 * @param {Number} count
 * @param {Number} size
 * @param {Number} page
 * @listurn {Array}
 */
exports.pagination = function (count, size, page) {
  if (count % size === 0) {
    var maxPage = parseInt(count / size, 10);
  } else {
    var maxPage = parseInt(count / size, 10) + 1;
  }
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  page = parseInt(page);

  var list = [page - 2, page - 1, page, page + 1, page + 2];
  for (var i = 0; i < list.length;) {
    if (list[i] < 1 || list[i] > maxPage) {
      list.splice(i, 1);
    } else {
      i++;
    }
  }
  if (list[0] !== 1) {
    list.unshift('...');
    list.unshift(1);
  }
  if (list[list.length - 1] < maxPage) {
    list.push('...');
    list.push(maxPage);
  }

  var ret = {
    current:    page,
    next:       page + 1,
    previous:   page - 1,
    list:       list
  };
  if (ret.next > maxPage) ret.next = maxPage;
  if (ret.previous < 1)   ret.previous = 1;

  return ret;
};

},{}],3:[function(require,module,exports){
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

},{"../package.json":10,"./context":1,"./filters":2,"./opcode":5,"./parser":6,"./utils":7,"./vm":8}],4:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}function rstr2hex(c){try{hexcase}catch(g){hexcase=0}var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}return b}function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}return b}function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}return a}function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}return a}function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}return Array(o,n,m,l)}function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};

module.exports = hex_md5;
},{}],5:[function(require,module,exports){
/**
 * Define OPCODE
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var OPCODE = {

  // unknown opcode
  UNKNOWN:            0,

  // base opcode
  AND:                1,
  ASSIGN:             2,
  CAPTURE:            3,
  CASE:               4,
  COMMENT:            5,
  COMPILER_VERSION:   6,
  CONTAINS:           7,
  CYCLE:              8,
  DEBUG:              9,
  ED:                 10,
  EQ:                 11,
  EXISTS:             12,
  FILTER:             13,
  FOR:                14,
  FORLOOPITEM:        15,
  FORLOOPLOCALS:      16,
  GE:                 17,
  GT:                 18,
  HASKEY:             19,
  HASVALUE:           20,
  IF:                 21,
  INCLUDE:            22,
  LE:                 23,
  LIST:               24,
  LOCALS:             25,
  LT:                 26,
  NE:                 27,
  NOT:                28,
  OBJECT:             29,
  OR:                 30,
  RANGE:              31,
  PRINT:              32,
  PRINTLOCALS:        33,
  PRINTSTRING:        34,
  TABLEROW:           35,
  TABLEROWITEM:       36,
  TABLEROWLOOPLOCALS: 37,
  UNKNOWN_TAG:        38,
  WHEN:               39,

  // forloop/tablerow attribute
  LOOPLOCALS_LENGTH:      50,
  LOOPLOCALS_NAME:        51,
  LOOPLOCALS_INDEX0:      52,
  LOOPLOCALS_INDEX:       53,
  LOOPLOCALS_RINDEX0:     54,
  LOOPLOCALS_RINDEX:      55,
  LOOPLOCALS_FIRST:       56,
  LOOPLOCALS_LAST:        57,
  LOOPLOCALS_COL0:        58,
  LOOPLOCALS_COL:         59,
  LOOPLOCALS_COL_FIRST:   60,
  LOOPLOCALS_COL_LAST:    61,
  LOOPLOCALS_UNKNOWN:     62,

  // extension instruction
  TEMPLATE_FILENAME_PUSH: 80,
  TEMPLATE_FILENAME_POP:  81,

  // this "assign" will only affected current context
  WEAK_ASSIGN: 82,

  // extends and block
  EXTENDS: 83,
  BLOCK: 84

};

module.exports = exports = OPCODE;

// just for test
// for (var i in OPCODE) OPCODE[i] = i;

},{}],6:[function(require,module,exports){
/**
 * Parse template
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var OPCODE = require('./opcode');
var merge = utils.merge;
var ASTStack = utils.ASTStack;
var localsAstNode = utils.localsAstNode;
var isQuoteWrapString = utils.isQuoteWrapString;
var textIndexOf = utils.textIndexOf;
var splitText = utils.splitText;
var stripQuoteWrap = utils.stripQuoteWrap;
var jsonStringify = utils.jsonStringify;
var md5 = utils.md5;
var arrayRemoveEmptyString = utils.arrayRemoveEmptyString;
var genRandomName = utils.genRandomName;


/**
 * Parser context object
 *
 * @param {Object} options
 */
var Context = function (options) {
  this.astStack = new ASTStack();
  this.tags = options.customTags;
  this.raw = '';
  this.disableParseTag = false;
  this.line = 1;
  this.lineStart = 0;
  this.position = 0;
  this.parseTagStack = [];
  this.forItems = [];
  this.tablerowItems = [];
  this.forItems.test = this.tablerowItems.test = function (name) {
    var name = name.split('.')[0];
    return this.indexOf(name) === -1 ? false : true;
  };
};

/**
 * Enable parse tag
 */
Context.prototype.enableParseTag = function () {
  var parseTagStack = this.parseTagStack;
  if (parseTagStack.length < 1) {
    return true;
  } else {
    return parseTagStack[parseTagStack.length - 1].apply(null, arguments);
  }
};

/**
 * Get current position
 *
 * @return {Object}
 */
Context.prototype.getPosition = function () {
  return {
    line:   this.line,
    column: this.position - this.lineStart + 2
  };
};

/**
 * Generate a new AST node
 *
 * @return {Array}
 */
Context.prototype.astNode = function () {
  var pos = this.getPosition();
  var ast = [pos.line, pos.column];
  for (var i = 0, len = arguments.length; i < len; i++) {
    ast.push(arguments[i]);
  }
  return ast;
};


/**
 * Parse template, return AST array
 *
 * @param {String} tpl
 * @param {Object} options
 *   - {Object} customTags
 * @return {Array}
 */
var parser = exports = module.exports = function (tpl, options) {
  options =options || {};
  var customTags = options.customTags = merge(baseTags, options.customTags);

  // parser context
  var context = new Context(options);

  // compiler version
  context.astStack.push(context.astNode(OPCODE.COMPILER_VERSION, 1));

  var mainAst = context.astNode(OPCODE.LIST);

  var strTmp = '';
  function flush () {
    context.astStack.push(context.astNode(OPCODE.PRINTSTRING, strTmp));
    strTmp = '';
  }

  for (var i = 0, len = tpl.length; i < len; i++) {
    context.position = i;
    var c = tpl[i];
    if (c === '\n') {
      context.line++;
      context.lineStart = i;
    }
    var text = tpl.substr(i, 2);
    if (context.disableParseTag) {
      // -----------------------------------------------------------------------
      // raw
      if (text === '{%') {
        var e = textIndexOf(tpl, '%}', i);
        var body = tpl.slice(i + 2, e).trim();
        context.raw = strTmp;
        if (e > i && context.enableParseTag(context, body, body)) {
          context.disableParseTag = false;
          strTmp = '';
          context.raw = '';
          i = e + 1;
        } else {
          strTmp += c;
        }
      } else {
        strTmp += c;
      }
    } else { // ----------------------------------------------------------------
      // normal
      if (text === '{{') {
        var e = textIndexOf(tpl, '}}', i);
        if (e > i) {
          flush();
          context.astStack.push(parseOutput(tpl.slice(i + 2, e).trim(), context));
          i = e + 1;
        }
      } else if (text === '{%') {
        var e = textIndexOf(tpl, '%}', i);
        if (e > i) {
          // optimize: trim left
          var e2 = strTmp.lastIndexOf('\n');
          if (e2 !== -1) {
            if (strTmp.slice(e2 + 1).trim() === '') {
              strTmp = strTmp.slice(0, e2 + 1);
            }
          }
          // parse tag
          flush();
          parseTag(context, tpl.slice(i + 2, e).trim());
          i = e + 1;
          // optimize: trim right
          var e3 = tpl.indexOf('\n', i + 1);
          if (e3 !== -1) {
            if ((tpl.slice(i + 1, e3 + 1).trim() === '')) {
              i = e3;
              context.line++;
              context.lineStart = i;
            }
          }
        }
      } else {
        strTmp += c;
      }
      // -----------------------------------------------------------------------
    }
  }
  flush();

  return mainAst.concat(context.astStack.result());
};


// Default parser component
var baseTags = {

  'if': function (context, name, body) {
    var ast = parseCondition(body, context);
    context.astStack.newChild(context.astNode(OPCODE.IF, ast)).newChild(context.astNode(OPCODE.LIST));
  },


  'unless': function (context, name, body) {
    var ast = parseCondition(body, context);
    context.astStack.newChild(context.astNode(OPCODE.IF, context.astNode(OPCODE.NOT, ast))).newChild(context.astNode(OPCODE.LIST));
  },


  'else': function (context, name, body) {
    context.astStack.close().newChild(context.astNode(OPCODE.LIST));
  },


  'endif': function (context, name, body) {
    context.astStack.close();
    // reset the AST structure
    var ast = context.astStack.last();
    context.astStack.close();
    var reset = function (ast) {
      if (ast.length > 6) {
        var a = ast.slice(0, 5);
        a[5] = reset(context.astNode(OPCODE.IF).concat(ast.slice(5)));
        return a;
      } else {
        return ast;
      }
    };
    var list = context.astStack.last();
    if (list) {
      list.pop();
      list.push(reset(ast));
    } else {
      context.astStack.list.push(context.astNode(OPCODE.PRINTSTRING, '{% endif %}'));
    }
  },


  'endunless': function (context, name, body) {
    context.astStack.close().close();
  },


  'elseif': function (context, name, body) {
    context.astStack.close();
    var ast = parseCondition(body, context);
    context.astStack.push(ast).newChild(context.astNode(OPCODE.LIST));
  },


  'elsif': function (context, name, body) {
    context.astStack.close();
    var ast = parseCondition(body, context);
    context.astStack.push(ast).newChild(context.astNode(OPCODE.LIST));
  },


  'case': function (context, name, body) {
    var ast = parseVariables(body, context);
    context.astStack.newChild(context.astNode(OPCODE.CASE)).newChild(ast);
  },


  'when': function (context, name, body) {
    context.astStack.close();
    var ast = parseWhen(body, context);
    context.astStack.push(context.astNode(OPCODE.WHEN, ast)).newChild(context.astNode(OPCODE.LIST));
  },


  'endcase': function (context, name, body) {
    context.astStack.close().close();
  },


  'for': function (context, name, body) {
    var arr = parseFor(body);
    var attrs = arr[2];
    context.astStack.newChild(context.astNode(OPCODE.FOR, localsAstNode(arr[0], context), arr[1],
                                              attrs.offset, attrs.limit)).newChild(context.astNode(OPCODE.LIST));
    context.forItems.push(arr[1]);
  },


  'endfor': function (context, name, body) {
    context.astStack.close().close();
    context.forItems.pop();
  },


  'tablerow': function (context, name, body) {
    var arr = parseFor(body);
    var attrs = arr[2];
    attrs.cols = parseInt(attrs.cols);
    if (!(attrs.cols > 1)) attrs.cols = 1;
    context.astStack.newChild(context.astNode(OPCODE.TABLEROW, localsAstNode(arr[0], context), arr[1],
                                              attrs.offset, attrs.limit, attrs.cols))
                    .newChild(context.astNode(OPCODE.LIST));
    context.tablerowItems.push(arr[1]);
  },


  'endtablerow': function (context, name, body) {
    context.astStack.close().close();
    context.tablerowItems.pop();
  },


  'assign': function (context, name, body) {
    var i = body.indexOf('=');
    if (i !== -1) {
      var left = body.substr(0, i).trim();
      var right = body.substr(i + 1).trim();
      var ast = parseVariables(right, context);
      context.astStack.push(context.astNode(OPCODE.ASSIGN, left, ast));
    }
  },


  'capture': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var name = blocks[0] || genRandomName();
    if (!blocks[0]) {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, 'warning: missing name in {% capture %}'));
    }
    context.astStack.newChild(context.astNode(OPCODE.CAPTURE, name));
  },


  'endcapture': function (context, name, body) {
    context.astStack.close();
  },


  'block': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var name = blocks[0] || genRandomName();
    if (!blocks[0]) {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, 'warning: missing name in {% block %}'));
    }
    context.astStack.newChild(context.astNode(OPCODE.BLOCK, name));
  },


  'endblock': function (context, name, body) {
    context.astStack.close();
  },


  'cycle': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ', ',']));
    blocks = blocks.filter(function (item) {
      return item === ',' ? false : true;
    });
    if (blocks.length > 0) {
      var i = blocks[0].indexOf(':');
      if (i !== -1) {
        var key = blocks[0].substr(0, i);
        blocks[0] = blocks[0].substr(i + 1);
        if (blocks[0].length < 1) {
          blocks.shift();
        }
      } else {
        var key = md5(blocks.join(':')).substr(0, 8);
      }
      blocks = blocks.map(function (item) {
        return localsAstNode(item, context);
      });
      context.astStack.push(context.astNode(OPCODE.CYCLE, key).concat(blocks));
    }
  },


  'extends': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));

    if (blocks.length === 0) {
      // syntax error
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, '{% extends ' + body + ' %}'));
      return;
    }

    // get the filename
    var bf = blocks[0];
    if (bf.substr(0, 2) === '{{') {
      // filename is a variable
      for (var i = 1; i < blocks.length; i++) {
        var b = blocks[i];
        bf += b;
        if (b.substr(-2) === '}}') {
          break;
        }
      }
      filename = parseVariables(bf.slice(2, -2), context);
      blocks = blocks.slice(i + 1);
    } else {
      // filename is a string
      filename = stripQuoteWrap(bf);
      blocks = blocks.slice(1);
    }

    context.astStack.push(context.astNode(OPCODE.EXTENDS, filename));
  },


  'include': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var filename, withLocals, parameters;
    // support the following pattern:
    // {% include xxx %} or {% include "xxx" %}
    // {% include {{xx}} %} and with filters: {% include {{xx | yy}} %}
    // {% include xxx with yy %}
    // {% include xxx a=1 b=2 %}

    if (blocks.length === 0) {
      // syntax error
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, '{% include ' + body + ' %}'));
      return;
    } else if (blocks.length === 1 &&
               !(blocks[0].substr(0, 2) === '{{' && blocks[0].substr(-2) === '}}')) {
      // filename is a string
      filename = stripQuoteWrap(blocks[0]).trim();
    } else {
      if (blocks.length >= 3 && blocks[blocks.length - 2].toLowerCase() === 'with') {
        // if include "with" syntax
        withLocals = localsAstNode(stripQuoteWrap(blocks[blocks.length - 1]), context);
        blocks = blocks.slice(0, -2);
      }
      // get the filename
      var bf = blocks[0];
      if (bf.substr(0, 2) === '{{') {
        // filename is a variable
        for (var i = 1; i < blocks.length; i++) {
          var b = blocks[i];
          bf += b;
          if (b.substr(-2) === '}}') {
            break;
          }
        }
        filename = parseVariables(bf.slice(2, -2), context);
        blocks = blocks.slice(i + 1);
      } else {
        // filename is a string
        filename = stripQuoteWrap(bf).trim();
        blocks = blocks.slice(1);
      }

      // parse multi-part parameters
      if (blocks.length > 0) {
        blocks = arrayRemoveEmptyString(splitText(blocks.join(' '), [' ', '=']));
        var parts = [];
        var pi = 0;
        function addPart (i) {
          if (i < 0) return;
          parts.push(blocks.slice(pi, i + 1).join(''));
          pi = i + 1;
        }
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i];
          if (b === '=') {
            addPart(i - 2);
          }
        }
        addPart(i);
        parameters = context.astNode(OPCODE.LIST);
        //console.log(blocks, parts);
        parts.forEach(function (part) {
          var i = part.indexOf('=');
          if (i !== -1) {
            var left = part.substr(0, i).trim();
            var right = part.substr(i + 1).trim();
            var ast = parseVariables(right, context);
            parameters.push(context.astNode(OPCODE.WEAK_ASSIGN, left, ast));
          }
        });
      }
    }
    context.astStack.push(context.astNode(OPCODE.INCLUDE, filename, withLocals, parameters));
  },


  'raw': function (context, name, body) {
    context.disableParseTag = true;
    context.parseTagStack.push(context.tags.endraw);
  },


  'endraw': function (context, name, body) {
    if (name.toLowerCase() === 'endraw') {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, context.raw));
      return true;
    } else {
      return false;
    }
  },


  'comment': function (context, name, body) {
    context.disableParseTag = true;
    context.parseTagStack.push(context.tags.endcomment);
  },


  'endcomment': function (context, name, body) {
    if (name.toLowerCase() === 'endcomment') {
      context.astStack.push(context.astNode(OPCODE.COMMENT, context.raw));
      return true;
    } else {
      return false;
    }
  }
};

/**
 * Parse "filter"
 *
 * @param {String} text
 * @param {Array} firstArg
 * @param {Array} link
 * @param {Object} context
 * @return {Array}
 */
var parseFilter = parser.parseFilter = function (text, firstArg, link, context) {
  text = text.trim();
  var i = text.indexOf(':');
  if (i === -1) {
    var name = text;
    var args = [];
  } else {
    var name = text.slice(0, i);
    var args = splitText(text.slice(i + 1).trim(), [',']).filter(function (item) {
      return (item !== ',');
    });
  }
  args = args.map(function (item) {
    return localsAstNode(item.trim(), context);
  });
  args.unshift(firstArg);
  var ast = context.astNode(OPCODE.FILTER, name).concat(args);
  if (link.length > 0) {
    return parseFilter(link.shift(), ast, link, context);
  } else {
    return ast;
  }
};

/**
 * Parse "condition"
 *
 * @param {String} body
 * @param {Object} context
 * @return {Array}
 */
var parseCondition = parser.parseCondition = function (body, context) {
  var cond = body.trim();
  var blocks = arrayRemoveEmptyString(splitText(cond,
               [' ', '===', '&&', '||', '>=', '<=', '==', '!=', '<>', '=', '>', '<', '!']));
  var trans = {
    '&&': 'and',
    '||': 'or',
    '>':  'gt',
    '<':  'lt',
    '=':  'eq',
    '==': 'eq',
    '===':'ed',
    '<>': 'ne',
    '!=': 'ne',
    '>=': 'ge',
    '<=': 'le',
    '!':  'not'
  };
  blocks = blocks.map(function (item) {
    return (trans[item] || item);
  });

  // extract the "and" and "or"
  var _blocks = blocks;
  blocks = [];
  var tmp = [];
  var flush = function () {
    if (tmp.length > 0) {
      blocks.push(tmp);
      tmp = [];
    }
  };
  _blocks.forEach(function (item) {
    if (item.toLowerCase() === 'and' || item.toLowerCase() === 'or') {
      flush();
      blocks.push(item.toLowerCase());
    } else {
      tmp.push(item);
    }
  });
  flush();

  // generate condition AST
  var condAst = [];
  blocks.forEach(function (item) {
    if (Array.isArray(item)) {
      if (item.length === 1) {
        var ast = context.astNode(OPCODE.EXISTS, localsAstNode(item[0], context));
      } else if (item.length === 2) {
        var code = OPCODE[item[0].toUpperCase()] || OPCODE.DEBUG;
        var ast = context.astNode(code, localsAstNode(item[1], context));
      } else {
        var code = OPCODE[item[1].toUpperCase()] || OPCODE.DEBUG;
        var ast = context.astNode(code, localsAstNode(item[0], context), localsAstNode(item[2], context));
      }
      condAst.push(ast);
    } else {
      condAst.push(item);
    }
  });
  var mergeCond = function (op) {
    var ret = false;
    if (blocks.length < 3) return ret;
    var _condAst = condAst;
    condAst = [];
    for (var i = 0, len = _condAst.length; i < len; i++) {
      var mid = _condAst[i + 1];
      if (typeof(mid) === 'string' && mid.toLowerCase() === op && i + 2 < len) {
        var code = OPCODE[op.toUpperCase()] || OPCODE.DEBUG;
        condAst.push(context.astNode(code, _condAst[i], _condAst[i + 2]));
        i += 2;
        ret = true;
      } else {
        condAst.push(_condAst[i]);
      }
    }
    return ret;
  };
  // and > or
  while (mergeCond('and')) {
    // do nothing
  }
  while (mergeCond('or')) {
    // do nothing
  }
  return condAst[0];
};

/**
 * Parse "when"
 *
 * @param {String} body
 * @param {Object} context
 * @return {Array}
 */
var parseWhen = parser.parseWhen = function (body, context) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ', 'or']));
  blocks = blocks.filter(function (item) {
    return item === 'or' ? false : true;
  }).map(function (item) {
    var ast = localsAstNode(item, context);
    if (!Array.isArray(ast)) ast = context.astNode(OPCODE.OBJECT, ast);
    return ast;
  });
  return blocks;
};

/**
 * Parse "variables"
 * 如：  a | call:1,2 | lower
 *
 * @param {String} text
 * @param {Object} context
 * @return {Array}
 */
var parseVariables = parser.parseVariables = function (text, context) {
  var i = 0;
  var filters = [];
  while (true) {
    var e = textIndexOf(text, '|', i);
    if (e === -1) {
      break;
    } else {
      filters.push(text.slice(i, e).trim());
      i = e + 1;
    }
  }
  if (filters.length > 0) {
    filters.push(text.slice(i).trim());
  }
  if (filters.length > 1) {
    var name = filters.shift();
    var astList = parseFilter(filters.shift(), localsAstNode(name, context), filters, context);
  } else {
    var astList = localsAstNode(text, context);
  }
  return astList;
};

/**
 * Parse "for"
 *
 * @param {String} body
 * @return {Array}
 */
var parseFor = parser.parseFor = function (body) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ']));

  var parseAttrs = function (blocks) {
    if (blocks.length < 1) return {};
    var attrString = blocks.reduce(function (sum, item) {
      if (item === ':') return sum;
      if (sum.substr(-1) === ':') return sum + item;
      return sum + ' ' + item;
    });
    var attrs = {};
    arrayRemoveEmptyString(splitText(attrString, [' ']))
    .forEach(function (item) {
      var i = item.indexOf(':');
      if (i === -1) {
        attrs[item.toLowerCase()] = true;
      } else {
        attrs[item.substr(0, i).toLowerCase()] = item.substr(i + 1);
      }
    });
    return attrs;
  };

  if (blocks.length >= 3 && blocks[1].toLowerCase() === 'in') {
    // normal
    var itemName = blocks[0];
    var arrayName = blocks[2];
    var attrs = parseAttrs(blocks.slice(3));
  } else if (blocks.length === 1 ||
             (blocks.length > 1 && blocks[1].toLowerCase() !== 'in' && blocks[1].indexOf(':') === -1)) {
    // non-standard writing: {% for array %}
    var itemName = 'item';
    var arrayName = blocks[0];
    var attrs = parseAttrs(blocks.slice(1));
  }
  if (!(attrs.offset > 0)) attrs.offset = 0;
  if (!(attrs.limit > 0)) attrs.limit = 0;

  return [arrayName, itemName, attrs];
};

/**
 * Parse "{{name}}"
 *
 * @param {String} text
 * @param {Object} context
 * @return {Array}
 */
var parseOutput = function (text, context) {
  var astList = parseVariables(text, context);
  if (Array.isArray(astList)) {
    if (astList[2] === OPCODE.LOCALS) {
      return context.astNode(OPCODE.PRINTLOCALS).concat(astList.slice(3));
    } else {
      return context.astNode(OPCODE.PRINT, astList);
    }
  } else {
    return context.astNode(OPCODE.PRINTSTRING, astList);
  }
};

/**
 * Parse "{%tag%}"
 *
 * @param {Object} context
 * @param {String} text
 * @return {Array}
 */
var parseTag = function (context, text) {
  var i = text.indexOf(' ');
  if (i === -1) {
    var name = text;
    var body = '';
  } else {
    var name = text.slice(0, i);
    var body = text.slice(i + 1).trim();
  }
  name = name.toLowerCase();

  if (typeof(context.tags[name]) === 'function') {
    context.tags[name](context, name, body);
  } else {
    context.astStack.push(context.astNode(OPCODE.UNKNOWN_TAG, name, body));
  }
};

},{"./opcode":5,"./utils":7}],7:[function(require,module,exports){
(function (process){
/**
 * Utils
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var md5 = require('./md5');
var utils = exports = module.exports = {};
var OPCODE = require('./opcode');


/**
 * Empty function
 */
utils.noop = function () {};

/**
 * Debug
 *
 * @param {String} name
 * @return {Function}
 */
utils.debug = function (name) {
  if (/tinyliquid/img.test(process.env.DEBUG)) {
    return function (msg) {
      console.log('[debug] TinyLiquid:%s: %s', name, msg);
    };
  } else {
    return utils.noop;
  }
};

/**
 * MD5
 *
 * @param {String} text
 * @return {String}
 */
utils.md5 = md5;

/**
 * Whether a string in quotes
 *
 * @param {String} text
 * @return {Boolean}
 */
utils.isQuoteWrapString = function (text) {
  if ((text[0] === '"' && text[text.length - 1] === '"') ||
      (text[0] === '\'' && text[text.length - 1] === '\'')) {
    return true;
  } else {
    return false;
  }
};

/**
 * Remove the string outside the quotation marks
 *
 * @param {string} text
 * @return {string}
 */
utils.stripQuoteWrap = function (text) {
  if (utils.isQuoteWrapString(text)) {
    return text.substr(1, text.length - 2);
  } else {
    return text;
  }
};

/**
 * Get the index of the substring (not in quotes)
 *
 * @param {String} text
 * @param {String} subject
 * @param {Integer} start
 */
utils.textIndexOf = function (text, subject, start) {
  if (start < 0) {
    start = text.length + start;
  } else if (isNaN(start)) {
    start = 0;
  }
  var subjectLength = subject.length;
  var quote = false;
  for (var i = start, len = text.length; i < len; i++) {
    var c = text[i];
    if (quote) {
      if (c === quote && text[i - 1] !== '\\') {
        quote = false;
      }
    } else {
      if ((c === '\'' || c === '"') && text[i - 1] !== '\\') {
        quote = c;
      } else {
        if (text.substr(i, subjectLength) === subject) {
          return i;
        }
      }
    }
  }
  return -1;
};

/**
 * Split string
 *
 * Example: console.log(utils.splitText('a>b "a>b" a < c', [' ', '<', '>']));
 * Return:  ['a', '>', 'b', ' ', '"a>b"', ' ', 'a', ' ', '<', ' ', 'c']
 * Notes:   if delimiter > =, and >, this type is > = must be in the front
 *
 * @param {String} text
 * @param {Array} separators
 * @return {Array}
 */
utils.splitText = function (text, separators) {
  if (!Array.isArray(separators)) {
    separators = [separators || ' '];
  }

  var list = [];
  var tmp = '';
  var flush = function () {
    if (tmp.length > 0) {
      list.push(tmp);
      tmp = '';
    }
  };

  // split string in quotes
  var quote = false;
  for (var i = 0, len = text.length; i < len; i++) {
    var c = text[i];
    if (quote) {
      tmp += c;
      if (c === quote && text[i - 1] !== '\\') {
        flush();
        quote = false;
      }
    } else {
      if ((c === '\'' || c === '"') && text[i - 1] !== '\\') {
        flush();
        tmp += c;
        quote = c;
      } else {
        tmp += c;
      }
    }
  }
  flush();

  // separators
  var _list = list;
  list = [];
  tmp = '';
  var isSeparator = function (text) {
    for (var i = 0, len = separators.length; i < len; i++) {
      var sep = separators[i];
      if (text.substr(0, sep.length) === sep) {
        return sep;
      }
    }
    return false;
  };
  _list.forEach(function (text) {
    if (utils.isQuoteWrapString(text)) {
      list.push(text);
    } else {
      for (var i = 0, len = text.length; i < len; i++) {
        var c = text[i];
        var sep = isSeparator(text.slice(i));
        if (sep === false) {
          tmp += c;
        } else {
          flush();
          list.push(sep);
          i += sep.length - 1;
        }
      }
      flush();
    }
  });

  list = list.filter(function (item) {
    return item.trim();
  });

  return list;
};

/**
 * Safe json stringify
 *
 * @param {Object} data
 * @param {String|Number} space indent
 * @return {String}
 */
utils.jsonStringify = function (data, space) {
  var seen = [];
  return JSON.stringify(data, function (key, val) {
    if (!val || typeof val !== 'object') {
      return val;
    }
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  }, space);
};

/**
 * Merge object
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */
utils.merge = function () {
  var ret = {};
  for (var i in arguments) {
    var obj = arguments[i];
    for (var j in obj) {
      ret[j] = obj[j];
    }
  }
  return ret;
};

/**
 * Create a locals AST node
 *
 * @param {String} text
 * @param {Object} context optional, the parser context
 * @return {Array}
 */
utils.localsAstNode = function (text, context) {
  if (text.length > 0) {
    if (utils.isQuoteWrapString(text)) {
      // string
      return text.slice(1, text.length - 1);
    } else if (text === 'false') {
      // constants
      return false;
    } else if (text === 'true') {
      // constants
      return true;
    } else if (text === 'null' || text === 'empty' || text === 'nil' || text === 'undefined') {
      // constants
      return null;
    } else if (isFinite(text)) {
      // number
      return Number(text);
    } else if (/^\(\d+\.\.\d+\)$/.test(text)) {
      // range (start_num..end_num)
      var b = text.match(/^\((\d+)\.\.(\d+)\)$/);
      return context.astNode(OPCODE.RANGE, b[1], b[2]);
    } else if (text[0] === '(' && text[text.length - 1] === ')' && text.split('..').length === 2) {
      // range (start_locals..end_locals)
      var b = text.slice(1, -1).split('..');
      return context.astNode(OPCODE.RANGE, utils.localsAstNode(b[0], context), utils.localsAstNode(b[1], context));
    } else {
      var loopLocals = function (name) {
        var n = OPCODE['LOOPLOCALS_' + name.toUpperCase()];
        if (typeof(n) === 'undefined') {
          return [OPCODE.LOOPLOCALS_UNKNOWN, name];
        } else {
          return [n];
        }
      };
      if (text.substr(0, 8) === 'forloop.') {
        // forloop locals
        return context.astNode(OPCODE.FORLOOPLOCALS).concat(loopLocals(text.substr(8)));
      } else if (text.substr(0, 13) === 'tablerowloop.') {
        // tablerowloop locals
        return context.astNode(OPCODE.TABLEROWLOOPLOCALS).concat(loopLocals(text.substr(13)));
      } else {
        var localsAst = function (op) {
          var childs = text.split('.');
          return context.astNode(op, text, childs[0], childs.length > 1 ? childs.slice(1) : null);
        };
        if (context && context.forItems.test(text)) {
          // forloop item
          return localsAst(OPCODE.FORLOOPITEM);
        } else if (context && context.tablerowItems.test(text)) {
          // tablerowloop item
          return localsAst(OPCODE.TABLEROWITEM);
        } else {
          // locals
          return localsAst(OPCODE.LOCALS);
        }
      }
    }
  } else {
    return null;
  }
};

/**
 * AST stack
 */
var ASTStack = utils.ASTStack = function () {
  this.list = [];
  this._parent = [this.list];
  this.newChild();
};

/**
 * Get last node
 *
 * @return {Array}
 */
ASTStack.prototype.last = function () {
  return this._parent[this._parent.length - 1];
};

/**
 * Create a new child node
 *
 * @param {Array} astList 初始值
 */
ASTStack.prototype.newChild = function (astList) {
  if (typeof(astList) === 'undefined') {
    astList = [];
  } else {
    astList = Array.isArray(astList) ? astList : [OPCODE.OBJECT, astList];
  }
  this.last().push(astList);
  this._parent.push(astList);
  return this;
};

/**
 * Push an AST Node
 *
 * @param {Object} ast
 */
ASTStack.prototype.push = function (ast) {
  this.last().push(ast);
  return this;
};

/**
 * Close the current child node
 */
ASTStack.prototype.close = function () {
  var list = this.last();
  if (list[2] === OPCODE.LIST && list.length < 5) {
    // optimization for only one element of the OPCODE.LIST
    var ast = list[3];
    list.length = 0;
    for (var i = 0, len = ast.length; i < len; i++) {
      list[i] = ast[i];
    }
  }
  this._parent.pop();
  return this;
};

/**
 * Return the stack
 */
ASTStack.prototype.result = function () {
  if (this.list.length === 1) {
    return this.list[0];
  } else {
    return this.list;
  }
};

/**
 * Remove empty string in the array
 *
 * @param {Array} arr
 * @return {Array}
 */
utils.arrayRemoveEmptyString = function (arr) {
  return arr.filter(function (item) {
    return item.trim().length > 0 ? true : false;
  });
};

/**
 * Get a number array from the specify range
 *
 * @param {int} s
 * @param {int} e
 * @return {array}
 */
utils.range = function (s, e) {
  s = parseInt(s);
  e = parseInt(e);
  var r = [];
  if (isNaN(s) || isNaN(e)) return r;
  for (; s <= e; s++) {
    r.push(s);
  }
  return r;
};

/**
 * Convert an object to an array
 *
 * @param {object} data
 * @return {array}
 */
utils.toArray = function (data) {
  if (Array.isArray(data)) return data;
  var ret = [];
  for (var i in data) {
    if (i !== 'size') {
      ret.push(data[i]);
    }
  }
  return ret;
};

/**
 * Slice the array
 *
 * @param {Array} array
 * @param {Integer} offset
 * @param {Integer} limit
 * @return {Array}
 */
utils.arraySlice = function (array, offset, limit) {
  if (!Array.isArray(array)) return array;
  offset = parseInt(offset);
  limit = parseInt(limit);
  if (offset > 0) {
    if (limit > 0) {
      return array.slice(offset, offset + limit);
    } else {
      return array.slice(offset);
    }
  } else if (limit > 0) {
    return array.slice(0, limit);
  } else {
    return array;
  }
};

/**
 * Get the properties from a value
 *
 * @param {Object} value
 * @param {Array} childs
 * @return {Array}
 */
utils.getChildValue = function (value, childs) {
  if (value === null || value === undefined) {
    return [false, null];
  }
  if (childs && childs.length > 0) {
    for (var i = 0, len = childs.length; i < len; i++) {
      if (value === null) return [false, null];
      var c = value[childs[i]];
      if (value && typeof(c) !== 'undefined') {
        value = c;
      } else {
        return [false, null];
      }
    }
  }
  return [true, value];
};

/**
 * Get each item from an array, and call the function
 * if fn passed an error argument, then break
 *
 * @param {Array} list
 * @param {Function} fn format: function (item, index, done)
 * @param {Function} callback
 */
utils.asyncEach = function (list, fn, callback, a1, a2, a3, b1, b2, b3) {
  var i = -1;
  var j = 0;
  var len = list.length;
  var next = function (err) {
    if (err) return callback(err, null, a2, a3);

    j++;
    if (j > 10) {
      // avoid stack overflow
      j = 0;
      setImmediate(next);
    } else {
      i++;
      if (i < len) {
        fn(list[i], i, next, b1, b2, b3);
      } else {
        callback(a1 || null, a2, a3);
      }
    }
  };
  next();
};

// need `setImmediate` function supported
if (typeof setImmediate !== 'function') {
  throw new Error('Sorry, you JavaScript runtime environment does not support `setImmediate()` [TinyLiquid]');
}

/**
 * According to the condition to decide whether to continue to repeat an asynchronous callback
 *
 * @param {Function} test returns true or false to indicate whether or not to continue
 * @param {Function} fn format: function (done)
 * @param {Function} callback
 */
utils.asyncFor = function (test, fn, callback, a1, a2, a3) {
  var next = function () {
    if (test()) {
      fn(next);
    } else {
      callback(a1 || null, a2, a3);
    }
  };
  next();
};

utils.genRandomName = function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var max = chars.length;
  var ret = '';
  for (var i = 0; i < 10; i++) {
    ret += chars.charAt(Math.floor(Math.random() * max));
  }
  return ret;
};

/******************************************************************************/

/**
 * 模板Filter的异步函数缓存
 *
 * @param {String} name    函数名称
 * @param {Function} fn    格式：function (arg1, arg2, callback)
 * @param {Number} maxAge  有效期，毫秒
 * @return {Function}
 */
utils.wrapFilterCache = function(name, fn, maxAge) {
  return function() {
    var me = this;
    var args = getFilterArguments(arguments);
    var callback = getFilterArgumentCallback(arguments);
    var context = getFilterArgumentContext(arguments);

    var ret = findFilterCache(context, name, args);
    if (ret) {
      callback(null, ret.value);
    } else {
      fn.apply(me, newFilterArguments(args, function (err, value) {
        if (err) return callback(err);
        setFilterCache(context, name, args, value);
        callback(null, value);
      }, context));
    }
  };
};

function getFilterArguments(args) {
  return Array.prototype.slice.call(args, 0, args.length - 2);
}

function getFilterArgumentCallback(args) {
  return args[args.length - 2];
}

function getFilterArgumentContext(args) {
  return args[args.length - 1];
}

function newFilterArguments(args, callback, context) {
  return [].concat(args).concat([callback, context]);
}

function getArgumentsKey(args) {
  return md5(JSON.stringify(args)).slice(0, 10);
}

function findFilterCache (context, name, args) {
  var map = context._filterCache[name];
  if (!map) return false;
  var key = getArgumentsKey(args);
  if (key in map) {
    return {args: args, value: map[key]};
  } else {
    return false;
  }
}

function setFilterCache (context, name, args, value) {
  var key = getArgumentsKey(args);
  if (!context._filterCache[name]) context._filterCache[name] = {};
  context._filterCache[name][key] = value;
}

}).call(this,require('_process'))
},{"./md5":4,"./opcode":5,"_process":9}],8:[function(require,module,exports){
/**
 * Run AST
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var Context = require('./context');
var OPCODE = require('./opcode');
var debug = utils.debug('VM');
var merge = utils.merge;
var DataStack = utils.DataStack;
var range = utils.range;
var toArray = utils.toArray;
var arraySlice = utils.arraySlice;
var getChildValue = utils.getChildValue;
var asyncEach = utils.asyncEach;
var asyncFor = utils.asyncFor;



/**
 * If it's opcode return true, else return false
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isOpcode = function (ast) {
  return ast instanceof Array && !(ast[0] instanceof Array);
};

/**
 * If it's AST array return true, else return false
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isAST = function (ast) {
  return ast instanceof Array;
};

/**
 * Run AST
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback format: function (err, return_value)
 */
var run = exports.run = function (astList, context, callback) {
  if (isAST(astList)) {
    if (isOpcode(astList)) {
      // single AST Node
      var op = execOpcode[astList[2]];
      if (!op) op = execOpcode[OPCODE.UNKNOWN];
      context.setCurrentPosition(astList[0], astList[1]);
      // debug('opcode: ' + astList[2] + ' at ' + astList[0] + ', ' + astList[1]);
      op(context, callback, astList.slice(2));
    } else {
      // AST list
      var retval = new Array(astList.length);
      asyncEach(astList, runEachItem, callback, null, retval, null, context, retval);
    }
  } else {
    callback(null, astList);
  }
};
var runEachItem = function (item, index, callback, context, retval) {
  run(item, context, function (err, vals) {
    if (err) {
      callback(err);
      return;
    }
    retval[index] = vals;
    callback(null);
  });
};

/**
 * Get the arguments of the current AST node
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs = function (astList, context, callback) {
  var retval = new Array(astList.length);
  asyncEach(astList, function (ast, i, done) {
    run(ast, context, function (err, val) {
      if (err) {
        callback(err);
      } else {
        retval[i] = val;
        done();
      }
    });
  }, callback, null, retval);
};

/**
 * Get the two arguments of the current AST node
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs2 = function (astList, context, callback) {
  var retval = new Array(2);
  var i = 0;
  var getOpArgs2_callback = function (err, val) {
    if (err) {
      callback(err);
    } else {
      retval[i] = val;
      i++;
      if (i >= 2) callback(null, retval);
    }
  };
  run(astList[1], context, getOpArgs2_callback);
  run(astList[2], context, getOpArgs2_callback);
};


var execOpcode = [];


execOpcode[OPCODE.UNKNOWN] = function (context, callback, ast) {
  callback(context.throwUnknownOpcodeError(ast[0]));
};


execOpcode[OPCODE.LIST] = function (context, callback, ast) {
  run(ast.slice(1), context, callback);
};


execOpcode[OPCODE.PRINT] = function (context, callback, ast) {
  if (isAST(ast[1])) {
    run(ast[1], context, function (err, val) {
      if (err) {
        callback(err);
      } else {
        context.print(val);
        callback(null);
      }
    });
  } else {
    context.print(ast[1]);
    callback(null);
  }
};


execOpcode[OPCODE.PRINTLOCALS] = function (context, callback, ast) {
  getLocals(ast[1], ast[2], ast[3], context, printLocalsAndCallback, context, callback);
};
var printLocalsAndCallback = function (err, val, context, callback) {
  if (err) {
    callback(err, val);
  } else {
    context.print(val);
    callback(err, val);
  }
};


execOpcode[OPCODE.PRINTSTRING] = function (context, callback, ast) {
  context.print(ast[1]);
  callback(null);
};


execOpcode[OPCODE.DEBUG] = function (context, callback, ast) {
  debug(ast[1]);
  callback(null);
};


execOpcode[OPCODE.LOCALS] = function (context, callback, ast) {
  getLocals(ast[1], ast[2], ast[3], context, callback);
};
function getLocals (fullName, mainName, childs, context, callback, a1, a2, a3) {
  // try to get the fullName first
  var info = context.getLocals(fullName);
  if (info) {
    var name = fullName;
    childs = null;
  } else {
    var name = mainName;
  }
  context.fetchSingleLocals(name, function (err, val) {
    if (err) {
      callback(err, null, a1, a2, a3);
    } else {
      if (childs) {
        var v = getChildValue(val, childs);
        if (v[0]) {
          callback(null, v[1], a1, a2, a3);
        } else {
          callback(context.throwLocalsUndefinedError(fullName), null, a1, a2, a3);
        }
      } else {
        callback(null, val, a1, a2, a3);
      }
    }
  });
}


execOpcode[OPCODE.FORLOOPITEM] = function (context, callback, ast) {
  var fullName = ast[1];
  var mainName = ast[2];
  var childs = ast[3];
  if (context._isInForloop) {
    var loop = context.forloopInfo();
    if (mainName === loop.itemName) {
      if (childs) {
        var v = getChildValue(loop.item, childs);
        if (v[0]) {
          callback(null, v[1]);
        } else {
          callback(context.throwLoopItemUndefinedError(fullName), null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  callback(context.throwLoopItemUndefinedError(mainName), null);
};


execOpcode[OPCODE.TABLEROWITEM] = function (context, callback, ast) {
  var fullName = ast[1];
  var mainName = ast[2];
  var childs = ast[3];
  if (context._isInTablerowloop) {
    var loop = context.tablerowloopInfo();
    if (mainName === loop.itemName) {
      if (childs) {
        var v = getChildValue(loop.item, childs);
        if (v[0]) {
          callback(null, v[1]);
        } else {
          callback(context.throwLoopItemUndefinedError(fullName), null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  callback(context.throwLoopItemUndefinedError(mainName), null);
};


execOpcode[OPCODE.FORLOOPLOCALS] = function (context, callback, ast) {
  var loop = context.forloopInfo();
  var val = null;
  if (loop) {
    switch (ast[1]) {
      case OPCODE.LOOPLOCALS_LENGTH:  val = loop.length;                    break;
      case OPCODE.LOOPLOCALS_NAME:    val = loop.itemName;                  break;
      case OPCODE.LOOPLOCALS_INDEX0:  val = loop.index;                     break;
      case OPCODE.LOOPLOCALS_INDEX:   val = loop.index + 1;                 break;
      case OPCODE.LOOPLOCALS_RINDEX0: val = loop.length - loop.index - 1;   break;
      case OPCODE.LOOPLOCALS_RINDEX:  val = loop.length - loop.index;       break;
      case OPCODE.LOOPLOCALS_FIRST:   val = loop.index < 1;                 break;
      case OPCODE.LOOPLOCALS_LAST:    val = loop.index + 1 >= loop.length;  break;
      default:
        callback(context.throwLoopLocalsUndefinedError('forloop.' + ast[2]), val);
        return;
    }
  }
  callback(null, val);
};


execOpcode[OPCODE.TABLEROWLOOPLOCALS] = function (context, callback, ast) {
  var loop = context.tablerowloopInfo();
  var val = null;
  if (loop) {
    switch (ast[1]) {
      case OPCODE.LOOPLOCALS_LENGTH:    val = loop.length;                        break;
      case OPCODE.LOOPLOCALS_NAME:      val = loop.itemName;                      break;
      case OPCODE.LOOPLOCALS_INDEX0:    val = loop.index;                         break;
      case OPCODE.LOOPLOCALS_INDEX:     val = loop.index + 1;                     break;
      case OPCODE.LOOPLOCALS_RINDEX0:   val = loop.length - loop.index - 1;       break;
      case OPCODE.LOOPLOCALS_RINDEX:    val = loop.length - loop.index;           break;
      case OPCODE.LOOPLOCALS_FIRST:     val = loop.index < 1;                     break;
      case OPCODE.LOOPLOCALS_LAST:      val = loop.index + 1 >= loop.length;      break;
      case OPCODE.LOOPLOCALS_COL0:      val = loop.colIndex;                      break;
      case OPCODE.LOOPLOCALS_COL:       val = loop.colIndex + 1;                  break;
      case OPCODE.LOOPLOCALS_COL_FIRST: val = loop.colIndex < 1;                  break;
      case OPCODE.LOOPLOCALS_COL_LAST:  val = loop.colIndex + 1 >= loop.columns;  break;
      default:
        callback(context.throwLoopLocalsUndefinedError('tablerowloop.' + ast[2]), val);
        return;
    }
  }
  callback(null, val);
};


execOpcode[OPCODE.FILTER] = function (context, callback, ast) {
  getOpArgs(ast.slice(2), context, function (err, args) {
    if (err) {
      callback(err);
    } else {
      context.callFilter(ast[1], args, callback);
    }
  });
};


execOpcode[OPCODE.IF] = function (context, callback, ast) {
  run(ast[1], context, function (err, isTrue) {
    if (err) {
      callback(err);
    } else {
      if (isTrue) {
        run(ast[2], context, callback);
      } else {
        run(ast[3], context, callback);
      }
    }
  });
};


execOpcode[OPCODE.FOR] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) {
      callback(err);
    } else {
      var arr = arraySlice(toArray(arr), ast[3], ast[4]);
      var astLoop = ast[5];
      var astElse = ast[6];
      if (arr.length > 0) {
        context.forloopEnter(arr.length, ast[2]);
        asyncEach(arr, function (item, i, done) {
          context.forloopItem(item, i);
          run(astLoop, context, done);
        }, function () {
          context.forloopEnd();
          callback(null);
        });
      } else if (astElse) {
        run(astElse, context, callback);
      } else {
        callback(null);
      }
    }
  });
};


execOpcode[OPCODE.TABLEROW] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) {
      callback(err);
    } else {
      var arr = arraySlice(toArray(arr), ast[3], ast[4]);
      var cols = parseInt(ast[5]);
      var astLoop = ast[6];
      var astElse = ast[7];
      if (arr.length > 0) {
        context.tablerowloopEnter(arr.length, ast[2], cols);
        var ci = 1;
        var ri = 1;
        asyncEach(arr, function (item, i, done) {
          if (ci === 1) context.print('<tr class="row' + ri + '">');
          context.print('<td class="col' + ci + '">');
          context.tablerowloopItem(item, i, ci);
          run(astLoop, context, function (err) {
            if (err) {
              callback(err);
            } else {
              context.print('</td>');
              ci++;
              if (ci > cols) {
                context.print('</tr>');
                ci = 1;
                ri++;
              }
              done();
            }
          });
        }, function () {
          if (arr.length % cols !== 0) context.print('</tr>');
          context.tablerowloopEnd();
          callback(null);
        });
      } else if (astElse) {
        run(astElse, context, callback);
      } else {
        callback(null);
      }
    }
  });
};


execOpcode[OPCODE.CASE] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      var list = ast.slice(2);
      var cond = false;
      asyncFor(function () {
        return list.length > 0;
      }, function (done) {
        var a = list.shift();
        var b = list.shift();
        if (isOpcode(a) && isAST(b)) {
          run(a, context, function (err, vals) {
            if (err) {
              callback(err);
            } else {
              for (var i = 0, len = vals.length; i < len; i++) {
                if (vals[i] == val) {
                  list = [];
                  cond = true;
                  run(b, context, function (err) {
                    if (err) {
                      callback(err);
                    } else {
                      done();
                    }
                  });
                  return;
                }
              }
              done();
            }
          });
        } else {
          list = [];
          if (cond) {
            done();
          } else {
            run(a, context, function (err) {
              if (err) {
                callback(err);
              } else {
                done();
              }
            });
          }
        }
      }, callback);
    }
  });
};


execOpcode[OPCODE.CYCLE] = function (context, callback, ast) {
  var i = context.getCycleIndex(ast[1]);
  if (i === null) {
    context.setCycle(ast[1], ast.slice(2));
    i = 0;
  }
  var item = ast[2 + i];
  run(item, context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      context.print(val);
      callback(err);
    }
  });
};


execOpcode[OPCODE.EXISTS] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    callback(err || null, val ? true : false);
  });
};


execOpcode[OPCODE.AND] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) {
      callback(err);
    } else {
      var val = vals.reduce(reduceAAndB);
      callback(null, val);
    }
  });
};
var reduceAAndB = function (a, b) {
  return a && b;
};


execOpcode[OPCODE.OR] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) {
      callback(err);
    } else {
      var val = vals.reduce(reduceAOrB);
      callback(null, val);
    }
  });
};
var reduceAOrB = function (a, b) {
  return a || b;
};


execOpcode[OPCODE.NOT] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    callback(err || null, !!!val);
  });
};


execOpcode[OPCODE.LT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] < vals[1]);
  });
};


execOpcode[OPCODE.LE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] <= vals[1]);
  });
};


execOpcode[OPCODE.GT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] > vals[1]);
  });
};


execOpcode[OPCODE.GE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] >= vals[1]);
  });
};


execOpcode[OPCODE.EQ] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] == vals[1]);
  });
};


execOpcode[OPCODE.ED] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] === vals[1]);
  });
};


execOpcode[OPCODE.NE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] != vals[1]);
  });
};


execOpcode[OPCODE.CONTAINS] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, String(vals[0]).indexOf(vals[1]) !== -1);
  });
};


execOpcode[OPCODE.HASVALUE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, toArray(vals[0]).indexOf(vals[1]) !== -1);
  });
};


execOpcode[OPCODE.HASKEY] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
  });
};


execOpcode[OPCODE.WHEN] = function (context, callback, ast) {
  run(ast[1], context, function (err, vals) {
    callback(err || null, vals);
  });
};


execOpcode[OPCODE.ASSIGN] = function (context, callback, ast) {
  run(ast[2], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      context.setLocals(ast[1], val);
      callback(err);
    }
  });
};


execOpcode[OPCODE.WEAK_ASSIGN] = function (context, callback, ast) {
  run(ast[2], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      context._locals[ast[1]] = val;
      callback(err);
    }
  });
};


execOpcode[OPCODE.CAPTURE] = function (context, callback, ast) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) {
      callback(err);
    } else {
      var buf = context.getBuffer();
      context.setBuffer(oldBuf);
      context.setLocals(ast[1], buf);
      callback(err);
    }
  });
};


execOpcode[OPCODE.BLOCK] = function (context, callback, ast) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) {
      callback(err);
    } else {
      var buf = context.getBuffer();
      context.setBuffer(oldBuf);

      // if on layout, output the block buffer
      if (context._isLayout) {
        context.setBlockIfEmpty(ast[1], buf);
        context.print(context.getBlock(ast[1]));
      } else {
        context.setBlock(ast[1], buf);
      }

      callback(err);
    }
  });
};


execOpcode[OPCODE.RANGE] = function (context, callback, ast) {
  run(ast[1], context, function (err, a) {
    if (err) {
      callback(err);
    } else {
      run(ast[2], context, function (err, b) {
        if (err) {
          callback(err);
        } else {
          callback(null, range(a, b));
        }
      });
    }
  });
};


execOpcode[OPCODE.OBJECT] = function (context, callback, ast) {
  callback(null, ast[1]);
};


execOpcode[OPCODE.COMMENT] = function (context, callback, ast) {
  callback(null);
};


execOpcode[OPCODE.EXTENDS] = function (context, callback, ast) {
  run(ast[1], context, function (err, filename) {
    if (err) return callback(err);
    context.setLayout(filename);
    callback(null);
  });
};


execOpcode[OPCODE.INCLUDE] = function (context, callback, ast) {
  run(ast[1], context, function (err, filename) {
    if (err) return callback(err);
    context.include(filename, ast[2], ast[3], callback);
  });
};


execOpcode[OPCODE.COMPILER_VERSION] = function (context, callback, ast) {
  callback(null);
};


execOpcode[OPCODE.UNKNOWN_TAG] = function (context, callback, ast) {
  callback(context.throwUnknownTagError(ast[1], ast[2] || ''));
};


execOpcode[OPCODE.TEMPLATE_FILENAME_PUSH] = function (context, callback, ast) {
  context.pushFilename(ast[1]);
  callback(null);
};


execOpcode[OPCODE.TEMPLATE_FILENAME_POP] = function (context, callback, ast) {
  context.popFilename();
  callback(null);
};

},{"./context":1,"./filters":2,"./opcode":5,"./parser":6,"./utils":7}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
module.exports={
  "name": "tinyliquid",
  "main": "./lib/index.js",
  "files": [
    "lib",
    "target"
  ],
  "version": "0.2.33",
  "description": "A liquid template engine",
  "keywords": [
    "liquid",
    "template"
  ],
  "author": "Zongmin Lei <leizongmin@gmail.com>",
  "contributors": [
    {
      "name": "Zongmin Lei",
      "email": "leizongmin@gmail.com"
    }
  ],
  "repository": {
    "type": "git",
    "url": "git://github.com/leizongmin/tinyliquid.git"
  },
  "licenses": [
    {
      "type": "MIT",
      "url": "https://raw.github.com/leizongmin/tinyliquid/master/MIT-License"
    }
  ],
  "bugs": {
    "url": "https://github.com/leizongmin/tinyliquid/issues"
  },
  "engines": {
    "node": ">= 0.10.0"
  },
  "dependencies": {},
  "devDependencies": {
    "async": "^1.5.2",
    "blanket": "^1.2.3",
    "browserify": "^13.0.0",
    "ejs": "^2.4.1",
    "mocha": "^2.4.5",
    "uglify-js": "^2.6.1"
  },
  "scripts": {
    "test": "mocha -t 5000",
    "test:cov": "mocha --require blanket -R html-cov > coverage.html -t 5000",
    "browserify": "browserify -e ./lib/index.js -s TinyLiquid -o ./target/tinyliquid.js",
    "uglifyjs": "uglifyjs ./target/tinyliquid.js -o ./target/tinyliquid.min.js",
    "build": "npm run browserify && npm run uglifyjs"
  }
}
},{}]},{},[3])(3)
});