/**
 * 执行AST代码
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var debug = require('debug')('tinyliquid:vm');
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
[locals 变量名 主名 子名数组]
[forloopitem 变量名]
[tablerowloopitem 变量名]
[forlooplocals 属性名]
[tablerowlooplocals 属性名]
[print 要输出的值]
[printlocals 要输出的变量 主名 子名数组]
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
  return ast instanceof Array && !(ast[0] instanceof Array);
};

/**
 * 如果是AST节点，返回true
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isAST = function (ast) {
  return ast instanceof Array;
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
      op(context, callback, astList.slice(2));
    } else {
      // 执行AST节点返回的值
      var retval = new Array(astList.length);
      asyncEach(astList, runEachItem, callback, null, retval, null, context, retval);
    }
  } else {
    callback(null, astList);
  }
};
var runEachItem = function (item, index, done, context, retval) {
  run(item, context, function (err, vals) {
    if (err) throw err;
    retval[index] = vals;
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
  var retval = new Array(astList.length);
  asyncEach(astList, function (ast, i, done) {
    run(ast, context, function (err, val) {
      if (err) throw err;
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
var getOpArgs2 = function (astList, context, callback) {
  var retval = new Array(2);
  var i = 0;
  var getOpArgs2_callback = function (err, val) {
    if (err) throw err;
    retval[i] = val;
    i++;
    if (i >= 2) callback(null, retval);
  };
  run(astList[1], context, getOpArgs2_callback);
  run(astList[2], context, getOpArgs2_callback);
};


var execOpcode = [];

// 无法识别的操作码
execOpcode[OPCODE.UNKNOWN] = function (context, callback, ast) {
  context.throwUnknownOpcodeError(ast[0]);
  callback(null);
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
  context.print(val);
  callback(err, val);
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
var getLocals = function (fullName, mainName, childs, context, callback, a1, a2, a3) {
  if (context._localsPrefix) {
    // TODO: 假如是在include里面的指令，只能重新计算变量名，此处需要优化
    fullName = context._localsPrefix + fullName;
    childs = fullName.split('.');
    mainName = childs.shift();
  }
  var info = context.getLocals(mainName);
  if (info === null) {
    context.throwLocalsUndefinedError(mainName);
    callback(null, null, a1, a2, a3);
  } else {
    getLocalsCase[info[0]](info, fullName, childs, context, callback, a1, a2, a3);
  }
};
var getLocalsCase = [];
// 静态变量
getLocalsCase[Context.prototype.STATIC_LOCALS] = function (info, fullName, childs, context, callback, a1, a2, a3) {
  if (childs) {
    var v = getChildValue(info[1], childs);
    if (v[0]) {
      callback(null, v[1], a1, a2, a3);
    } else {
      context.throwLocalsUndefinedError(fullName);
      callback(null, null, a1, a2, a3);
    }
  } else {
    callback(null, info[1], a1, a2, a3);
  }
};
// 通过函数获取的变量
getLocalsCase[Context.prototype.SYNC_LOCALS] = function (info, fullName, childs, context, callback, a1, a2, a3) {
  var v = getChildValue(info[1](fullName), childs);
  if (v[0]) {
    if (info[2]) context.setLocals(fullName, v[1]);
    callback(null, v[1], a1, a2, a3);
  } else {
    context.throwLocalsUndefinedError(fullName);
    callback(null, null, a1, a2, a3);
  }
};
// 异步获取变量
getLocalsCase[Context.prototype.ASYNC_LOCALS] = function (info, fullName, childs, context, callback, a1, a2, a3) {
  info[1](fullName, function (err, val) {
    if (err) throw err;
    var v = getChildValue(val, childs)
    if (v[0]) {
      if (info[2]) context.setLocals(fullName, v[1]);
      callback(null, v[1], a1, a2, a3);
    } else {
      context.throwLocalsUndefinedError(fullName);
      callback(null, null, a1, a2, a3);
    }
  });
};

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
          context.throwLoopItemUndefinedError(fullName);
          callback(null, null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  context.throwLoopItemUndefinedError(mainName);
  callback(null, null);
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
          context.throwLoopItemUndefinedError(fullName);
          callback(null, null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  context.throwLoopItemUndefinedError(mainName);
  callback(null, null);
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
      default: context.throwLoopLocalsUndefinedError('forloop.' + ast[2]);
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
      default: context.throwLoopLocalsUndefinedError('tablerowloop.' + ast[2]);
    }
  }
  callback(null, val);
};

execOpcode[OPCODE.FILTER] = function (context, callback, ast) {
  var info = context.getFilter(ast[1]);
  if (info === null) {
    context.throwFilterUndefinedError(ast[1]);
    callback(null, null);
  } else {
    getOpArgs(ast.slice(2), context, function (err, args) {
      if (err) throw err;
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

execOpcode[OPCODE.IF] = function (context, callback, ast) {
  run(ast[1], context, function (err, isTrue) {
    if (err) throw err;
    if (isTrue) {
      run(ast[2], context, callback);
    } else {
      run(ast[3], context, callback);
    }
  });
};

execOpcode[OPCODE.FOR] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) throw err;
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
        if (err) throw err;
        callback(err);
      });
    } else {
      callback(null);
    }
  });
};

execOpcode[OPCODE.TABLEROW] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) throw err;
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
          if (err) throw err;
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
        if (err) throw err;
        callback(err);
      });
    } else {
      callback(null);
    }
  });
};

execOpcode[OPCODE.CASE] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    if (err) throw err;
    var list = ast.slice(2);
    var cond = false;
    asyncFor(function () {
      return list.length > 0;
    }, function (done) {
      var a = list.shift();
      var b = list.shift();
      if (isOpcode(a) && isAST(b)) {
        run(a, context, function (err, vals) {
          if (err) throw err;
          for (var i = 0, len = vals.length; i < len; i++) {
            if (vals[i] == val) {
              list = [];
              cond = true;
              return run(b, context, function (err) {
                if (err) throw err;
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
            if (err) throw err;
            done();
          });
        }
      }
    }, callback);
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
    if (err) throw err;
    context.print(val);
    callback(err);
  });
};

execOpcode[OPCODE.EXISTS] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    if (err) throw err;
    callback(null, val ? true : false);
  });
};

execOpcode[OPCODE.AND] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    var val = vals.reduce(function (a, b) {
      return a && b;
    });
    callback(null, val);
  });
};

execOpcode[OPCODE.OR] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    var val = vals.reduce(function (a, b) {
      return a || b;
    });
    callback(null, val);
  });
};

execOpcode[OPCODE.NOT] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    if (err) throw err;
    callback(null, !!!val);
  });
};

execOpcode[OPCODE.LT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] < vals[1]);
  });
};

execOpcode[OPCODE.LE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] <= vals[1]);
  });
};

execOpcode[OPCODE.GT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] > vals[1]);
  });
};

execOpcode[OPCODE.GE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] >= vals[1]);
  });
};

execOpcode[OPCODE.EQ] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] == vals[1]);
  });
};

execOpcode[OPCODE.ED] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] === vals[1]);
  });
};

execOpcode[OPCODE.NE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] != vals[1]);
  });
};

execOpcode[OPCODE.CONTAINS] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, String(vals[0]).indexOf(vals[1]) !== -1);
  });
};

execOpcode[OPCODE.HASVALUE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, toArray(vals[0]).indexOf(vals[1]) !== -1);
  });
};

execOpcode[OPCODE.HASKEY] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) throw err;
    callback(null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
  });
};

execOpcode[OPCODE.WHEN] = function (context, callback, ast) {
  run(ast[1], context, function (err, vals) {
    if (err) throw err;
    callback(null, vals);
  });
};

execOpcode[OPCODE.ASSIGN] = function (context, callback, ast) {
  run(ast[2], context, function (err, val) {
    if (err) throw err;
    context.setLocals(ast[1], val);
    callback(err);
  });
};

execOpcode[OPCODE.CAPTURE] = function (context, callback, ast) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) throw err;
    var buf = context.getBuffer();
    context.setBuffer(oldBuf);
    context.setLocals(ast[1], buf);
    callback(err);
  });
};

execOpcode[OPCODE.RANGE] = function (context, callback, ast) {
  var val = range(ast[1], ast[2]);
  callback(null, val);
};

execOpcode[OPCODE.OBJECT] = function (context, callback, ast) {
  callback(null, ast[1]);
};

execOpcode[OPCODE.COMMENT] = function (context, callback, ast) {
  callback(null);
};

execOpcode[OPCODE.INCLUDE] = function (context, callback, ast) {
  context.include(ast[1], ast[2], function (err) {
    if (err) throw err;
    callback(err);
  });
};

execOpcode[OPCODE.COMPILER_VERSION] = function (context, callback, ast) {
  callback(null);
};
