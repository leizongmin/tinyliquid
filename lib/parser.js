/**
 * Parse template
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var utils = require('./utils');
var OPCODE = require('./opcode');
var merge = utils.merge;
var ASTStack = utils.ASTStack;
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
 * Parser context object
 *
 * @param {Object} options
 */
var Context = function (options) {
  this.astStack = new ASTStack();
  this.tags = options.customTags;
  this.raw = '';
  this.disableParseTag = false;
  this.line = 1;
  this.lineStart = 0;
  this.position = 0;
  this.parseTagStack = [];
  this.forItems = [];
  this.tablerowItems = [];
  this.forItems.test = this.tablerowItems.test = function (name) {
    var name = name.split('.')[0];
    return this.indexOf(name) === -1 ? false : true;
  };
};

/**
 * Enable parse tag
 */
Context.prototype.enableParseTag = function () {
  var parseTagStack = this.parseTagStack;
  if (parseTagStack.length < 1) {
    return true;
  } else {
    return parseTagStack[parseTagStack.length - 1].apply(null, arguments);
  }
};

/**
 * Get current position
 *
 * @return {Object}
 */
Context.prototype.getPosition = function () {
  return {
    line:   this.line,
    column: this.position - this.lineStart + 2
  };
};

/**
 * Generate a new AST node
 *
 * @return {Array}
 */
Context.prototype.astNode = function () {
  var pos = this.getPosition();
  var ast = [pos.line, pos.column];
  for (var i = 0, len = arguments.length; i < len; i++) {
    ast.push(arguments[i]);
  }
  return ast;
};


/**
 * Parse template, return AST array
 *
 * @param {String} tpl
 * @param {Object} options
 *   - {Object} customTags
 * @return {Array}
 */
