/**
 * 执行AST代码
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var Context = require('./context');
var OPCODE = require('./opcode');
var merge = utils.merge;
var DataStack = utils.DataStack;
var range = utils.range;
var toArray = utils.toArray;
var arraySlice = utils.arraySlice;
var getChildValue = utils.getChildValue;
var asyncEach = utils.asyncEach;
var asyncFor = utils.asyncFor;


/*
AST指令
[compiler_version 编译器信息]
[debug 调试信息]
[object Object对象]
[locals 变量名]
[forloopitem 变量名]
[tablerowloopitem 变量名]
[forlooplocals 属性名]
[tablerowlooplocals 属性名]
[print 要输出的值]
[printlocals 要输出的变量]
[printstring 要输出的字符串或者数值]
[if 条件 条件为真时执行 条件为假时执行]
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
  return Array.isArray(ast) && !Array.isArray(ast[0]);
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
      var op = execOpcode[astList[2]];
      if (!op) op = execOpcode[OPCODE.UNKNOWN];
      context.setCurrentPosition(astList[0], astList[1]);
      op(astList.slice(2), context, callback);
    } else {
      // 执行AST节点返回的值
      var retval = [];
      asyncEach(astList, runEachItem, callback, null, retval, null, context, retval);
    }
  } else {
    callback(null, astList);
  }
};
var runEachItem = function (item, i, done, context, retval) {
  run(item, context, function (err, vals) {
    if (err) context.throwError(err);
    if (Array.isArray(vals)) {
      for (var i = 0, len = vals.length; i < len; i++) {
        retval.push(vals[i]);
      }
    } else {
      retval.push(vals);
    }
    done();
  });
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
  asyncEach(astList, function (ast, i, done) {
    run(ast, context, function (err, val) {
      if (err) context.throwError(err);
      retval[i] = val;
      done();
    });
  }, callback, null, retval);
};

/**
 * 取操作码的各个参数值（2个）
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs2 = getOpArgs;


var execOpcode = [];

// 无法识别的操作码
execOpcode[OPCODE.UNKNOWN] = function (ast, context, callback) {
  context.throwUnknownOpcodeError(ast[0]);
  callback(null);
};

execOpcode[OPCODE.PRINT] = function (ast, context, callback) {
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

execOpcode[OPCODE.PRINTLOCALS] = function (ast, context, callback) {
  getLocals(ast[1], context, printLocalsAndCallback, context, callback);
};
var printLocalsAndCallback = function (err, val, context, callback) {
  context.print(val);
  callback(err, val);
};

execOpcode[OPCODE.PRINTSTRING] = function (ast, context, callback) {
  context.print(ast[1]);
  callback(null);
};

execOpcode[OPCODE.DEBUG] = function (ast, context, callback) {
  context.debug(ast[1]);
  callback(null);
};

execOpcode[OPCODE.LOCALS] = function (ast, context, callback) {
  getLocals(ast[1], context, callback);
};
var getLocals = function (name, context, callback, a1, a2, a3) {
  var info = context.getLocals(name);
  if (info === null) {
    context.throwLocalsUndefinedError(name);
    callback(null, null, a1, a2, a3);
  } else {
    getLocalsCase[info[0]](info, name, context, callback, a1, a2, a3);
  }
};
var getLocalsCase = [];
// 静态变量
getLocalsCase[Context.prototype.STATIC_LOCALS] = function (info, name, context, callback, a1, a2, a3) {
  var v = getChildValue(info[1], info[2]);
  if (v[0]) {
    callback(null, v[1], a1, a2, a3);
  } else {
    context.throwLocalsUndefinedError(name);
    callback(null, null, a1, a2, a3);
  }
};
// 通过函数获取的变量
getLocalsCase[Context.prototype.SYNC_LOCALS] = function (info, name, context, callback, a1, a2, a3) {
  var v = getChildValue(info[1](name), info[2]);
  if (v[0]) {
    if (info[3]) context.setLocals(name, v[1]);
    callback(null, v[1], a1, a2, a3);
  } else {
    context.throwLocalsUndefinedError(name);
    callback(null, null, a1, a2, a3);
  }
};
// 异步获取变量
getLocalsCase[Context.prototype.ASYNC_LOCALS] = function (info, name, context, callback, a1, a2, a3) {
  info[1](name, function (err, val) {
    if (err) context.throwError(err);
    var v = getChildValue(val, info[2])
    if (v[0]) {
      if (info[3]) context.setLocals(name, v[1]);
      callback(null, v[1], a1, a2, a3);
    } else {
      context.throwLocalsUndefinedError(name);
      callback(null, null, a1, a2, a3);
    }
  });
};

execOpcode[OPCODE.FORLOOPITEM] = function (ast, context, callback) {
  var name = ast[1];
  if (context._isInForloop) {
    var loop = context.forloopInfo();
    if ((name + '.').substr(0, loop.itemName.length) === loop.itemName) {
      var v = getChildValue(loop.item, name.split('.').slice(1));
      if (v[0]) {
        callback(null, v[1]);
      } else {
        context.throwLoopItemUndefinedError(name);
        callback(null, null);
      }
      return;
    }
  }
  context.throwLoopItemUndefinedError(name);
  callback(null, null);
};

execOpcode[OPCODE.TABLEROWITEM] = function (ast, context, callback) {
  var name = ast[1];
  if (context._isInTablerowloop) {
    var loop = context.tablerowloopInfo();
    if ((name + '.').substr(0, loop.itemName.length) === loop.itemName) {
      var v = getChildValue(loop.item, name.split('.').slice(1));
      if (v[0]) {
        callback(null, v[1]);
      } else {
        context.throwLoopItemUndefinedError(name);
        callback(null, null);
      }
      return;
    }
  }
  context.throwLoopItemUndefinedError(name);
  callback(null, null);
};

execOpcode[OPCODE.FORLOOPLOCALS] = function (ast, context, callback) {
  var loop = context.forloopInfo();
  var val = null;
  if (loop) {
    switch (ast[1]) {
      case 'length':  val = loop.length;                    break;
      case 'name':    val = loop.itemName;                  break;
      case 'index0':  val = loop.index;                     break;
      case 'index':   val = loop.index + 1;                 break;
      case 'rindex0': val = loop.length - loop.index - 1;   break;
      case 'rindex':  val = loop.length - loop.index;       break;
      case 'first':   val = loop.index < 1;                 break;
      case 'last':    val = loop.index + 1 >= loop.length;  break;
    }
  }
  callback(null, val);
};

execOpcode[OPCODE.TABLEROWLOOPLOCALS] = function (ast, context, callback) {
  var loop = context.tablerowloopInfo();
  var val = null;
  if (loop) {
    switch (ast[1]) {
      case 'length':    val = loop.length;                        break;
      case 'name':      val = loop.itemName;                      break;
      case 'index0':    val = loop.index;                         break;
      case 'index':     val = loop.index + 1;                     break;
      case 'rindex0':   val = loop.length - loop.index - 1;       break;
      case 'rindex':    val = loop.length - loop.index;           break;
      case 'first':     val = loop.index < 1;                     break;
      case 'last':      val = loop.index + 1 >= loop.length;      break;
      case 'col0':      val = loop.colIndex;                      break;
      case 'col':       val = loop.colIndex + 1;                  break;
      case 'col_first': val = loop.colIndex < 1;                  break;
      case 'col_last':  val = loop.colIndex + 1 >= loop.columns;  break;
    }
  }
  callback(null, val);
};

execOpcode[OPCODE.FILTER] = function (ast, context, callback) {
  var info = context.getFilter(ast[1]);
  if (info === null) {
    context.throwFilterUndefinedError(ast[1]);
    callback(null, null);
  } else {
    getOpArgs(ast.slice(2), context, function (err, args) {
      if (err) context.throwError(err);
      if (info[0] === context.ASYNC_FILTER) {
        // 异步调用的filter
        args.push(function (err, val) {
          callback(err, val);
        });
        info[1].apply(null, args);
      } else {
        // 普通filter
        callback(err, info[1].apply(null, args));
      }
    });
  }
};

execOpcode[OPCODE.IF] = function (ast, context, callback) {
  run(ast[1], context, function (err, isTrue) {
    if (err) context.throwError(err);
    if (isTrue) {
      run(ast[2], context, callback);
    } else {
      run(ast[3], context, callback);
    }
  });
};

execOpcode[OPCODE.FOR] = function (ast, context, callback) {
  run(ast[1], context, function (err, arr) {
    if (err) context.throwError(err);
    arr = arraySlice(toArray(arr), ast[3], ast[4]);
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
      run(astElse, context, function (err) {
        if (err) context.throwError(err);
        callback(err);
      });
    } else {
      callback(null);
    }
  });
};

execOpcode[OPCODE.TABLEROW] = function (ast, context, callback) {
  run(ast[1], context, function (err, arr) {
    if (err) context.throwError(err);
    arr = arraySlice(toArray(arr), ast[3], ast[4]);
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
          if (err) context.throwError(err);
          context.print('</td>');
          ci++;
          if (ci > cols) {
            context.print('</tr>');
            ci = 1;
            ri++;
          }
          done();
        });
      }, function () {
        if (arr.length % cols !== 0) context.print('</tr>');
        context.tablerowloopEnd();
        callback(null);
      });
    } else if (astElse) {
      run(astElse, context, function (err) {
        if (err) context.throwError(err);
        callback(err);
      });
    } else {
      callback(null);
    }
  });
};

execOpcode[OPCODE.CASE] = function (ast, context, callback) {
  run(ast[1], context, function (err, val) {
    if (err) context.throwError(err);
    var list = ast.slice(2);
    var cond = false;
    asyncFor(function () {
      return list.length > 0;
    }, function (done) {
      var a = list.shift();
      var b = list.shift();
      if (isOpcode(a) && isAST(b)) {
        run(a, context, function (err, vals) {
          if (err) context.throwError(err);
          for (var i = 0, len = vals.length; i < len; i++) {
            if (vals[i] == val) {
              list = [];
              cond = true;
              return run(b, context, function (err) {
                if (err) context.throwError(err);
                done();
              });
            }
          }
          done();
        });
      } else {
        list = [];
        if (cond) {
          done();
        } else {
          run(a, context, function (err) {
            if (err) context.throwError(err);
            done();
          });
        }
      }
    }, callback);
  });
};

execOpcode[OPCODE.CYCLE] = function (ast, context, callback) {
  var i = context.getCycleIndex(ast[1]);
  if (i === null) {
    context.setCycle(ast[1], ast.slice(2));
    i = 0;
  }
  var item = ast[2 + i];
  run(item, context, function (err, val) {
    if (err) context.throwError(err);
    context.print(val);
    callback(err);
  });
};

execOpcode[OPCODE.EXISTS] = function (ast, context, callback) {
  run(ast[1], context, function (err, val) {
    if (err) context.throwError(err);
    callback(null, val ? true : false);
  });
};

execOpcode[OPCODE.AND] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    var val = vals.reduce(function (a, b) {
      return a && b;
    });
    callback(null, val);
  });
};

execOpcode[OPCODE.OR] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    var val = vals.reduce(function (a, b) {
      return a || b;
    });
    callback(null, val);
  });
};

execOpcode[OPCODE.NOT] = function (ast, context, callback) {
  run(ast[1], context, function (err, val) {
    if (err) context.throwError(err);
    callback(null, !!!val);
  });
};

execOpcode[OPCODE.LT] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] < vals[1]);
  });
};

execOpcode[OPCODE.LE] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] <= vals[1]);
  });
};

execOpcode[OPCODE.GT] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] > vals[1]);
  });
};

execOpcode[OPCODE.GE] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] >= vals[1]);
  });
};

execOpcode[OPCODE.EQ] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] == vals[1]);
  });
};

execOpcode[OPCODE.ED] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] === vals[1]);
  });
};

execOpcode[OPCODE.NE] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] != vals[1]);
  });
};

execOpcode[OPCODE.CONTAINS] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, String(vals[0]).indexOf(vals[1]) !== -1);
  });
};

execOpcode[OPCODE.HASVALUE] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, toArray(vals[0]).indexOf(vals[1]) !== -1);
  });
};

execOpcode[OPCODE.HASKEY] = function (ast, context, callback) {
  getOpArgs2(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
  });
};

execOpcode[OPCODE.WHEN] = function (ast, context, callback) {
  run(ast.slice(1), context, function (err, vals) {
    if (err) context.throwError(err);
    callback(null, vals);
  });
};

execOpcode[OPCODE.ASSIGN] = function (ast, context, callback) {
  run(ast[2], context, function (err, val) {
    if (err) context.throwError(err);
    context.setLocals(ast[1], val);
    callback(err);
  });
};

execOpcode[OPCODE.CAPTURE] = function (ast, context, callback) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) context.throwError(err);
    var buf = context.getBuffer();
    context.setBuffer(oldBuf);
    context.setLocals(ast[1], buf);
    callback(err);
  });
};

execOpcode[OPCODE.RANGE] = function (ast, context, callback) {
  var val = range(ast[1], ast[2]);
  callback(null, val);
};

execOpcode[OPCODE.OBJECT] = function (ast, context, callback) {
  callback(null, ast[1]);
};

execOpcode[OPCODE.COMMENT] = function (ast, context, callback) {
  callback(null);
};

execOpcode[OPCODE.INCLUDE] = function (ast, context, callback) {
  context.include(ast[1], ast[2], function (err) {
    if (err) context.throwError(err);
    callback(err);
  });
};

execOpcode[OPCODE.COMPILER_VERSION] = function (ast, context, callback) {
  run(ast[1], context, function (err, val) {
    context.compilerInfo(val);
    callback(err);
  });
};
