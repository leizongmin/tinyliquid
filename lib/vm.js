/**
 * Run AST
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var Context = require('./context');
var OPCODE = require('./opcode');
var debug = utils.debug('VM');
var merge = utils.merge;
var DataStack = utils.DataStack;
var range = utils.range;
var toArray = utils.toArray;
var arraySlice = utils.arraySlice;
var getChildValue = utils.getChildValue;
var asyncEach = utils.asyncEach;
var asyncFor = utils.asyncFor;



/**
 * If it's opcode return true, else return false
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isOpcode = function (ast) {
  return ast instanceof Array && !(ast[0] instanceof Array);
};

/**
 * If it's AST array return true, else return false
 *
 * @param {Array} ast
 * @return {Boolean}
 */
var isAST = function (ast) {
  return ast instanceof Array;
};

/**
 * Run AST
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback format: function (err, return_value)
 */
var run = exports.run = function (astList, context, callback) {
  if (isAST(astList)) {
    if (isOpcode(astList)) {
      // single AST Node
      var op = execOpcode[astList[2]];
      if (!op) op = execOpcode[OPCODE.UNKNOWN];
      context.setCurrentPosition(astList[0], astList[1]);
      // debug('opcode: ' + astList[2] + ' at ' + astList[0] + ', ' + astList[1]);
      op(context, callback, astList.slice(2));
    } else {
      // AST list
      var retval = new Array(astList.length);
      asyncEach(astList, runEachItem, callback, null, retval, null, context, retval);
    }
  } else {
    callback(null, astList);
  }
};
var runEachItem = function (item, index, callback, context, retval) {
  run(item, context, function (err, vals) {
    if (err) {
      callback(err);
      return;
    }
    retval[index] = vals;
    callback(null);
  });
};

/**
 * Get the arguments of the current AST node
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs = function (astList, context, callback) {
  var retval = new Array(astList.length);
  asyncEach(astList, function (ast, i, done) {
    run(ast, context, function (err, val) {
      if (err) {
        callback(err);
      } else {
        retval[i] = val;
        done();
      }
    });
  }, callback, null, retval);
};

/**
 * Get the two arguments of the current AST node
 *
 * @param {Array} astList
 * @param {Object} context
 * @param {Function} callback
 */
var getOpArgs2 = function (astList, context, callback) {
  var retval = new Array(2);
  var i = 0;
  var getOpArgs2_callback = function (err, val) {
    if (err) {
      callback(err);
    } else {
      retval[i] = val;
      i++;
      if (i >= 2) callback(null, retval);
    }
  };
  run(astList[1], context, getOpArgs2_callback);
  run(astList[2], context, getOpArgs2_callback);
};


var execOpcode = [];


execOpcode[OPCODE.UNKNOWN] = function (context, callback, ast) {
  callback(context.throwUnknownOpcodeError(ast[0]));
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
  if (err) {
    callback(err, val);
  } else {
    context.print(val);
    callback(err, val);
  }
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
function getLocals (fullName, mainName, childs, context, callback, a1, a2, a3) {
  // try to get the fullName first
  var info = context.getLocals(fullName);
  if (info) {
    var name = fullName;
    childs = null;
  } else {
    var name = mainName;
  }
  context.fetchSingleLocals(name, function (err, val) {
    if (err) {
      callback(err, null, a1, a2, a3);
    } else {
      if (childs) {
        var v = getChildValue(val, childs);
        if (v[0]) {
          callback(null, v[1], a1, a2, a3);
        } else {
          callback(context.throwLocalsUndefinedError(fullName), null, a1, a2, a3);
        }
      } else {
        callback(null, val, a1, a2, a3);
      }
    }
  });
}


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
          callback(context.throwLoopItemUndefinedError(fullName), null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  callback(context.throwLoopItemUndefinedError(mainName), null);
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
          callback(context.throwLoopItemUndefinedError(fullName), null);
        }
      } else {
        callback(null, loop.item);
      }
      return;
    }
  }
  callback(context.throwLoopItemUndefinedError(mainName), null);
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
      default:
        callback(context.throwLoopLocalsUndefinedError('forloop.' + ast[2]), val);
        return;
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
      default:
        callback(context.throwLoopLocalsUndefinedError('tablerowloop.' + ast[2]), val);
        return;
    }
  }
  callback(null, val);
};


