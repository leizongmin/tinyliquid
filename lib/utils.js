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
