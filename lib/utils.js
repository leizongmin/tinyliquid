/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var md5 = require('./md5');

/**
 * MD5
 *
 * @param {string} str
 * @return {string}
 */
exports.md5 = md5;

/**
 * 去掉字符串外面的引号
 *
 * @param {string} input
 * @return {string}
 */
exports.stripQuotes = function (input) {
  input = String(input);
  var s = 0;
  var e = input.length;
  var ei = e - 1;
  if (input[0] === '\'' || input[0] === '"') {
    s++;
    e--;
  }
  if (input[ei] === '\'' || input[ei] === '"')
    e--;
  return input.substr(s, e);
};
 
/**
 * 合并多个对象
 *
 * @param {object} obja
 * @param {object} objb
 * @return {object}
 */
exports.merge = function () {
  var ret = {}
  for (var i in arguments) {
    var obj = arguments[i];
    for (var j in obj)
      ret[j] = obj[j];
  }
  return ret;
};

/**
 * 将对象转换为数组
 *
 * @param {object} data
 * @return {array}
 */
exports.toArray = function (data) {
  if (Array.isArray(data))
    return data;
  var ret = [];
  for (var i in data)
    ret.push(data[i]);
  return ret;
};

/**
 * 表格分割
 *
 * @param {object|array} data
 * @param {int} col 列数
 * @param {int} offset 偏移量
 * @param {int} limit 返回数量
 * @return {array}
 */
exports.tableSplit = function (data, col, offset, limit) {
  if (isNaN(col))
    return data;
  if (isNaN(offset))
    offset = 0;
  if (isNaN(limit))
    data = data.slice(offset);
  else
    data = data.slice(offset, offset + limit);
  var len = data.length;
  var ret = [];
  var rowi = 0;
  var di = 0;
  while (di < len) {
    var row = ret[rowi++] = [];
    for (var i = 0; i < col && di < len; i++)
      row.push(data[di++]);
  }
  return ret;
};

/**
 * 取指定范围的数字数组
 *
 * @param {int} s
 * @param {int} e
 * @return {array}
 */
exports.range = function (s, e) {
  s = parseInt(s);
  e = parseInt(e);
  var r = [];
  if (isNaN(s) || isNaN(e))
    return r;
  for (; s <= e; s++)
    r.push(s);
  return r;
};

/**
 * 输出文本
 *
 * @param {string} html
 * @return {string}
 */
