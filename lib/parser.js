/**
 * 解析模板，转换为AST
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var utils = require('./utils');
var OPCODE = require('./opcode');
var merge = utils.merge;
var DataStack = utils.DataStack;
var localsAstNode = utils.localsAstNode;
var isQuoteWrapString = utils.isQuoteWrapString;
var textIndexOf = utils.textIndexOf;
var splitText = utils.splitText;
var stripQuoteWrap = utils.stripQuoteWrap;
var jsonStringify = utils.jsonStringify;
var md5 = utils.md5;
var arrayRemoveEmptyString = utils.arrayRemoveEmptyString;
var genRandomName = utils.genRandomName;


/**
 * 解析模板，转换为AST
 *
 * @param {String} tpl
 * @param {Object} options
 *   - {Object} customTags 自定义解析
 * @return {Array}
 */
var parser = exports = module.exports = function (tpl, options) {
  options = merge({
    customTags: {}
  }, options);
  var customTags = options.customTags = merge(baseTags, options.customTags);

  // context对象，用于编译过程中记录上下文信息
  var astStack = new DataStack();
  var _eptStack = [];
  var _forItems = [];
  var _tablerowItems = [];
  _forItems.test = _tablerowItems.test = function (name) {
    var name = name.split('.')[0];
    return this.indexOf(name) === -1 ? false : true;
  };
  // 记录调试信息
  var line = 1;
  var lineStart = 0;
  var context = {
    astStack:         astStack,          // AST堆栈，生成的AST节点通过此处来操作
    tags:             options.customTags,// 解析标记程序
    raw:              '',                // 未解析期间的模板内容
    disableParseTag:  false,             // 是否不解析标记
    enableParseTag:   function () {      // 判断是否应该恢复解析标记
      if (_eptStack.length < 1) {
        return true;
      } else {
        return _eptStack[_eptStack.length - 1].apply(null, arguments);
      }
    },
    parseTagStack:   _eptStack,         // 恢复解析标记的函数栈，仅用于raw和comment标记
    forItems:       _forItems,          // 用于保存循环中的item名称的栈
    tablerowItems:  _tablerowItems,
    getPosition: function () {          // 返回当前位置信息
      return {
        line:   line,
        column: i - lineStart + 1
      };
    },
    astNode: function () {              // 创建AST节点，带位置信息
      var pos = context.getPosition();
      var ast = [pos.line, pos.column];
      for (var i = 0, len = arguments.length; i < len; i++) {
        ast.push(arguments[i]);
      }
      return ast;
    }
  };

  // 编译器信息
  context.astStack.push(context.astNode(OPCODE.COMPILER_VERSION, 1));

  var mainAst = context.astNode(OPCODE.LIST);

  // 临时字符串
  var strTmp = '';
  var flush = function () {
    if (strTmp.length > 0) {
      astStack.push(context.astNode(OPCODE.PRINTSTRING, strTmp));
    }
    strTmp = '';
  };

  for (var i = 0, len = tpl.length; i < len; i++) {
    var c = tpl[i];
    if (c === '\n') {
      line++;
      lineStart = i;
    }
    var text = tpl.substr(i, 2);
    if (context.disableParseTag) {
      // -----------------------------------------------------------------------
      // 如果已经设置了暂停解析标记的标志，则需要等待恢复条件
      if (text === '{%') {
        var e = textIndexOf(tpl, '%}', i);
        var body = tpl.slice(i + 2, e).trim();
        context.raw = strTmp;
        if (e > i && context.enableParseTag(context, body, body)) {
          context.disableParseTag = false;
          strTmp = '';
          context.raw = '';
          i = e + 1;
        } else {
          strTmp += c;
        }
      } else {
        strTmp += c;
      }
    } else { // ----------------------------------------------------------------
      // 正常解析
      if (text === '{{') {
        var e = textIndexOf(tpl, '}}', i);
        if (e > i) {
          flush();
          astStack.push(parseOutput(tpl.slice(i + 2, e).trim(), context));
          i = e + 1;
        }
      } else if (text === '{%') {
        var e = textIndexOf(tpl, '%}', i);
        if (e > i) {
          flush();
          parseTag(context, tpl.slice(i + 2, e).trim());
          i = e + 1;
        }
      } else {
        strTmp += c;
      }
      // -----------------------------------------------------------------------
    }
  }
  flush();

  return mainAst.concat(context.astStack.result());
};

