/**
 * Context Object
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var vm = require('./vm');
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
 *   - {Integer} timeout  unit:ms, default:120000
 */
var Context = module.exports = exports = function (options) {
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
  this._astCache = {};
  
  // default configuration
  options = merge({
    timeout: 0
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
  set('asyncLocals2');
  set('filters');
  set('asyncFilters');
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
  set('_asyncLocals2');
  set('_filters');
  set('_asyncFilters');
  set('options');
  set('_onErrorHandler');
  set('_includeFileHandler');

  for (var i in from) {
    if (i in me) continue;
    me[i] = from[i];
  }

  return this;
};

/* constants */
Context.prototype.STATIC_LOCALS = 0;  // normal locals
Context.prototype.SYNC_LOCALS = 1;    // get value from a sync function
Context.prototype.ASYNC_LOCALS = 2;   // get value from a async function
Context.prototype.SYNC_FILTER = 0;    // normal filter
Context.prototype.ASYNC_FILTER = 1;   // async filter

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
  this._filters[name.toLowerCase()] = fn;
};

/**
 * Register async filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncFilter = function (name, fn) {
  this._asyncFilters[name.toLowerCase()] = fn;
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
      me.fetchLocals(name, function (err, val) {
        if (err) return values[i] = err;
        values[i] = val;
        done();
      });
    }, callback, null, values);

  } else {
    
    var name = list;
    var tpl = '{{' + name + '}}';
    if (me._astCache[tpl]) {
      var ast = me._astCache[tpl];
    } else {
      var ast = parser(tpl);
      me._astCache[tpl] = ast;
    }
    var originBuf = me.clearBuffer();
    me.run(ast, function (err, val) {
      if (err) return callback(err);
      var ret = me.clearBuffer();
      me.setBuffer(originBuf);
      callback(null, ret);
    });

  }
};

/**
 * Get filter
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
  if (!info) return callback(new Error('Cannot call undefined filter: ' + method));

  if (info[0] === this.ASYNC_FILTER) {
    args.push(callback);
    args.push(this);
    info[1].apply(null, args);
  } else {
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
 * @param {String} localsAst
 * @param {Function} callback
 */
Context.prototype.include = function (name, localsAst, callback) {
  var me = this;
  if (typeof(this._includeFileHandler) === 'function') {
    this._includeFileHandler(name, function (err, astList) {
      if (err) return callback(err);
      if (localsAst) {
        me.run(localsAst, function (err, locals) {
          if (err) locals = {};
          var c = new Context();
          c.from(me);
          c._asyncLocals = {};
          c._asyncLocals2 = {};
          c._syncLocals = {};
          c._locals = locals;
          c.run(astList, function (err) {
            me.print(c.clearBuffer());
            callback(err);
          });
        });
      } else {
        me.run(astList, callback);
      }
    });
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