exports.escape = function (html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * 输出HTML
 *
 * @param {string} html
 * @return {string}
 */
exports.outputHtml = function (html) {
  return html.replace(/\\/img, '\\')
             .replace(/'/img, '\\\'')
             .replace(/"/img, '\\\"')
             .replace(/\r/img, '\\r')
             .replace(/\n/img, '\\n');
};
var $_html = exports.outputHtml;

/**
 * 出错信息
 *
 * @param {string} msg
 */
exports.errorMessage = function (msg) {
  var html = '<pre style="font-weight:bold; font-size:14px; color:red; padding:4px 20px 4px 20px; border:1px solid #CCC; background-color:#FFF5F0;">' + msg + '</pre>';
  //console.log(html);
  return html;
};
var $_err = exports.errorMessage;

/**
 * 抛出运行时出错信息
 *
 * @param {Error} err
 */
exports.rethrowError = function (err) {
  var msg = 'An error occurred while rendering\n'
          + 'Line: ' + $_line_num + '\n'
          + '    ' + err;
  $_buf+=($_err(msg));
};

/**
 * 包装变量
 *
 * @param {string} n
 * @param {string} locals
 * @param {function} saveFunc
 * @return {string}
 */
exports.localsWrap = function (n, locals, saveFunc) {
  if (!locals)
    locals = 'locals';
  locals += '.';
  n = n.trim();
  // 是否为常量
  if (CONST_VAL.indexOf(n) > -1)
    return n;
  // 是否为字符串
  if (/^['"].*['"]$/.test(n))
    return n;
  // 是否为数值
  if (/^\d[\d\.]*\d?$/.test(n))
    return n;
  // 是否为标识符
  if (/^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(n) && n.substr(-1) !== '.') {
    if (typeof saveFunc === 'function')
      saveFunc(n);
    return locals + n;
  }
  // console.log(n, new Error().stack);
  //转换为字符串索引
  n = n.replace(/\.?(([\w\d\_]*[^\w\d\_\.\[\]]+[\w\d\_]*)|([\d]+[\w].*))\.?/img, function (a) {
    if (/^["']|["']$/img.test(a))
      return a;
    if (a[0] === '.')
      a = a.substr(1);
    if (a.substr(-1) === '.')
      a = a.substr(0, a.length - 1);
    a = a.replace(/"/img, '\\"');
    return '["' + a + '"]';
  });
  n = n.replace(/"\]/img, '"].');
  
  // 变量索引
  var left = n.indexOf('[');
  var right = n.lastIndexOf(']');
  if (left !== -1 && right !== -1) {
    if (typeof saveFunc === 'function') {
      n.split('[').forEach(function (item) {
        var i = item.indexOf(']');
        if (i === -1)
          return;
        var n = item.substr(0, i);
        if (!/^['"].*['"]$/.test(n) && !/^\d[\d\.]*\d?$/.test(n) &&
            /^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(n))
          saveFunc(n);
      });
    }
    n = n.replace(/\.?\[/img, '[' + locals)
         .replace(RegExp((locals + '[\'"\\d]').replace(/\./img, '\\.'), 'img'), function (a) {
           return a.substr(locals.length);
         });
  }
  
  if (n.substr(-1) === '.')
    n = n.substr(0, n.length - 1);
  // console.log('--------', n);
  if (n[0] === '[')
    return locals.substr(0, locals.length - 1) + n;
  else
    return locals + n;
};
// 常量
var CONST_VAL = ['nil', 'null', 'empty', 'blank', 'true', 'false'];

/**
 * 解析函数调用
 *
 * @param {string} js
 * @param {object} options
 * @param {object} context
 * @return {string}
 */
exports.filtered = function (js, options, context) {
  options = options || {}
  if (!options.locals)
    options.locals = 'locals';
  if (!options.filters)
    options.filters = 'filters';
  options.locals += '.';
  options.filters += '.';
  
  if (!context)
    context = {};
  
  var localsWrap = exports.localsWrap;
  
  var isFirst = true;
  var hasFilters = false;
  
  var ret = exports.splitBy(js, '|').reduce(function (js, filter) {
    hasFilters = true;
    var parts = exports.splitBy(filter, ':');
    var name = parts.shift();
    var args = (parts.shift() || '').trim();
    if (isFirst) {
      js = localsWrap(js, null, context.saveLocalsName);
      isFirst = false;
    }
    if (args) {
      var a = exports.splitBy(args, ',');
      for (var i in a)
        a[i] = localsWrap(a[i], null, context.saveLocalsName);
      args = ', ' + a.join(', ');
    }
    return options.filters + name.trim() + '(' + js + args + ')';
  });
  
  if (!hasFilters)
    ret = localsWrap(ret, null, context.saveLocalsName);
  
  return ret;
};

/**
 * 解析条件语句
 *
 * @param {string} cond
 * @param {object} context
 * @return {string}
 */
exports.condition = function (cond, context) {
  if (!context)
    context = {};
  var localsWrap = exports.localsWrap;
  
  var blocks = exports.split(cond);
  // console.log(blocks);
  // 拆分成多个子条件
  var conds = [[]];
  var condi = 0;
  for (var i in blocks) {
    var b = blocks[i];
    switch (b) {
      // 连接元素
      case 'and':
      case 'or':
        condi++;
        conds[condi] = b;
        condi++;
        conds[condi] = [];
        break;
      // 其他元素
      default:
        conds[condi].push(b);
    }
  }
  
  // 生成单个条件的js代码
  var op = ['>', '<', '==', '!=', '>=', '<>', '<=', 'contains', 'hasValue', 'hasKey'];
  var vempty = ['nil', 'null', 'empty', 'blank'];
  var one = function (ca) {
    if (ca.length === 1) {
      return '(' + localsWrap(ca[0], null, context.saveLocalsName) + ')';
    }
    if (ca.length === 3) {
      var op1 = localsWrap(ca[0], null, context.saveLocalsName);
      var op2 = localsWrap(ca[2], null, context.saveLocalsName);
      ca[1] = ca[1].toLowerCase();
      // console.log(ca[1]);
      // contains 语句
      if (ca[1] === 'contains') {
        return '(String(' + op1
             + ').toLowerCase().indexOf(' + op2
             + ') !== -1)';
      }
      // hasValue 语句
      else if (ca[1] === 'hasvaule') {
        return '(Array.isArray(' + op1 + ') ? (' + op1 + '.indexOf(' + op2 + ') !== -1 ? true : false) : '
             + '(function () {  for (var i in ' + op1 + ') if (' + op1 + ' == ' + op2 + ') return true;'
             + '  return false; })())';
      }
      // hasKey 语句
      else if (ca[1] === 'haskey') {
        return '(' + op1 + ' && typeof ' + op1 + '[' + op2 + '] !== \'undefined\')';
      }
      // nil, empty
      else if (vempty.indexOf(ca[2]) > -1) {
        switch (ca[1]) {
          case '!=':
          case '<>':
            return '(' + op1 + ')';
          case '==':
            return '(!' + op1 + ')';
          default:
            return null;
        }
      }
      // 其他
      else if (op.indexOf(ca[1]) > -1) {
        if (ca[1] === '<>')
          ca[1] = '!=';
        return '(' + op1 + ca[1] + op2 + ')';
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  };
  
  var ret = [];
  for (var i in conds) {
    var c = conds[i];
    if (Array.isArray(c)) {
      var s = one(c);
      if (s === null)
        return null;
      else
        ret.push(s);
    }
    else if (c === 'and') {
      ret.push('&&');
    }
    else if (c === 'or') {
      ret.push('||');
    }
  }
  
  if (ret.length > 1)
    return '(' + ret.join(' ') + ')';
  else
    return ret.join(' ');
};

/**
 * 空格分割字符串
 *
 * @param {string} text
 * @return {array}
 */
exports.split = function (text) {
  var isString = false;
  var lastIndex = 0;
  var ret = [];
  var add = function (end) {
    var w = text.slice(lastIndex, end).trim();
    if (w.length > 0)
      ret.push(w);
    lastIndex = end;
  };
  
  for (var i = 0, len = text.length; i < len; i++) {
    var c = text[i];
    // console.log(i, c);
    // 字符串开始或结束
    if ((c === '"' || c === '\'') && text[i - 1] !== '\\') {
      // 结束
      if (isString === c) {
        i++;
        add(i);
        isString = false;
      }
      // 开始
      else if (!isString) {
        add(i);
        isString = c;
      }
    }
    // 非字符串
    else if (!isString) {
      var isOpChar = function (c) {
        return (c === '<' || c === '>' || c === '=' || c === '!');
      };
      // 空格
      if (c === ' ') {
        add(i);
      }
      // 中间的比较运算符 如 a<b
      else if (isOpChar(c)) {
        add(i);
        do {
          i++;
        } while (isOpChar(text[i]));
        add(i);
        i--;
      }
    }
  }
  add(i);
  
  return ret;
};

/**
 * 使用指定字符分割
 *
 * @param {string} text
 * @param {string} sep
 * @return {array}
 */
exports.splitBy = function (text, sep) {
  var arr = text.split(sep);
  var ret = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    var g = arr[i];
    // 合并误分割的字符串内分割符
    var gl = g.trimLeft();
    var gr = g.trimRight();
    if ((gl[0] === '"' || gl[0] === "'") && gl[0] !== gr.substr(-1)) {
      var j = i;
      do {
        j++;
      } while (j < len && arr[j].trimRight().substr(-1) !== gl[0])
      if (j < len) {
        g = arr.slice(i, j + 1).join(sep);
        i = j;
      }
    }
    ret.push(g.trim());
  }
  return ret;
};

/**
 * 解析for循环
 *
 * @param {string} loops
 * @param {object} context
 * @return {string}
 */
exports.forloops = function (loops, context) {
  var blocks = loops.split(/\s+/);
  
  // 如果为for array，自动转化为默认的 for item in array
  if (blocks.length === 1) {
    blocks[1] = 'in';
    blocks[2] = blocks[0];
    blocks[0] = 'item';
  }
  
  var loopIndex = context.loop;
  
  var localsWrap = exports.localsWrap;
  var n = '$_loop_' + loopIndex;        // 索引
  var ni = '$_loop_i_' + loopIndex;     // 数字索引
  var array = localsWrap(blocks[2], null, context.saveLocalsName);    // 数组的名称
  var item = localsWrap(blocks[0], null, context.saveLocalsName);     // 当前元素的名称
  
  // loop item临时名称
  context.loopName[context.loopName.length - 1].itemName = item;
  
  var header = '(function (locals) {\n'
             + 'var ' + ni + ' = 0;\n'
             + 'locals.forloop = {};\n';
  
  // for i in (1..item.quantity)
  var r = /^\((.+)\.\.(.+)\)$/.exec(blocks[2]);
  if (r !== null) {
    array = localsWrap('_range_' + loopIndex, null, context.saveLocalsName);
    header += array + ' = $_range(' + localsWrap(r[1], null, context.saveLocalsName) + ', '
           + localsWrap(r[2], null, context.saveLocalsName) + ');\n';
  }
  
  // 将对象转换为数组
  header += array + ' = $_array(' + array + ');\n';
  
  // 允许增加的标记属性
  var OPTIONS = ['limit', 'offset'];
  var options = {};
  var getOptions = function (block) {
    var b = block.split(':');
    if (b.length !== 2)
      return false;
    var name = b[0].trim();
    var value = localsWrap(b[1], null, context.saveLocalsName);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  };
  
  // 格式化参数 limit: N offset: M  =>  limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (blocks[i].substr(-1) === ':') {
      blocks[i] += blocks[i + 1];
      blocks.splice(i + 1, 1);
    }
  }
  // for item in arrays limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + options.offset + ' + ' + options.limit + ');\n';
  else if (options.limit)
    header += array + ' = ' + array + '.slice(0, ' + options.limit + ');\n';
  else if (options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ');\n';
  
  // 生成基本代码
  var script = header
         + 'locals.forloop.length = ' + array + '.length;\n'
         + 'var forloop = locals.forloop;\n'
         + 'for (var ' + n + ' = 0; ' + n + ' < forloop.length; ' + n + '++) {\n'
         + item + ' = ' + array + '[' + n + '];\n'
         + 'forloop.name = \'' + blocks[0] + '\';\n'
         + 'forloop.index0 = ' + ni + ';\n'
         + 'forloop.index = ++' + ni + ';\n'
         + 'forloop.rindex0 = forloop.length - forloop.index;\n'
         + 'forloop.rindex = forloop.length - forloop.index0;\n'
         + 'forloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'forloop.last = ' + ni + ' === forloop.length ? true : false;\n'
         + '/* for loops body */';
  
  return script;
};

/**
 * 解析tablerowloop循环
 *
 * @param {string} loops
 * @param {object} context
 * @return {string}
 */
exports.tablerow = function (loops, context) {
  var blocks = loops.split(/\s+/);
  
  var loopIndex = context.loop;
  
  if (blocks.length < 2)
    return null;
  
  // 如果为tablerow array，自动转化为默认的 tablerow item in array
  if (blocks.length === 2) {
    blocks[3] = blocks[1];
    blocks[1] = 'in';
    blocks[2] = blocks[0];
    blocks[0] = 'item';
  }
  
  var localsWrap = exports.localsWrap;
  var n = '$_loop_' + loopIndex;        // 索引
  var ni = '$_loop_i_' + loopIndex;     // 数字索引
  var array = localsWrap(blocks[2], null, context.saveLocalsName);    // 数组的名称
  var item = localsWrap(blocks[0], null, context.saveLocalsName);     // 当前元素的名称
  
  // loop item临时名称
  context.loopName[context.loopName.length - 1].itemName = item;
  
  var header = '(function (locals) {\n'
             + 'var ' + ni + ' = 0;\n'
             + 'locals.tablerowloop = {};\n';
  
  // tablerow i in (1..item.quantity)
  var r = /^\((.+)\.\.(.+)\)$/.exec(blocks[2]);
  if (r !== null) {
    array = localsWrap('_range_' + loopIndex, null, context.saveLocalsName);
    header += array + ' = $_range(' + localsWrap(r[1], null, context.saveLocalsName) + ', '
           + localsWrap(r[2], null, context.saveLocalsName) + ');\n';
  }
  
  // 将对象转换为数组
  header += array + ' = $_array(' + array + ');\n';
  
  // 允许增加的标记属性
  var OPTIONS = ['cols', 'limit', 'offset'];
  var options = {};
  var getOptions = function (block) {
    var b = block.split(':');
    if (b.length !== 2)
      return false;
    var name = b[0].trim();
    var value = localsWrap(b[1], null, context.saveLocalsName);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  };
  
  // 格式化参数 limit: N offset: M  =>  limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (blocks[i].substr(-1) === ':') {
      blocks[i] += blocks[i + 1];
      blocks.splice(i + 1, 1);
    }
  }
  // tablerow item in arrays cols:3 limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + options.offset + ' + ' + options.limit + ');\n';
  else if (options.limit)
    header += array + ' = ' + array + '.slice(0, ' + options.limit + ');\n';
  else if (options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ');\n';
  
  // 生成基本代码
  var script = header
         + 'locals.tablerowloop.length = ' + array + '.length;\n'
         + 'var tablerowloop = locals.tablerowloop;\n'
         + 'var ' + n + '_row = 0;\n'
         + 'for (var ' + n + ' = 0; ' + n + ' < tablerowloop.length; ) {\n'
         + n + '_row++;\n'
         + '$_buf += \'<tr class=\"row\' + (' + n + '_row) + \'\">\\n\';'
         + 'for (tablerowloop.col0 = 0; tablerowloop.col0 < ' + options.cols + ' && ' + n + ' < tablerowloop.length; tablerowloop.col0++, ' + n + '++) {\n'
         + item + ' = ' + array + '[' + n + '];\n'
         + 'tablerowloop.name = \'' + blocks[0] + '\';\n'
         + 'tablerowloop.col = tablerowloop.col0 + 1;\n'
         + 'tablerowloop.col_first = tablerowloop.col === 1 ? true : false;\n'
         + 'tablerowloop.col_last = tablerowloop.col === ' + options.cols + ' ? true : false;\n'
         + 'tablerowloop.index0 = ' + ni + ';\n'
         + 'tablerowloop.index = ++' + ni + ';\n'
         + 'tablerowloop.rindex0 = tablerowloop.length - tablerowloop.index;\n'
         + 'tablerowloop.rindex = tablerowloop.length - tablerowloop.index0;\n'
         + 'tablerowloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'tablerowloop.last = ' + ni + ' === tablerowloop.length ? true : false;\n'
         + 'if (tablerowloop.last === true) tablerowloop.col_last = true;\n'
         + '$_buf += \'<td class=\"col\' + tablerowloop.col + \'\">\';'
         + '/* tablerow loops body */';
  
  return script;
};

/**
 * 解析assign
 *
 * @param {string} expression
 * @param {object} context
 * @return {string}
 */
exports.assign = function (expression, context) {
  // console.log(expression, context);
  // 如果为 [], array() 则创建一个数组
  if (expression === '[]' || expression === 'array()')
    var ret = '[]';
  // 如果为 {}, object(), {"a":"xxx"} 则创建相应的对象
  else if (expression === 'object()')
    var ret = '{}';
  else if (/^\{.*\}$/img.test(expression))
    var ret = 'JSON.parse(\'' + expression + '\')';
  else
    var ret = exports.filtered(expression, null, context);
  // console.log(expression, ret);
  // 替换用assign定义的名称为global
  // console.log(expression, context.assignNames);
  for (var i in context.assignNames) {
    // 忽略loop中的名称名称（即优先使用loop内定义的名称）
    if (context.loopName.length > 0) {
      if (i === context.loopName[context.loopName.length - 1].itemName ||
          i.substr(0, 8) === 'forloop.' || i.substr(0, 13) === 'tablerowloop.')
        continue;
    }
    
    ret = ret.replace(RegExp(i, 'img'), 'global.' + i);
  }
  // console.log(ret);
  return ret;
};

/**
 * 解析cycle
 *
 * @param {string} strlist
 * @param {object} context
 * @return {string}
 */
exports.cycle = function (strlist, context) {
  var localsWrap = exports.localsWrap;
  
  var list = strlist.split(/\s*,\s*/);
  for (var i in list) {
    list[i] = localsWrap(list[i], null, context.saveLocalsName);
  }
  
  var cycleKey = md5(list.join(',')).substr(0, 8);
  context.addCycle(cycleKey, list);
  
  var cycleName = '$_cycle_' + cycleKey;
  var script = '$_buf+=(' + cycleName + '.items[' + cycleName + '.i])\n'
             + '$_cycle_next(' + cycleName + ');\n';
  return script;
};


/**
 * 异步获取数据对象
 *
 * @param {object} models
 * @param {array} names
 * @param {object} env
 */
var AsyncDataList = function (models, names, env) {
  if (!(this instanceof AsyncDataList))
    return new AsyncDataList(models, names, env);
  this.models = models || {};
  this.names = names || {};
  this.env = env || {};
  this.data = {};
};
exports.AsyncDataList = AsyncDataList;

/**
 * 获取一个数据
 *
 * @param {string} name
 * @param {function} callback
 */
AsyncDataList.prototype.getItem = function (name, callback) {
  var self = this;
  var data = self.data;
  var models = self.models;
  try {
    
    var model = models[name];
    if (typeof model === 'undefined') {
      // 智能分析，比如需要 a.b.c 如果该项没注册，会自动递归查找其父项 a.b 和 a
      var ns = name.split('.');
      while (ns.pop() && ns.length > 0) {
        name = ns.join('.');
        model = models[name];
        if (typeof model !== 'undefined')
          break;
      }
    }
    
    // 如果为function，则调用其以取得数据
    var modelType = typeof model;
    if (modelType === 'function') {
      return model(self.env, function (err, d) {
        if (err)
          return callback(err);
        self.saveItem(name, d);
        return callback(null);
      });
    }
    else if (modelType !== 'undefined') {
      self.saveItem(name, model);
      return callback(null);
    }
    
    return callback(null);
  }
  catch (err) {
    callback(err);
    return false;
  }
};

/**
 * 保存一个数据
 *
 * @param {string} name
 * @param {object} value
 */
AsyncDataList.prototype.saveItem = function (name, value) {
  var data = this.data;
  var ns = name.split('.');
  var oldns = [];
  var key = ns.pop();
  var getFather = function (node, ns, oldns) {
    if (ns.length < 1)
      return node;
    var key = ns.shift();
    if (!node[key])
      node[key] = {};
    oldns.push(key);
    if (typeof node[key] !== 'object')
      throw Error('Cannot set childs because "' + oldns.join('.') + '" is not an object');
    return getFather(node[key], ns, oldns);
  };
  var node = getFather(data, ns, oldns);
  node[key] = value;
  
  return data;
};

/**
 * 队列式读取数据
 *
 * @param {function} callback  function (err, data)
 */
AsyncDataList.prototype.start = function (callback) {
  var models = this.models;
  var names = this.names;
  var data = this.data;
  var self = this;
  
  try {
    var next = function (err) {
      if (err)
        return callback(err);
      if (names.length < 1)
        return callback(null, data);
      var name = names.shift();
      self.getItem(name, next);
    };
    next();
  }
  catch (err) {
    return callback(err);
  }
};

/**
 * 并行式读取数据
 *
 * @param {function} callback  function (err, data)
 */
AsyncDataList.prototype.startParallel = function (callback) {
  var models = this.models;
  var names = this.names;
  var data = this.data;
  var self = this;
  
  var isReturn = false;
  
  var getItem = function (name, names) {
    self.getItem(name, function (err) {
      if (err && !isReturn) {
        isReturn = true;
        return callback(err);
      }
      var i = names.indexOf(name);
      names.splice(i, 1);
      if (names.length < 1 && !isReturn) {
        isReturn = true;
        return callback(null, data);
      }
    });
  };
  
  try {
    for (var i in names) {
      getItem(names[i], names);
    }
  }
  catch (err) {
    return callback(err);
  }
};
