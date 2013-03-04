/**
 * 执行AST代码
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var flow = require('bright-flow');
var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var merge = utils.merge;
var DataStack = utils.DataStack;
var range = utils.range;
var toArray = utils.toArray;
var arraySlice = utils.arraySlice;
var getChildValue = utils.getChildValue;

/*
AST指令
[$$compiler 编译器信息]
[$$debug 调试信息]
[object Object对象]
[print 要输出的值]
[if 条件 条件为真时执行 条件为假时执行]
[if 条件1 条件1为真时执行 条件2 条件2为真时执行 条件3 条件3为真时执行 所有条件均为假时执行]
[for 数组名 循环元素名 开始位置 限制数量 AST指令列表]
[tablerow 数组名 循环元素名 开始位置 每行数量 AST指令列表]
[assign 变量名 值]
[capture 变量名 AST指令列表]
[cycle 名称 值1 值2 值3]
[include 文件名 变量名]
[comment 备注内容]
[filter 函数名 参数1 参数2 参数3]
[and 值1 值2]
[or 值1 值2]
[not 值]
[exists 值]
[lt 值1 值2]
[gt 值1 值2]
[eq 值1 值2]
[ed 值1 值2]
[ne 值1 值2]
[ge 值1 值2]
[le 值1 值2]
[contains 值1 值2]
[hasvalue 值1 值2]
[haskey 值1 值2]
[range 开始位置 结束位置]
[case 值 可能的值1 [条件成立时执行] [所有添加均为假时执行]]
[when 值1 值2]
*/



/**
 * 如果是最终指令，返回true
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isOpcode = function (ast) {
  return Array.isArray(ast) && typeof(ast[0]) === 'string';
};

/**
 * 如果是AST节点，返回true
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isAST = function (ast) {
  return Array.isArray(ast);
};

/**
 * 执行AST
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback 格式：function (err, 返回值列表)
 */
var run = exports.run = function (astList, context, callback) {
  if (isAST(astList)) {
    if (isOpcode(astList)) {
      return runOpcode(astList, context, callback);
    }

    // 执行AST节点返回的值
    var retval = [];

    flow.each(astList).do(function (item) {
      var me = this;
      run(item, context, function (err, vals) {
        if (err) context.throwError(err);
        retval = retval.concat(vals);
        me.done();
      });
    }).timeout(context.options.timeout).end(function (err) {
      if (err) context.throwError(err);
      return callback(err, retval);
    });
  } else {
    return callback(null, astList);
  } 
};

/**
 * 取操作码的各个参数值
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs = function (astList, context, callback) {
  var retval = [];
  flow.each(astList).do(function (ast, i) {
    var me = this;
    run(ast, context, function (err, val) {
      if (err) context.throwError(err);
      retval[i] = val;
      me.done();
    });
  }).timeout(context.options.timeout).end(function (err) {
    if (err) context.throwError(err);
    return callback(err, retval);
  });
};

/**
 * 执行操作码
 *
 * @param {Array} ast
 * @param {Object} context
 * @param {Function}
 */