// 解析内置标记
var baseTags = {

  'if': function (context, name, body) {
    var ast = parseCondition(body, context);
    context.astStack.newChild(context.astNode(OPCODE.IF, ast)).newChild(context.astNode(OPCODE.LIST));
  },


  'unless': function (context, name, body) {
    var ast = parseCondition(body, context);
    context.astStack.newChild(context.astNode(OPCODE.IF, context.astNode(OPCODE.NOT, ast))).newChild(context.astNode(OPCODE.LIST));
  },


  'else': function (context, name, body) {
    context.astStack.close().newChild(context.astNode(OPCODE.LIST));
  },


  'endif': function (context, name, body) {
    context.astStack.close();
    // 重新调整AST结构
    var ast = context.astStack.last();
    context.astStack.close();
    var reset = function (ast) {
      if (ast.length > 6) {
        var a = ast.slice(0, 5);
        a[5] = reset(context.astNode(OPCODE.IF).concat(ast.slice(5)));
        return a;
      } else {
        return ast;
      }
    };
    var list = context.astStack.last();
    list.pop();
    list.push(reset(ast));
  },


  'endunless': function (context, name, body) {
    context.astStack.close().close();
  },


  'elseif': function (context, name, body) {
    context.astStack.close();
    var ast = parseCondition(body, context);
    context.astStack.push(ast).newChild(context.astNode(OPCODE.LIST));
  },


  'case': function (context, name, body) {
    var ast = parseVariables(body, context);
    context.astStack.newChild(context.astNode(OPCODE.CASE)).newChild(ast);
  },


  'when': function (context, name, body) {
    context.astStack.close();
    var ast = parseWhen(body, context);
    context.astStack.push(context.astNode(OPCODE.WHEN, ast)).newChild(context.astNode(OPCODE.LIST));
  },


  'endcase': function (context, name, body) {
    context.astStack.close().close();
  },


  'for': function (context, name, body) {
    var arr = parseFor(body);
    var attrs = arr[2];
    context.astStack.newChild(context.astNode(OPCODE.FOR, localsAstNode(arr[0], context), arr[1],
                                              attrs.offset, attrs.limit)).newChild(context.astNode(OPCODE.LIST));
    context.forItems.push(arr[1]);
  },


  'endfor': function (context, name, body) {
    context.astStack.close().close();
    context.forItems.pop();
  },


  'tablerow': function (context, name, body) {
    var arr = parseFor(body);
    var attrs = arr[2];
    attrs.cols = parseInt(attrs.cols);
    if (!(attrs.cols > 1)) attrs.cols = 1;
    context.astStack.newChild(context.astNode(OPCODE.TABLEROW, localsAstNode(arr[0], context), arr[1],
                                              attrs.offset, attrs.limit, attrs.cols))
                    .newChild(context.astNode(OPCODE.LIST));
    context.tablerowItems.push(arr[1]);                    
  },


  'endtablerow': function (context, name, body) {
    context.astStack.close().close();
    context.tablerowItems.pop();
  },


  'assign': function (context, name, body) {
    var i = body.indexOf('=');
    if (i !== -1) {
      var left = body.substr(0, i).trim();
      var right = body.substr(i + 1).trim();
      var ast = parseVariables(right, context);
      context.astStack.push(context.astNode(OPCODE.ASSIGN, left, ast));
    }
  },


  'capture': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var name = blocks[0] || genRandomName();
    context.astStack.newChild(context.astNode(OPCODE.CAPTURE, name));
  },


  'endcapture': function (context, name, body) {
    context.astStack.close();
  },


  'cycle': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ', ',']));
    blocks = blocks.filter(function (item) {
      return item === ',' ? false : true;
    });
    if (blocks.length > 0) {
      var i = blocks[0].indexOf(':');
      if (i !== -1) {
        var key = blocks[0].substr(0, i);
        blocks[0] = blocks[0].substr(i + 1);
        if (blocks[0].length < 1) {
          blocks.shift();
        }
      } else {
        var key = md5(blocks.join(':')).substr(0, 8);
      }
      blocks = blocks.map(function (item) {
        return localsAstNode(item, context);
      });
      context.astStack.push(context.astNode(OPCODE.CYCLE, key).concat(blocks));
    }
  },


  'include': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    if (blocks.length >= 3 && blocks[1].toLowerCase() === 'with') {
      context.astStack.push(context.astNode(OPCODE.INCLUDE, stripQuoteWrap(blocks[0]), stripQuoteWrap(blocks[2])));
    } else {
      context.astStack.push(context.astNode(OPCODE.INCLUDE, stripQuoteWrap(blocks[0])));
    }
  },


  'raw': function (context, name, body) {
    context.disableParseTag = true;
    context.parseTagStack.push(context.tags.endraw);
  },


  'endraw': function (context, name, body) {
    if (name.toLowerCase() === 'endraw') {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, context.raw));
      return true;
    } else {
      return false;
    }
  },


  'comment': function (context, name, body) {
    context.disableParseTag = true;
    context.parseTagStack.push(context.tags.endcomment);
  },


  'endcomment': function (context, name, body) {
    if (name.toLowerCase() === 'endcomment') {
      context.astStack.push(context.astNode(OPCODE.COMMENT, context.raw));
      return true;
    } else {
      return false;
    }
  }
};

