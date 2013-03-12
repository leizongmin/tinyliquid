/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var crypto = require('crypto');
var utils = exports = module.exports = {};
var OPCODE = require('./opcode');


/**
 * 空函数
 */
utils.noop = function () {};

/**
 * MD5
 *
 * @param {String} text
 * @return {String}
 */
utils.md5 = function (text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * 是否为引号括起来的字符串
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
 * 去掉字符串外面的引号
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
 * 取子字符串的索引位置（不在引号内的）
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
 * 分割字符串（引号括起来的字符串自动被分隔）
 *
 * 示例： console.log(utils.splitText('a>b "a>b" a < c', [' ', '<', '>']));
 *     返回：['a', '>', 'b', ' ', '"a>b"', ' ', 'a', ' ', '<', ' ', 'c']
 * 注意：如果分隔符有 >= 和 > 这类型的，则 >= 必须在前面
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

  // 分隔引号括起来的字符串
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

  // 以指定的分隔字符来分隔
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
  
  return list;
};

/**
 * 返回安全的JSON字符串
 *
 * @param {Object} data
 * @param {String|Number} space 缩进
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
 * 合并对象
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
 * 克隆对象
 *
 * @param {Object} obj
 * @return {Object}
 */
utils.clone = function (obj) {
  var seen = [];
  var cloneObj = function (obj) {
    if (typeof(obj) === 'object') {
      if (obj === null) {
        return obj;
      } else {
        if (seen.indexOf(obj) !== -1) {
          return obj;
        } else {
          seen.push(obj);
          var ret = {};
          for (var i in obj) {
            ret[i] = cloneObj(obj[i]);
          }
          return ret;
        }
      }
    } else {
      return obj;
    }
  };
  return cloneObj(obj);
};

/**
 * 生成局部变量AST节点
 *
 * @param {String} text
 * @param {Object} context 可选，用于优化
 * @return {Array}
 */
utils.localsAstNode = function (text, context) {
  if (text.length > 0) {
    if (utils.isQuoteWrapString(text)) {
      // 字符串
      return text.slice(1, text.length - 1);
    } else if (text === 'false') {
      // 特殊变量
      return false;
    } else if (text === 'true') {
      // 特殊变量
      return true;
    } else if (text === 'null' || text === 'empty' || text === 'nil' || text === 'undefined') {
      // 特殊变量
      return null;
    } else if (isFinite(text)) {
      // 数值
      return Number(text);
    } else if (/^\(\d+\.\.\d+\)$/.test(text)) {
      // 数组范围： (start..end)
      var b = text.match(/^\((\d+)\.\.(\d+)\)$/);
      return context.astNode(OPCODE.RANGE, b[1], b[2]);
    } else {
      if (text.substr(0, 8) === 'forloop.') {
        // forloop变量
        return context.astNode(OPCODE.FORLOOPLOCALS, text.substr(8).toLowerCase());
      } else if (text.substr(0, 13) === 'tablerowloop.') {
        // tablerowloop变量
        return context.astNode(OPCODE.TABLEROWLOOPLOCALS, text.substr(13).toLowerCase());
      } else {
        var localsAst = function (op) {
          var childs = text.split('.');
          return context.astNode(op, text, childs[0], childs.length > 1 ? childs.slice(1) : null);
        };
        if (context && context.forItems.test(text)) {
          // forw循环内的item变量
          return localsAst(OPCODE.FORLOOPITEM);
        } else if (context && context.tablerowItems.test(text)) {
          // tablerow循环内的item变量
          return localsAst(OPCODE.TABLEROWITEM);
        } else {
          // 变量名
          return localsAst(OPCODE.LOCALS);
        }
      }
    }
  } else {
    return null;
  }
};

/**
 * 数据堆栈
 */
var DataStack = utils.DataStack = function () {
  this.list = [];
  this._parent = [this.list];
  this.newChild();
};

/**
 * 取节点末尾
 *
 * @return {Array}
 */
DataStack.prototype.last = function () {
  return this._parent[this._parent.length - 1];
};

/**
 * 创建子堆栈
 *
 * @param {Array} astList 初始值
 */
DataStack.prototype.newChild = function (astList) {
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
 * 压入节点
 *
 * @param {Object} ast
 */
DataStack.prototype.push = function (ast) {
  this.last().push(ast);
  return this;
};

/**
 * 关闭上一个子堆栈
 */
DataStack.prototype.close = function () {
  this._parent.pop();
  return this;
};

/**
 * 取堆栈值
 */
DataStack.prototype.result = function () {
  if (this.list.length === 1) {
    return this.list[0];
  } else {
    return this.list;
  }
};

/**
 * 去掉数组中的空白字符串
 *
 * @param {Array} arr
 * @return {Array}
 */
utils.arrayFilterEmptyString = function (arr) {
  return arr.filter(function (item) {
    return item.trim().length > 0 ? true : false;
  });
};

/**
 * 生成随机名字
 *
 * @return {String}
 */
utils.genRandomName = function () {
  return utils.md5(Math.random()).substr(0, 8);
};

/**
 * 输出HTML
 *
 * @param {string} str
 * @return {string}
 */
utils.escapeCodeString = function (str) {
  return str.replace(/\\/g, '\\\\')
            .replace(/'/g, '\\\'')
            .replace(/"/g, '\\\"')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');
};

/**
 * 取指定范围的数字数组
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
 * 将对象转换为数组
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
 * 选择数组的某部分
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
 * 取变量的属性
 *
 * @param {Object} value
 * @param {Array} childs
 * @return {Array}
 */
utils.getChildValue = function (value, childs) {
  if (childs && childs.length > 0) {
    for (var i = 0, len = childs.length; i < len; i++) {
      var c = value[childs[i]];
      if (value && typeof(c) !== 'undefined') {
        value = c;
      } else {
        return [false, childs.slice(i)];
      }
    }
  }
  return [true, value];
};

/**
 * 依次取出数组的每个元素，并异步执行回调
 *
 * @param {Array} list
 * @param {Function} fn 格式：function (item, index, done)
 * @param {Function} callback
 * @param {Object} 第4-6个参数是完成后执行回调时的参数
 * @param {Object} 第7-9个参数是执行循环体时的第4-6个参数
 */
utils.asyncEach = function (list, fn, callback, a1, a2, a3, b1, b2, b3) {
  var i = -1;
  var j = 0;
  var len = list.length;
  var next = function () {
    j++;
    if (j > 32) {
      // 为了避免堆栈溢出，需要使用process.nextTick()来避免，上面的数字为经过测试是最优的
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
// 兼容v0.8及以下版本的Node.js
if (typeof(global.setImmediate) !== 'function') global.setImmediate = process.nextTick.bind(process);

/**
 * 根据条件决定是否继续重复执行异步回调
 *
 * @param {Function} test 函数返回true或false来指示是否继续执行
 * @param {Function} fn 格式：function (done)
 * @param {Function} callback
 * @param {Object} 第4-6个参数是完成后执行回调时的参数
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
