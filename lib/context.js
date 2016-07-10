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