/**
 * 解析filter调用
 *
 * @param {String} text
 * @param {Array} firstArg
 * @param {Array} link
 * @param {Object} context 可选
 * @return {Array}
 */
var parseFilter = parser.parseFilter = function (text, firstArg, link, context) {
  text = text.trim();
  var i = text.indexOf(':');
  if (i === -1) {
    var name = text;
    var args = [];
  } else {
    var name = text.slice(0, i);
    var args = text.slice(i + 1).split(',');
  }
  args = args.map(function (item) {
    return localsAstNode(item.trim(), context);
  });
  args.unshift(firstArg);
  var ast = context.astNode(OPCODE.FILTER, name).concat(args);
  if (link.length > 0) {
    return parseFilter(link.shift(), ast, link, context);
  } else {
    return ast;
  }
};

/**
 * 解析条件
 *
 * @param {String} body
 * @param {Object} context 可选
 * @return {Array}
 */
var parseCondition = parser.parseCondition = function (body, context) {
  var cond = body.trim();
  var blocks = arrayRemoveEmptyString(splitText(cond,
               [' ', '===', '&&', '||', '>=', '<=', '==', '!=', '<>', '=', '>', '<', '!']));
  var trans = {
    '&&': 'and',
    '||': 'or',
    '>':  'gt',
    '<':  'lt',
    '=':  'eq',
    '==': 'eq',
    '===':'ed',
    '<>': 'ne',
    '!=': 'ne',
    '>=': 'ge',
    '<=': 'le',
    '!':  'not'
  };
  blocks = blocks.map(function (item) {
    return (trans[item] || item).toLowerCase();
  });

  // 提取出 and 和 or
  var _blocks = blocks;
  blocks = [];
  var tmp = [];
  var flush = function () {
    if (tmp.length > 0) {
      blocks.push(tmp);
      tmp = [];
    }
  };
  _blocks.forEach(function (item) {
    if (item === 'and' || item === 'or') {
      flush();
      blocks.push(item);
    } else {
      tmp.push(item);
    }
  });
  flush();

  // 生成判断条件的AST
  var condAst = [];
  blocks.forEach(function (item) {
    if (Array.isArray(item)) {
      if (item.length === 1) {
        var ast = context.astNode(OPCODE.EXISTS, localsAstNode(item[0], context));
      } else if (item.length === 2) {
        var code = OPCODE[item[0].toUpperCase()] || OPCODE.DEBUG;
        var ast = context.astNode(code, localsAstNode(item[1], context));
      } else {
        var code = OPCODE[item[1].toUpperCase()] || OPCODE.DEBUG;
        var ast = context.astNode(code, localsAstNode(item[0], context), localsAstNode(item[2], context));
      }
      condAst.push(ast);
    } else {
      condAst.push(item);
    }
  });
  var mergeCond = function (op) {
    if (blocks.length < 3) return;
    var _condAst = condAst;
    condAst = [];
    for (var i = 0, len = _condAst.length; i < len; i++) {
      var mid = _condAst[i + 1];
      if (typeof(mid) === 'string' && mid.toLowerCase() === op && i + 2 < len) {
        var code = OPCODE[op.toUpperCase()] || OPCODE.DEBUG;
        condAst.push(context.astNode(code, _condAst[i], _condAst[i + 2]));
        i += 2;
      } else {
        condAst.push(_condAst[i]);
      }
    }
  };
  // and 优先级比 or 高
  mergeCond('and');
  mergeCond('or');

  return condAst[0];
};