execOpcode[OPCODE.FILTER] = function (context, callback, ast) {
  getOpArgs(ast.slice(2), context, function (err, args) {
    if (err) {
      callback(err);
    } else {
      context.callFilter(ast[1], args, callback);
    }
  });
};


execOpcode[OPCODE.IF] = function (context, callback, ast) {
  run(ast[1], context, function (err, isTrue) {
    if (err) {
      callback(err);
    } else {
      if (isTrue) {
        run(ast[2], context, callback);
      } else {
        run(ast[3], context, callback);
      }
    }
  });
};


execOpcode[OPCODE.FOR] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) {
      callback(err);
    } else {
      var arr = arraySlice(toArray(arr), ast[3], ast[4]);
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
        run(astElse, context, callback);
      } else {
        callback(null);
      }
    }
  });
};


execOpcode[OPCODE.TABLEROW] = function (context, callback, ast) {
  run(ast[1], context, function (err, arr) {
    if (err) {
      callback(err);
    } else {
      var arr = arraySlice(toArray(arr), ast[3], ast[4]);
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
            if (err) {
              callback(err);
            } else {
              context.print('</td>');
              ci++;
              if (ci > cols) {
                context.print('</tr>');
                ci = 1;
                ri++;
              }
              done();
            }
          });
        }, function () {
          if (arr.length % cols !== 0) context.print('</tr>');
          context.tablerowloopEnd();
          callback(null);
        });
      } else if (astElse) {
        run(astElse, context, callback);
      } else {
        callback(null);
      }
    }
  });
};


execOpcode[OPCODE.CASE] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      var list = ast.slice(2);
      var cond = false;
      asyncFor(function () {
        return list.length > 0;
      }, function (done) {
        var a = list.shift();
        var b = list.shift();
        if (isOpcode(a) && isAST(b)) {
          run(a, context, function (err, vals) {
            if (err) {
              callback(err);
            } else {
              for (var i = 0, len = vals.length; i < len; i++) {
                if (vals[i] == val) {
                  list = [];
                  cond = true;
                  run(b, context, function (err) {
                    if (err) {
                      callback(err);
                    } else {
                      done();
                    }
                  });
                  return;
                }
              }
              done();
            }
          });
        } else {
          list = [];
          if (cond) {
            done();
          } else {
            run(a, context, function (err) {
              if (err) {
                callback(err);
              } else {
                done();
              }
            });
          }
        }
      }, callback);
    }
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
    if (err) {
      callback(err);
    } else {
      context.print(val);
      callback(err);
    }
  });
};


execOpcode[OPCODE.EXISTS] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    callback(err || null, val ? true : false);
  });
};


execOpcode[OPCODE.AND] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) {
      callback(err);
    } else {
      var val = vals.reduce(reduceAAndB);
      callback(null, val);
    }
  });
};
var reduceAAndB = function (a, b) {
  return a && b;
};


execOpcode[OPCODE.OR] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    if (err) {
      callback(err);
    } else {
      var val = vals.reduce(reduceAOrB);
      callback(null, val);
    }
  });
};
var reduceAOrB = function (a, b) {
  return a || b;
};


execOpcode[OPCODE.NOT] = function (context, callback, ast) {
  run(ast[1], context, function (err, val) {
    callback(err || null, !!!val);
  });
};


execOpcode[OPCODE.LT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] < vals[1]);
  });
};


execOpcode[OPCODE.LE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] <= vals[1]);
  });
};


execOpcode[OPCODE.GT] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] > vals[1]);
  });
};