var runOpcode = function (ast, context, callback) {
  switch (ast[0]) {
    // 按照执行频率来排序

    case 'print':
      if (isAST(ast[1])) {
        run(ast[1], context, function (err, val) {
          if (err) {
            return callback(err);
          } else {
            context.print(val);
            return callback(null);
          }
        });
      } else {
        context.print(ast[1]);
        return callback(null);
      }
      break;

    case '$$debug':
      context.debug(ast[1]);
      return callback(null);

    case 'locals':
      var info = context.getLocals(ast[1]);
      if (info === null) {
        return callback(new Error('locals "' + ast[1] + '" is undefined'));
      } else if (info[0] === context.ASYNC_LOCALS) {
        // 异步获取变量
        return info[1](ast[1], function (err, val) {
          if (err) context.throwError(err);
          var v = getChildValue(val, info[2])
          if (v[0]) {
            return callback(null, v[1]);
          } else {
            return callback(new Error('locals "' + ast[1] + '" is undefined'));
          }
        });
      } else if (info[0] === context.SYNC_LOCALS) {
        // 通过函数获取的变量
        var v = getChildValue(info[1](ast[1]), info[2]);
        if (v[0]) {
          return callback(null, v[1]);
        } else {
          return callback(new Error('locals "' + ast[1] + '" is undefined'));
        }
      } else {
        // 静态变量
        var v = getChildValue(info[1], info[2]);
        if (v[0]) {
          return callback(null, v[1]);
        } else {
          return callback(new Error('locals "' + ast[1] + '" is undefined'));
        }
      }
      break;

    case 'filter':
      var info = context.getFilter(ast[1]);
      if (info === null) {
        return callback(new Error('filter "' + ast[1] + '" is undefined'));
      } else {
        return getOpArgs(ast.slice(2), context, function (err, args) {
          if (err) context.throwError(err);
          if (info[0] === context.ASYNC_FILTER) {
            // 异步调用的filter
            args.push(function (err, val) {
              return callback(err, val);
            });
            return info[1].apply(null, args);
          } else {
            // 普通filter
            return callback(err, info[1].apply(null, args));
          }
        });
      }
      break;

    case 'if':
      var list = ast.slice(1);
      var cond = false;
      flow.for(function () {
        return list.length > 0;
      }).do(function () {
        var me = this;
        var a = list.shift();
        var b = list.shift();
        if (isOpcode(a) && isAST(b)) {
          return run(a, context, function (err, val) {
            if (err) context.throwError(err);
            cond = val;
            if (val) {
              list = [];
              return run(b, context, function (err) {
                if (err) context.throwError(err);
                return me.done();
              });
            } else {
              return me.done();
            }
          });
        } else if (isAST(a)) {
          list = [];
          if (cond) {
            return me.done();
          } else {
            return run(a, context, function (err) {
              if (err) context.throwError(err);
              return me.done();
            });
          }
        } else {
          list = [];
          return me.done();
        }
      }).timeout(context.options.timeout).end(function (err) {
        if (err) context.throwError(err);
        return callback(err);
      });
      break;

    case 'for':
      return run(ast[1], context, function (err, arr) {
        if (err) context.throwError(err);
        arr = arraySlice(toArray(arr), ast[3], ast[4]);
        var astLoop = ast[5];
        var astElse = ast[6];
        if (arr.length > 0) {
          context.forloopEnter(arr.length, ast[2]);
          flow.each(arr).do(function (item, i) {
            var me = this;
            context.forloopItem(item, i);
            return run(astLoop, context, function (err) {
              if (err) context.throwError(err);
              me.done();
            });
          }).timeout(context.options.timeout).end(function (err) {
            if (err) context.throwError(err);
            context.forloopEnd();
            return callback(err);
          });
        } else if (astElse) {
          return run(astElse, context, function (err) {
            if (err) context.throwError(err);
            return callback(err);
          });
        } else {
          return callback(null);
        }
      });
      break;

    case 'tablerow':
      return run(ast[1], context, function (err, arr) {
        if (err) context.throwError(err);
        arr = arraySlice(toArray(arr), ast[3], ast[4]);
        var cols = parseInt(ast[5]);
        var astLoop = ast[6];
        var astElse = ast[7];
        if (arr.length > 0) {
          context.tablerowloopEnter(arr.length, ast[2], cols);
          var ci = 1;
          var ri = 1;
          flow.each(arr).do(function (item, i) {
            var me = this;
            if (ci === 1) context.print('<tr class="row' + ri + '">');
            context.print('<td class="col' + ci + '">');
            context.tablerowloopItem(item, i, ci);
            return run(astLoop, context, function (err) {
              if (err) context.throwError(err);
              context.print('</td>');
              ci++;
              if (ci > cols) {
                context.print('</tr>');
                ci = 1;
                ri++;
              }
              me.done();
            });
          }).timeout(context.options.timeout).end(function (err) {
            if (err) context.throwError(err);
            if (arr.length % cols !== 0) context.print('</tr>');
            context.tablerowloopEnd();
            return callback(err);
          });
        } else if (astElse) {
          return run(astElse, context, function (err) {
            if (err) context.throwError(err);
            return callback(err);
          });
        } else {
          return callback(null);
        }
      });
      break;

    case 'cycle':
      var i = context.getCycleIndex(ast[1]);
      if (i === null) {
        context.setCycle(ast[1], ast.slice(2));
        i = 0;
      }
      var item = ast[2 + i];
      return run(item, context, function (err, val) {
        if (err) context.throwError(err);
        context.print(val);
        return callback(err);
      });
      break;

    case 'exists':
      return run(ast[1], context, function (err, val) {
        if (err) context.throwError(err);
        return callback(null, val ? true : false);
      });
      break;

    case 'and':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        var val = vals.reduce(function (a, b) {
          return a && b;
        });
        return callback(null, val);
      });
      break;

    case 'or':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        var val = vals.reduce(function (a, b) {
          return a || b;
        });
        return callback(null, val);
      });
      break;

    case 'not':
      return run(ast[1], context, function (err, val) {
        if (err) context.throwError(err);
        return callback(null, !!!val);
      });
      break;

    case 'lt':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] < vals[1]);
      });
      break;

    case 'le':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] <= vals[1]);
      });
      break;

    case 'gt':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] > vals[1]);
      });
      break;

    case 'ge':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] >= vals[1]);
      });
      break;

    case 'eq':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] == vals[1]);
      });
      break;

    case 'ed':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] === vals[1]);
      });
      break;

    case 'ne':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] != vals[1]);
      });
      break;

    case 'contains':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, String(vals[0]).indexOf(vals[1]) !== -1);
      });
      break;

    case 'hasvalue':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, toArray(vals[0]).indexOf(vals[1]) !== -1);
      });
      break;

    case 'haskey':
      return getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
      });
      break;

    case 'case':
      return run(ast[1], context, function (err, val) {
        if (err) context.throwError(err);
        var list = ast.slice(2);
        var cond = false;
        flow.for(function () {
          return list.length > 0;
        }).do(function () {
          var me = this;
          var a = list.shift();
          var b = list.shift();
          if (isOpcode(a) && isAST(b)) {
            return run(a, context, function (err, vals) {
              if (err) return context.throwError(err);
              for (var i = 0, len = vals.length; i < len; i++) {
                if (vals[i] == val) {
                  list = [];
                  cond = true;
                  return run(b, context, function (err) {
                    if (err) context.throwError(err);
                    return me.done();
                  });
                }
              }
              return me.done();
            });
          } else {
            list = [];
            if (cond) {
              return me.done();
            } else {
              return run(a, context, function (err) {
                if (err) context.throwError(err);
                return me.done();
              });
            }
          }
        }).timeout(context.options.timeout).end(function (err) {
          if (err) context.throwError(err);
          return callback(err);
        });
      });
      break;

    case 'when':
      return run(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        return callback(null, vals);
      });
      break;

    case 'assign':
      return run(ast[2], context, function (err, val) {
        if (err) context.throwError(err);
        context.setLocals(ast[1], val);
        return callback(err);
      });
      break;

    case 'capture':
      var oldBuf = context.getBuffer();
      context.setBuffer('');
      return run(ast.slice(2), context, function (err) {
        if (err) context.throwError(err);
        var buf = context.getBuffer();
        context.setBuffer(oldBuf);
        context.setLocals(ast[1], buf);
        return callback(err);
      });
      break;

    case 'range':
      var val = range(ast[1], ast[2]);
      return callback(null, val);
      break;

    case 'object':
      return callback(null, ast[1]);
      break;

    case 'comment':
      return callback(null);
      break;

    case 'include':
      return context.include(ast[1], ast[2], function (err) {
        if (err) context.throwError(err);
        return callback(err);
      });
      break;

    case '$$compiler':
      return run(ast[1], context, function (err, val) {
        context.compilerInfo(val);
        callback(err);
      });
      break;

    default:
      // 无法识别的操作码
      return callback(new Error('Unknown opcode: ' + ast[0]));
  }
};

