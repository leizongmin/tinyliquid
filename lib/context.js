/**
 * Context Object
 *
 * @author Lei Zongmin<leizongmin@gmail.com>
 */

var debug = require('debug')('tinyliquid:Context');
var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var vm = require('./vm');
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
 *   - {Integer} timeout  unit:ms, default:120000
 */
var Context = module.exports = exports = function (options) {
  this._localsPrefix = '';
  this._locals = {};
  this._syncLocals = {};
  this._asyncLocals = {};
  this._asyncLocals2 = [];
  this._filters = merge(filters);
  this._asyncFilters = {};
  this._cycles = {};
  this._buffer = '';
  this._forloops = [];
  this._isInForloop = false;
  this._tablerowloops = [];
  this._isInTablerowloop = false;
  this._includeFileHandler = null;
  this._position = {line: 0, column: 0};
  
  // default configuration
  options = merge({
    timeout: 120000
  }, options);
  this.options = options;

  // initialize the configuration
  var me = this;
  var set = function (name) {
    if (typeof(options[name]) === 'object') {
      for (var i in options[name]) {
        me['_' + name][i] = options[name][i];
      }
    }
  };
  set('locals');
  set('syncLocals');
  set('asyncLocals');
  set('filters');
  set('asyncFilters');
};

/**
 * copy the configuration from other context object
 *
 * @param {Object} from
 * @return {Object}
 */
Context.prototype.from = function (from) {
  var me = this;
  var set = function (name) {
    if (typeof(from[name]) === 'object') {
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
  set('_filters');
  set('_asyncFilters');
  set('options');
  set('_onErrorHandler');
  set('_includeFileHandler');
  return this;
};

/* constants */
Context.prototype.STATIC_LOCALS = 0;  // normal locals
Context.prototype.SYNC_LOCALS = 1;    // get value from a sync function
Context.prototype.ASYNC_LOCALS = 2;   // get value from a async function
Context.prototype.SYNC_FILTER = 0;    // normal filter
Context.prototype.ASYNC_FILTER = 1;   // async filter

/**
 * run AST
 *
 * @param {Array} astList
 * @param {Function} callback
 */
Context.prototype.run = function (astList, callback) {
  return vm.run(astList, this, callback);
};

/**
 * register normal locals
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setLocals = function (name, val) {
  this._locals[name] = val;
};

/**
 * register sync locals
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setSyncLocals = function (name, fn) {
  this._syncLocals[name] = fn;
};

/**
 * register async locals
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
 * register normal filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setFilter = function (name, fn) {
  this._filters[name.toLowerCase()] = fn;
};

/**
 * register async filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncFilter = function (name, fn) {
  this._asyncFilters[name.toLowerCase()] = fn;
};

/**
 * get locals
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
 * get filter
 *
 * @param {String} name
 * @return {Array} [type, function]  return null if the filter not found
 */
Context.prototype.getFilter = function (name) {
  name = name.toLowerCase();
  if (name in this._filters) return [this.SYNC_FILTER, this._filters[name]];
  if (name in this._asyncFilters) return [this.ASYNC_FILTER, this._asyncFilters[name]];
  return null;
};

/**
 * print html
 *
 * @param {Object} str
 */
Context.prototype.print = function (str) {
  this._buffer += (str === null || typeof(str) === 'undefined') ? '' : str;
};

/**
 * set buffer
 *
 * @param {String} buf
 */
Context.prototype.setBuffer = function (buf) {
  this._buffer = buf;
};

/**
 * get buffer
 *
 * @return {String}
 */
Context.prototype.getBuffer = function () {
  return this._buffer;
};

/**
 * clear buffer
 *
 * @return {String}
 */
Context.prototype.clearBuffer = function () {
  var buf = this.getBuffer();
  this.setBuffer('');
  return buf;
};

/**
 * set cycle
 *
 * @param {String} name
 * @param {Array} list
 */
Context.prototype.setCycle = function (name, list) {
  this._cycles[name] = {index: 0, length: list.length, list: list};
};

/**
 * get the index of the cycle
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
 * enter a forloop
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
 * set the forloop item value
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
 * get the forloop information
 *
 * @return {Object}
 */
Context.prototype.forloopInfo = function () {
  return this._forloops[this._forloops.length - 1];
};

/**
 * exit the current forloop
 */
Context.prototype.forloopEnd = function () {
  this._forloops.pop();
  if (this._forloops.length < 1) {
    this._isInForloop = false;
  }
};

/**
 * enter a tablerowloop
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
 * set the tablerowloop item value
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
 * get the tablerow information
 *
 * @return {Object}
 */
Context.prototype.tablerowloopInfo = function () {
  return this._tablerowloops[this._tablerowloops.length - 1];
};

/**
 * exit the current tablerowloop
 */
Context.prototype.tablerowloopEnd = function () {
  this._tablerowloops.pop();
  if (this._tablerowloops.length < 1) {
    this._isInTablerowloop = false;
  }
};

/**
 * include a template file
 *
 * @param {String} name
 * @param {String} prefix
 * @param {Function} callback
 */
Context.prototype.include = function (name, prefix, callback) {
  var me = this;
  var prefixLength = 0;
  if (typeof(this._includeFileHandler) === 'function') {
    this._includeFileHandler(name, function (err, astList) {
      if (err) return callback(err);
      if (typeof(prefix) === 'string' && prefix.length > 0) {
        me._localsPrefix += prefix + '.';
        prefixLength = prefix.length + 1;
      }
      me.run(astList, function (err) {
        if (prefixLength > 0) {
          me._localsPrefix = me._localsPrefix.substr(0, me._localsPrefix.length - prefixLength);
        }
        return callback(err);
      });
    });
  } else {
    return callback(new Error('please set an include file handler'));
  }
};

/**
 * set the include file handler
 *
 * @param {Function} fn format: function (name, callback)
 *                      callback format: function (err, astList)
 */
Context.prototype.onInclude = function (fn) {
  this._includeFileHandler = fn;
};

/**
 * throw locals undefined error
 *
 * @param {String} name
 */
Context.prototype.throwLocalsUndefinedError = function (name) {
  debug('Locals ' + name + ' is undefined');
};

/**
 * throw loop item undefined error
 *
 * @param {String} name
 */
Context.prototype.throwLoopItemUndefinedError = function (name) {
  debug('Loop item ' + name + ' is undefined');
};

/**
 * throw forloop/tablerow locals undefined error
 *
 * @param {String} name
 */
Context.prototype.throwLoopLocalsUndefinedError = function (name) {
  debug('Loop locals ' + name + ' is undefined');
};

/**
 * throw filter undefined error
 *
 * @param {String} name
 */
Context.prototype.throwFilterUndefinedError = function (name) {
  var err = new Error('Filter ' + name + ' is undefined ' + this.getCurrentPosition(true));
  this.throwError(err);
}

/**
 * throw unknown opcode error
 *
 * @param {String} code
 */
Context.prototype.throwUnknownOpcodeError = function (code) {
  var err = new Error('Unknown opcode ' + code + ' ' + this.getCurrentPosition(true));
  this.throwError(err);
};

/**
 * set current position
 *
 * @param {Integer} line
 * @param {Integer} column
 */
Context.prototype.setCurrentPosition = function (line, column) {
  this._position.line = line;
  this._position.column = column;
};

/**
 * get current position
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