execOpcode[OPCODE.GE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] >= vals[1]);
  });
};


execOpcode[OPCODE.EQ] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] == vals[1]);
  });
};


execOpcode[OPCODE.ED] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] === vals[1]);
  });
};


execOpcode[OPCODE.NE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] != vals[1]);
  });
};


execOpcode[OPCODE.CONTAINS] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, String(vals[0]).indexOf(vals[1]) !== -1);
  });
};


execOpcode[OPCODE.HASVALUE] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, toArray(vals[0]).indexOf(vals[1]) !== -1);
  });
};


execOpcode[OPCODE.HASKEY] = function (context, callback, ast) {
  getOpArgs2(ast, context, function (err, vals) {
    callback(err || null, vals[0] && typeof(vals[0][vals[1]]) !== 'undefined');
  });
};


execOpcode[OPCODE.WHEN] = function (context, callback, ast) {
  run(ast[1], context, function (err, vals) {
    callback(err || null, vals);
  });
};


execOpcode[OPCODE.ASSIGN] = function (context, callback, ast) {
  run(ast[2], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      context.setLocals(ast[1], val);
      callback(err);
    }
  });
};


execOpcode[OPCODE.WEAK_ASSIGN] = function (context, callback, ast) {
  run(ast[2], context, function (err, val) {
    if (err) {
      callback(err);
    } else {
      context._locals[ast[1]] = val;
      callback(err);
    }
  });
};


execOpcode[OPCODE.CAPTURE] = function (context, callback, ast) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) {
      callback(err);
    } else {
      var buf = context.getBuffer();
      context.setBuffer(oldBuf);
      context.setLocals(ast[1], buf);
      callback(err);
    }
  });
};


execOpcode[OPCODE.BLOCK] = function (context, callback, ast) {
  var oldBuf = context.getBuffer();
  context.setBuffer('');
  run(ast.slice(2), context, function (err) {
    if (err) {
      callback(err);
    } else {
      var buf = context.getBuffer();
      context.setBuffer(oldBuf);

      // if on layout, output the block buffer
      if (context._isLayout) {
        context.setBlockIfEmpty(ast[1], buf);
        context.print(context.getBlock(ast[1]));
      } else {
        context.setBlock(ast[1], buf);
      }

      callback(err);
    }
  });
};


execOpcode[OPCODE.RANGE] = function (context, callback, ast) {
  run(ast[1], context, function (err, a) {
    if (err) {
      callback(err);
    } else {
      run(ast[2], context, function (err, b) {
        if (err) {
          callback(err);
        } else {
          callback(null, range(a, b));
        }
      });
    }
  });
};


execOpcode[OPCODE.OBJECT] = function (context, callback, ast) {
  callback(null, ast[1]);
};


execOpcode[OPCODE.COMMENT] = function (context, callback, ast) {
  callback(null);
};


execOpcode[OPCODE.EXTENDS] = function (context, callback, ast) {
  run(ast[1], context, function (err, filename) {
    if (err) return callback(err);
    context.setLayout(filename);
    callback(null);
  });
};


execOpcode[OPCODE.INCLUDE] = function (context, callback, ast) {
  run(ast[1], context, function (err, filename) {
    if (err) return callback(err);
    context.include(filename, ast[2], ast[3], callback);
  });
};


execOpcode[OPCODE.COMPILER_VERSION] = function (context, callback, ast) {
  callback(null);
};


execOpcode[OPCODE.UNKNOWN_TAG] = function (context, callback, ast) {
  callback(context.throwUnknownTagError(ast[1], ast[2] || ''));
};


execOpcode[OPCODE.TEMPLATE_FILENAME_PUSH] = function (context, callback, ast) {
  context.pushFilename(ast[1]);
  callback(null);
};


execOpcode[OPCODE.TEMPLATE_FILENAME_POP] = function (context, callback, ast) {
  context.popFilename();
  callback(null);
};