/**
 * VM配置对象
 *
 * @param {Object} options
 *   - {Object} filters
 *   - {Object} asyncFilters
 *   - {Object} locals
 *   - {Object} syncLocals
 *   - {Object} asyncLocals
 *   - {Integer} timeout 异步执行时超时时间，单位ms
 */
var Context = exports.Context = function (options) {
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
  
  // 默认配置
  options = merge({
    timeout: 120000
  }, options);
  this.options = options;

  // 初始化配置
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

/* 状态 */
Context.prototype.STATIC_LOCALS = 0;  // 赋值局部变量
Context.prototype.SYNC_LOCALS = 1;    // 通过函数获取值的变量
Context.prototype.ASYNC_LOCALS = 2;   // 通过异步函数获取值的变量
Context.prototype.SYNC_FILTER = 0;    // 普通filter
Context.prototype.ASYNC_FILTER = 1;   // 异步调用的filter

/**
 * 执行AST代码
 *
 * @param {Array} astList
 * @param {Function} callback
 */
Context.prototype.run = function (astList, callback) {
  return run(astList, this, callback);
};

/**
 * 注册局部变量
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setLocals = function (name, val) {
  this._locals[name] = val;
};

/**
 * 注册通过函数获取的局部变量
 *
 * @param {String} name
 * @param {Function} val
 */
Context.prototype.setSyncLocals = function (name, fn) {
  this._syncLocals[name] = fn;
};

/**
 * 注册异步获取的局部变量
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncLocals = function (name, fn) {
  if (name instanceof RegExp) {
    var name2 = name.toString();
    // 需要先去掉原来已存在的相同名称
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
 * 注册Filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setFilter = function (name, fn) {
  this._filters[name.toLowerCase()] = fn;
};

/**
 * 注册异步Filter
 *
 * @param {String} name
 * @param {Function} fn
 */
Context.prototype.setAsyncFilter = function (name, fn) {
  this._asyncFilters[name.toLowerCase()] = fn;
};

/**
 * 取局部变量
 *
 * @param {String} name
 * @return {Array} [属性, 值]，找不到返回null
 */
Context.prototype.getLocals = function (name) {
  var NORMAL = this.STATIC_LOCALS;

  // for循环内的专用变量
  if (this._isInForloop) {
    var loop = this.forloopInfo();
    if (name.substr(0, 8) === 'forloop.') {
      var attrName = name.substr(8);
      switch (attrName.toLowerCase()) {
        case 'length':  return [NORMAL, loop.length];
        case 'name':    return [NORMAL, loop.itemName];
        case 'index0':  return [NORMAL, loop.index];
        case 'index':   return [NORMAL, loop.index + 1];
        case 'rindex0': return [NORMAL, loop.length - loop.index - 1];
        case 'rindex':  return [NORMAL, loop.length - loop.index];
        case 'first':   return [NORMAL, loop.index < 1];
        case 'last':    return [NORMAL, loop.index + 1 >= loop.length];
        default:        return null;
      }
    }
    if (name === loop.itemName) return [NORMAL, loop.item];
  }

  // tablerow循环内的专用变量
  if (this._isInTablerowloop) {
    var loop = this.tablerowloopInfo();
    if (name.substr(0, 13) === 'tablerowloop.') {
      var attrName = name.substr(13);
      switch (attrName.toLowerCase()) {
        case 'length':    return [NORMAL, loop.length];
        case 'name':      return [NORMAL, loop.itemName];
        case 'index0':    return [NORMAL, loop.index];
        case 'index':     return [NORMAL, loop.index + 1];
        case 'rindex0':   return [NORMAL, loop.length - loop.index - 1];
        case 'rindex':    return [NORMAL, loop.length - loop.index];
        case 'first':     return [NORMAL, loop.index < 1];
        case 'last':      return [NORMAL, loop.index + 1 >= loop.length];
        case 'col0':      return [NORMAL, loop.colIndex];
        case 'col':       return [NORMAL, loop.colIndex + 1];
        case 'col_first': return [NORMAL, loop.colIndex < 1];
        case 'col_last':  return [NORMAL, loop.colIndex + 1 >= loop.columns];
        default:          return null;
      }
    }
    if (name === loop.itemName) return [NORMAL, loop.item];
  }

  name = this._localsPrefix + name;
  
  return this._getLocals(name);
};

/**
 * 取局部变量（不包括forloop和tablerowloop前缀）
 *
 * @param {String} names
 * @param {Array} childs
 * @return {Array} [属性, 值]，找不到返回null
 */
Context.prototype._getLocals = function (names, childs) {
  if (Array.isArray(names)) {
    childs.unshift(names.pop());
    if (names.length < 1) return null;
    var name = names.join('.');
  } else {
    var name = names;
    names = name.split('.');
    childs = [];
  }
  if (name in this._locals) return [this.STATIC_LOCALS, this._locals[name], childs];
  if (name in this._syncLocals) return [this.SYNC_LOCALS, this._syncLocals[name], childs];
  if (name in this._asyncLocals) return [this.ASYNC_LOCALS, this._asyncLocals[name], childs];
  for (var i = 0, len = this._asyncLocals2.length; i < len; i++) {
    var item = this._asyncLocals2[i];
    if (item[0].test(name)) {
      return [this.ASYNC_LOCALS, item[1], childs];
    }
  }
  return this._getLocals(names, childs);
};

/**
 * 取filter
 *
 * @param {String} name
 * @return {Array} [属性, 函数]，找不到返回null
 */
Context.prototype.getFilter = function (name) {
  name = name.toLowerCase();
  if (name in this._filters) return [this.SYNC_FILTER, this._filters[name]];
  if (name in this._asyncFilters) return [this.ASYNC_FILTER, this._asyncFilters[name]];
  return null;
};

/**
 * 输出
 *
 * @param {Object} str
 */
Context.prototype.print = function (str) {
  this._buffer += str;
};

/**
 * 设置Buffer
 *
 * @param {String} buf
 */
Context.prototype.setBuffer = function (buf) {
  this._buffer = buf;
};

/**
 * 取Buffer
 *
 * @return {String}
 */
Context.prototype.getBuffer = function () {
  return this._buffer;
};

/**
 * 清空Buffer
 *
 * @return {String}
 */
Context.prototype.clearBuffer = function () {
  var buf = this.getBuffer();
  this.setBuffer('');
  return buf;
};

/**
 * 设置Cycle
 *
 * @param {String} name
 * @param {Array} list
 */
Context.prototype.setCycle = function (name, list) {
  this._cycles[name] = {index: 0, length: list.length, list: list};
};

/**
 * 取指定Cycle的当前索引
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
 * 进入forloop循环
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
 * 设置forloop循环体的元素值
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
 * 取当前forloop的属性
 *
 * @return {Object}
 */
Context.prototype.forloopInfo = function () {
  return this._forloops[this._forloops.length - 1];
};

/**
 * 退出当前的循环
 */
Context.prototype.forloopEnd = function () {
  this._forloops.pop();
  if (this._forloops.length < 1) {
    this._isInForloop = false;
  }
};

/**
 * 进入tablerowloop循环
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
 * 设置tablerowloop循环体的元素值
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
 * 取当前tablerowloop的属性
 *
 * @return {Object}
 */
Context.prototype.tablerowloopInfo = function () {
  return this._tablerowloops[this._tablerowloops.length - 1];
};

/**
 * 退出当前的循环
 */
Context.prototype.tablerowloopEnd = function () {
  this._tablerowloops.pop();
  if (this._tablerowloops.length < 1) {
    this._isInTablerowloop = false;
  }
};

/**
 * 包含文件
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
 * 设置包含文件的函数
 *
 * @param {Function} fn 格式：function (name, callback)
 *                      callback格式： function (err, astList)
 */
Context.prototype.onInclude = function (fn) {
  this._includeFileHandler = fn;
};

/**
 * 抛出异常
 *
 * @param {Object} err
 */
Context.prototype.throwError = function (err) {
  throw err;
};

/**
 * 编译器信息
 *
 * @param {Object} info
 */
Context.prototype.compilerInfo = function (info) {
  this._compiler = info;
};

/**
 * 调试信息
 *
 * @param {Object} info
 */
Context.prototype.debug = function (info) {
  console.log('debug: ', info);
};
