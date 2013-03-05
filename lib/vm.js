/**
 * 执行AST代码
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var flow = require('bright-flow');
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


/*
AST指令
[compiler 编译器信息]
[debug 调试信息]
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
      runOpcode(astList, context, callback);
    } else {
      // 执行AST节点返回的值
      var retval = [];
      flow.each(astList).do(function (item) {
        var me = this;
        run(item, context, function (err, vals) {
          if (err) context.throwError(err);
          retval = retval.concat(vals);
          me.done();
        });
      }).timeout(context.options.timeout).end(function (isTimeout) {
        if (isTimeout) context.throwTimeoutError();
        callback(null, retval);
      });
    }
  } else {
    callback(null, astList);
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
  }).timeout(context.options.timeout).end(function (isTimeout) {
    if (isTimeout) context.throwTimeoutError();
    callback(null, retval);
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

    case OPCODE.PRINT:
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
      break;

    case OPCODE.DEBUG:
      context.debug(ast[1]);
      callback(null);
      break;

    case OPCODE.LOCALS:
      var info = context.getLocals(ast[1]);
      if (info === null) {
        context.throwLocalsUndefinedError(ast[1]);
        callback(null, null);
      } else if (info[0] === context.ASYNC_LOCALS) {
        // 异步获取变量
        info[1](ast[1], function (err, val) {
          if (err) context.throwError(err);
          var v = getChildValue(val, info[2])
          if (v[0]) {
            callback(null, v[1]);
          } else {
            context.throwLocalsUndefinedError(ast[1]);
            callback(null, null);
          }
        });
      } else if (info[0] === context.SYNC_LOCALS) {
        // 通过函数获取的变量
        var v = getChildValue(info[1](ast[1]), info[2]);
        if (v[0]) {
          callback(null, v[1]);
        } else {
          context.throwLocalsUndefinedError(ast[1]);
          callback(null, null);
        }
      } else {
        // 静态变量
        var v = getChildValue(info[1], info[2]);
        if (v[0]) {
          callback(null, v[1]);
        } else {
          context.throwLocalsUndefinedError(ast[1]);
          callback(null, null);
        }
      }
      break;

    case OPCODE.FILTER:
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
      break;

    case OPCODE.IF:
      var list = ast.slice(1);
      var cond = false;
      flow.for(function () {
        return list.length > 0;
      }).do(function () {
        var me = this;
        var a = list.shift();
        var b = list.shift();
        if (isOpcode(a) && isAST(b)) {
          run(a, context, function (err, val) {
            if (err) context.throwError(err);
            cond = val;
            if (val) {
              list = [];
              run(b, context, function (err) {
                if (err) context.throwError(err);
                me.done();
              });
            } else {
              me.done();
            }
          });
        } else if (isAST(a)) {
          list = [];
          if (cond) {
            me.done();
          } else {
            run(a, context, function (err) {
              if (err) context.throwError(err);
              me.done();
            });
          }
        } else {
          list = [];
          me.done();
        }
      }).timeout(context.options.timeout).end(function (isTimeout) {
        if (isTimeout) context.throwTimeoutError();
        callback(null);
      });
      break;

    case OPCODE.FOR:
      run(ast[1], context, function (err, arr) {
        if (err) context.throwError(err);
        arr = arraySlice(toArray(arr), ast[3], ast[4]);
        var astLoop = ast[5];
        var astElse = ast[6];
        if (arr.length > 0) {
          context.forloopEnter(arr.length, ast[2]);
          flow.each(arr).do(function (item, i) {
            var me = this;
            context.forloopItem(item, i);
            run(astLoop, context, function (err) {
              if (err) context.throwError(err);
              me.done();
            });
          }).timeout(context.options.timeout).end(function (isTimeout) {
            if (isTimeout) context.throwTimeoutError();
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
      break;

    case OPCODE.TABLEROW:
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
          flow.each(arr).do(function (item, i) {
            var me = this;
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
              me.done();
            });
          }).timeout(context.options.timeout).end(function (isTimeout) {
            if (isTimeout) context.throwTimeoutError();
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
      break;

    case OPCODE.CYCLE:
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
      break;

    case OPCODE.EXISTS:
      run(ast[1], context, function (err, val) {
        if (err) context.throwError(err);
        callback(null, val ? true : false);
      });
      break;

    case OPCODE.AND:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        var val = vals.reduce(function (a, b) {
          return a && b;
        });
        callback(null, val);
      });
      break;

    case OPCODE.OR:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        var val = vals.reduce(function (a, b) {
          return a || b;
        });
        callback(null, val);
      });
      break;

    case OPCODE.NOT:
      run(ast[1], context, function (err, val) {
        if (err) context.throwError(err);
        callback(null, !!!val);
      });
      break;

    case OPCODE.LT:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] < vals[1]);
      });
      break;

    case OPCODE.LE:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] <= vals[1]);
      });
      break;

    case OPCODE.GT:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] > vals[1]);
      });
      break;

    case OPCODE.GE:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] >= vals[1]);
      });
      break;

    case OPCODE.EQ:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] == vals[1]);
      });
      break;

    case OPCODE.ED:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] === vals[1]);
      });
      break;

    case OPCODE.NE:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] != vals[1]);
      });
      break;

    case OPCODE.CONTAINS:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, String(vals[0]).indexOf(vals[1]) !== -1);
      });
      break;

    case OPCODE.HASVALUE:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, toArray(vals[0]).indexOf(vals[1]) !== -1);
      });
      break;

    case OPCODE.HASKEY:
      getOpArgs(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
      });
      break;

    case OPCODE.CASE:
      run(ast[1], context, function (err, val) {
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
            run(a, context, function (err, vals) {
              if (err) context.throwError(err);
              for (var i = 0, len = vals.length; i < len; i++) {
                if (vals[i] == val) {
                  list = [];
                  cond = true;
                  return run(b, context, function (err) {
                    if (err) context.throwError(err);
                    me.done();
                  });
                }
              }
              me.done();
            });
          } else {
            list = [];
            if (cond) {
              me.done();
            } else {
              run(a, context, function (err) {
                if (err) context.throwError(err);
                me.done();
              });
            }
          }
        }).timeout(context.options.timeout).end(function (isTimeout) {
          if (isTimeout) context.throwTimeoutError();
          callback(null);
        });
      });
      break;

    case OPCODE.WHEN:
      run(ast.slice(1), context, function (err, vals) {
        if (err) context.throwError(err);
        callback(null, vals);
      });
      break;

    case OPCODE.ASSIGN:
      run(ast[2], context, function (err, val) {
        if (err) context.throwError(err);
        context.setLocals(ast[1], val);
        callback(err);
      });
      break;

    case OPCODE.CAPTURE:
      var oldBuf = context.getBuffer();
      context.setBuffer('');
      run(ast.slice(2), context, function (err) {
        if (err) context.throwError(err);
        var buf = context.getBuffer();
        context.setBuffer(oldBuf);
        context.setLocals(ast[1], buf);
        callback(err);
      });
      break;

    case OPCODE.RANGE:
      var val = range(ast[1], ast[2]);
      callback(null, val);
      break;

    case OPCODE.OBJECT:
      callback(null, ast[1]);
      break;

    case OPCODE.COMMENT:
      callback(null);
      break;

    case OPCODE.INCLUDE:
      context.include(ast[1], ast[2], function (err) {
        if (err) context.throwError(err);
        callback(err);
      });
      break;

    case OPCODE.COMPILER:
      run(ast[1], context, function (err, val) {
        context.compilerInfo(val);
        callback(err);
      });
      break;

    default:
      // 无法识别的操作码
      context.throwUnknownOpcodeError();
      callback(null);
  }
};