var parser = exports = module.exports = function (tpl, options) {
  options =options || {};
  var customTags = options.customTags = merge(baseTags, options.customTags);

  // parser context
  var context = new Context(options);

  // compiler version
  context.astStack.push(context.astNode(OPCODE.COMPILER_VERSION, 1));

  var mainAst = context.astNode(OPCODE.LIST);

  var strTmp = '';
  function flush () {
    context.astStack.push(context.astNode(OPCODE.PRINTSTRING, strTmp));
    strTmp = '';
  }

  for (var i = 0, len = tpl.length; i < len; i++) {
    context.position = i;
    var c = tpl[i];
    if (c === '\n') {
      context.line++;
      context.lineStart = i;
    }
    var text = tpl.substr(i, 2);
    if (context.disableParseTag) {
      // -----------------------------------------------------------------------
      // raw
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
      // normal
      if (text === '{{') {
        var e = textIndexOf(tpl, '}}', i);
        if (e > i) {
          flush();
          context.astStack.push(parseOutput(tpl.slice(i + 2, e).trim(), context));
          i = e + 1;
        }
      } else if (text === '{%') {
        var e = textIndexOf(tpl, '%}', i);
        if (e > i) {
          // optimize: trim left
          var e2 = strTmp.lastIndexOf('\n');
          if (e2 !== -1) {
            if (strTmp.slice(e2 + 1).trim() === '') {
              strTmp = strTmp.slice(0, e2 + 1);
            }
          }
          // parse tag
          flush();
          parseTag(context, tpl.slice(i + 2, e).trim());
          i = e + 1;
          // optimize: trim right
          var e3 = tpl.indexOf('\n', i + 1);
          if (e3 !== -1) {
            if ((tpl.slice(i + 1, e3 + 1).trim() === '')) {
              i = e3;
              context.line++;
              context.lineStart = i;
            }
          }
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


// Default parser component
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
    // reset the AST structure
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
    if (list) {
      list.pop();
      list.push(reset(ast));
    } else {
      context.astStack.list.push(context.astNode(OPCODE.PRINTSTRING, '{% endif %}'));
    }
  },


  'endunless': function (context, name, body) {
    context.astStack.close().close();
  },


  'elseif': function (context, name, body) {
    context.astStack.close();
    var ast = parseCondition(body, context);
    context.astStack.push(ast).newChild(context.astNode(OPCODE.LIST));
  },


  'elsif': function (context, name, body) {
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
    if (!blocks[0]) {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, 'warning: missing name in {% capture %}'));
    }
    context.astStack.newChild(context.astNode(OPCODE.CAPTURE, name));
  },


  'endcapture': function (context, name, body) {
    context.astStack.close();
  },


  'block': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var name = blocks[0] || genRandomName();
    if (!blocks[0]) {
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, 'warning: missing name in {% block %}'));
    }
    context.astStack.newChild(context.astNode(OPCODE.BLOCK, name));
  },


  'endblock': function (context, name, body) {
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


  'extends': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));

    if (blocks.length === 0) {
      // syntax error
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, '{% extends ' + body + ' %}'));
      return;
    }

    // get the filename
    var bf = blocks[0];
    if (bf.substr(0, 2) === '{{') {
      // filename is a variable
      for (var i = 1; i < blocks.length; i++) {
        var b = blocks[i];
        bf += b;
        if (b.substr(-2) === '}}') {
          break;
        }
      }
      filename = parseVariables(bf.slice(2, -2), context);
      blocks = blocks.slice(i + 1);
    } else {
      // filename is a string
      filename = stripQuoteWrap(bf);
      blocks = blocks.slice(1);
    }

    context.astStack.push(context.astNode(OPCODE.EXTENDS, filename));
  },


  'include': function (context, name, body) {
    var blocks = arrayRemoveEmptyString(splitText(body, [' ']));
    var filename, withLocals, parameters;
    // support the following pattern:
    // {% include xxx %} or {% include "xxx" %}
    // {% include {{xx}} %} and with filters: {% include {{xx | yy}} %}
    // {% include xxx with yy %}
    // {% include xxx a=1 b=2 %}

    if (blocks.length === 0) {
      // syntax error
      context.astStack.push(context.astNode(OPCODE.PRINTSTRING, '{% include ' + body + ' %}'));
      return;
    } else if (blocks.length === 1 &&
               !(blocks[0].substr(0, 2) === '{{' && blocks[0].substr(-2) === '}}')) {
      // filename is a string
      filename = stripQuoteWrap(blocks[0]).trim();
    } else {
      if (blocks.length >= 3 && blocks[blocks.length - 2].toLowerCase() === 'with') {
        // if include "with" syntax
        withLocals = localsAstNode(stripQuoteWrap(blocks[blocks.length - 1]), context);
        blocks = blocks.slice(0, -2);
      }
      // get the filename
      var bf = blocks[0];
      if (bf.substr(0, 2) === '{{') {
        // filename is a variable
        for (var i = 1; i < blocks.length; i++) {
          var b = blocks[i];
          bf += b;
          if (b.substr(-2) === '}}') {
            break;
          }
        }
        filename = parseVariables(bf.slice(2, -2), context);
        blocks = blocks.slice(i + 1);
      } else {
        // filename is a string
        filename = stripQuoteWrap(bf).trim();
        blocks = blocks.slice(1);
      }

      // parse multi-part parameters
      if (blocks.length > 0) {
        blocks = arrayRemoveEmptyString(splitText(blocks.join(' '), [' ', '=']));
        var parts = [];
        var pi = 0;
        function addPart (i) {
          if (i < 0) return;
          parts.push(blocks.slice(pi, i + 1).join(''));
          pi = i + 1;
        }
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i];
          if (b === '=') {
            addPart(i - 2);
          }
        }
        addPart(i);
        parameters = context.astNode(OPCODE.LIST);
        //console.log(blocks, parts);
        parts.forEach(function (part) {
          var i = part.indexOf('=');
          if (i !== -1) {
            var left = part.substr(0, i).trim();
            var right = part.substr(i + 1).trim();
            var ast = parseVariables(right, context);
            parameters.push(context.astNode(OPCODE.WEAK_ASSIGN, left, ast));
          }
        });
      }
    }
    context.astStack.push(context.astNode(OPCODE.INCLUDE, filename, withLocals, parameters));
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
 * Parse "filter"
 *
 * @param {String} text
 * @param {Array} firstArg
 * @param {Array} link
 * @param {Object} context
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
    var args = splitText(text.slice(i + 1).trim(), [',']).filter(function (item) {
      return (item !== ',');
    });
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
 * Parse "condition"
 *
 * @param {String} body
 * @param {Object} context
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
    return (trans[item] || item);
  });

  // extract the "and" and "or"
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
    if (item.toLowerCase() === 'and' || item.toLowerCase() === 'or') {
      flush();
      blocks.push(item.toLowerCase());
    } else {
      tmp.push(item);
    }
  });
  flush();

  // generate condition AST
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
    var ret = false;
    if (blocks.length < 3) return ret;
    var _condAst = condAst;
    condAst = [];
    for (var i = 0, len = _condAst.length; i < len; i++) {
      var mid = _condAst[i + 1];
      if (typeof(mid) === 'string' && mid.toLowerCase() === op && i + 2 < len) {
        var code = OPCODE[op.toUpperCase()] || OPCODE.DEBUG;
        condAst.push(context.astNode(code, _condAst[i], _condAst[i + 2]));
        i += 2;
        ret = true;
      } else {
        condAst.push(_condAst[i]);
      }
    }
    return ret;
  };
  // and > or
  while (mergeCond('and')) {
    // do nothing
  }
  while (mergeCond('or')) {
    // do nothing
  }
  return condAst[0];
};

/**
 * Parse "when"
 *
 * @param {String} body
 * @param {Object} context
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
 * Parse "variables"
 * 如：  a | call:1,2 | lower
 *
 * @param {String} text
 * @param {Object} context
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
 * Parse "for"
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
    // normal
    var itemName = blocks[0];
    var arrayName = blocks[2];
    var attrs = parseAttrs(blocks.slice(3));
  } else if (blocks.length === 1 ||
             (blocks.length > 1 && blocks[1].toLowerCase() !== 'in' && blocks[1].indexOf(':') === -1)) {
    // non-standard writing: {% for array %}
    var itemName = 'item';
    var arrayName = blocks[0];
    var attrs = parseAttrs(blocks.slice(1));
  }
  if (!(attrs.offset > 0)) attrs.offset = 0;
  if (!(attrs.limit > 0)) attrs.limit = 0;

  return [arrayName, itemName, attrs];
};

/**
 * Parse "{{name}}"
 *
 * @param {String} text
 * @param {Object} context
 * @return {Array}
 */
var parseOutput = function (text, context) {
  var astList = parseVariables(text, context);
  if (Array.isArray(astList)) {
    if (astList[2] === OPCODE.LOCALS) {
      return context.astNode(OPCODE.PRINTLOCALS).concat(astList.slice(3));
    } else {
      return context.astNode(OPCODE.PRINT, astList);
    }
  } else {
    return context.astNode(OPCODE.PRINTSTRING, astList);
  }
};

/**
 * Parse "{%tag%}"
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
    context.astStack.push(context.astNode(OPCODE.UNKNOWN_TAG, name, body));
  }
};
