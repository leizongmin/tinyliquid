/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var crypto = require('crypto');
var utils = exports = module.exports = {};
var OPCODE = require('./opcode');


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
 * 创建AST节点
 */
utils.astNode = function () {
  var ast = [];
  for (var i = 0, len = arguments.length; i < len; i++) {
    ast.push(arguments[i]);
  }
  return ast;
};

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
 * @return {Array}
 */
utils.localsAstNode = function (text) {
  if (text.length > 0) {
    if (utils.isQuoteWrapString(text)) {
      return text.slice(1, text.length - 1);
    } else if (text === 'false') {
      return false;
    } else if (text === 'true') {
      return true;
    } else if (text === 'null' || text === 'empty' || text === 'nil' || text === 'undefined') {
      return null;
    } else if (isFinite(text)) {
      return Number(text);
    } else if (/^\(\d+\.\.\d+\)$/.test(text)) {
      var b = text.match(/^\((\d+)\.\.(\d+)\)$/);
      return utils.astNode(OPCODE.RANGE, b[1], b[2]);
    } else {
      return utils.astNode(OPCODE.LOCALS, text);
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

DataStack.prototype._last = function () {
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
  this._last().push(astList);
  this._parent.push(astList);
  return this;
};

/**
 * 压入节点
 *
 * @param {Object} ast
 */
DataStack.prototype.push = function (ast) {
  this._last().push(ast);
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
 */
utils.asyncEach = function (list, fn, callback) {
  var i = -1;
  var j = 0;
  var len = list.length;
  var next = function () {
    j++;
    if (j > 30) {
      j = 0;
      process.nextTick(next);
    } else {
      i++;
      if (i < len) {
        fn(list[i], i, next);
      } else {
        callback();
      }
    }
  };
  next();
};