/**
 * 解析When条件
 *
 * @param {String} body
 * @param {Object} context 可选
 * @return {Array}
 */
var parseWhen = parser.parseWhen = function (body, context) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ', 'or']));
  blocks = blocks.filter(function (item) {
    return item === 'or' ? false : true;
  }).map(function (item) {
    var ast = localsAstNode(item, context);
    if (!Array.isArray(ast)) ast = context.astNode(OPCODE.OBJECT, ast);
    return ast;
  });
  return blocks;
};

/**
 * 解析数值及filter调用
 * 如：  a | call:1,2 | lower
 *
 * @param {String} text
 * @param {Object} context 可选
 * @return {Array}
 */
var parseVariables = parser.parseVariables = function (text, context) {
  var i = 0;
  var filters = [];
  while (true) {
    var e = textIndexOf(text, '|', i);
    if (e === -1) {
      break;
    } else {
      filters.push(text.slice(i, e).trim());
      i = e + 1;
    }
  }
  if (filters.length > 0) {
    filters.push(text.slice(i).trim());
  }
  if (filters.length > 1) {
    var name = filters.shift();
    var astList = parseFilter(filters.shift(), localsAstNode(name, context), filters, context);
  } else {
    var astList = localsAstNode(text, context);
  }
  return astList;
};

/**
 * 解析For循环
 *
 * @param {String} body
 * @return {Array}
 */
var parseFor = parser.parseFor = function (body) {
  var blocks = arrayRemoveEmptyString(splitText(body, [' ']));

  var parseAttrs = function (blocks) {
    if (blocks.length < 1) return {};
    var attrString = blocks.reduce(function (sum, item) {
      if (item === ':') return sum;
      if (sum.substr(-1) === ':') return sum + item;
      return sum + ' ' + item;
    });
    var attrs = {};
    arrayRemoveEmptyString(splitText(attrString, [' ']))
    .forEach(function (item) {
      var i = item.indexOf(':');
      if (i === -1) {
        attrs[item.toLowerCase()] = true;
      } else {
        attrs[item.substr(0, i).toLowerCase()] = item.substr(i + 1);
      }
    });
    return attrs;
  };

  if (blocks.length >= 3 && blocks[1].toLowerCase() === 'in') {
    // 标准写法
    var itemName = blocks[0];
    var arrayName = blocks[2];
    var attrs = parseAttrs(blocks.slice(3));
  } else if (blocks.length === 1 ||
             (blocks.length > 1 && blocks[1].toLowerCase() !== 'in' && blocks[1].indexOf(':') === -1)) {
    // 非标准写法，如 {% for array %}
    var itemName = 'item';
    var arrayName = blocks[0];
    var attrs = parseAttrs(blocks.slice(1));
  }
  if (!(attrs.offset > 0)) attrs.offset = 0;
  if (!(attrs.limit > 0)) attrs.limit = 0;

  return [arrayName, itemName, attrs];
};

/**
 * 解析输出 {{name}}
 *
 * @param {String} text
 * @param {Object} context 可选
 * @return {Array}
 */
var parseOutput = function (text, context) {
  var astList = parseVariables(text, context);
  if (Array.isArray(astList)) {
    if (astList[2] === OPCODE.LOCALS) {
      // 针对输出变量的优化
      return context.astNode(OPCODE.PRINTLOCALS).concat(astList.slice(3));
    } else {
      return context.astNode(OPCODE.PRINT, astList);
    }
  } else {
    return context.astNode(OPCODE.PRINTSTRING, astList);
  }
};

/**
 * 解析标记 {%tag%}
 *
 * @param {Object} context
 * @param {String} text
 * @return {Array}
 */
var parseTag = function (context, text) {
  var i = text.indexOf(' ');
  if (i === -1) {
    var name = text;
    var body = '';
  } else {
    var name = text.slice(0, i);
    var body = text.slice(i + 1).trim();
  }
  name = name.toLowerCase();
  
  if (typeof(context.tags[name]) === 'function') {
    context.tags[name](context, name, body);
  } else {
    context.astStack.push(context.astNode(OPCODE.DEBUG, name, body));
  }
};
