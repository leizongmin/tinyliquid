/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

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
}
 
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
}

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
}

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
}

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
}

/**
 * 输出文本
 *
 * @param {string} html
 * @return {string}
 */
exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
}
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
}
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
  $_buf.push($_err(msg));
}

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
  // 其他，自动转换为字符串
  else
    return '"' + n.replace(/"/ig, '\\"') + '"';
}
// 常量
var CONST_VAL = ['nil', 'null', 'empty', 'blank', 'true', 'false'];

/**
 * 解析筛选器
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
  
  var ret = js.split('|').reduce(function (js, filter) {
    hasFilters = true;
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.shift() || '';
    if (isFirst) {
      js = localsWrap(js, null, context.saveLocalsName);
      isFirst = false;
    }
    if (args) {
      var a = args.split(',');
      for (var i in a)
        a[i] = localsWrap(a[i], null, context.saveLocalsName);
      args = ', ' + a.join(', ');
    }
    return options.filters + name + '(' + js + args + ')';
  });
  
  if (!hasFilters)
    ret = localsWrap(ret, null, context.saveLocalsName);
  
  return ret;
}

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
  var op = ['>', '<', '==', '!=', '>=', '<>', '<=', 'contains'];
  var vempty = ['nil', 'null', 'empty', 'blank'];
  var one = function (ca) {
    if (ca.length === 1) {
      return '(' + localsWrap(ca[0], null, context.saveLocalsName) + ')';
    }
    if (ca.length === 3) {
      // contains 语句
      if (ca[1] === 'contains') {
        return '(String(' + localsWrap(ca[0], null, context.saveLocalsName)
             + ').toLowerCase().indexOf(' + localsWrap(ca[2], null, context.saveLocalsName)
             + ') !== -1)';
      }
      // nil, empty
      if (vempty.indexOf(ca[2]) > -1) {
        switch (ca[1]) {
          case '!=':
          case '<>':
            return '(' + localsWrap(ca[0], null, context.saveLocalsName) + ')';
          case '==':
            return '(!' + localsWrap(ca[0], null, context.saveLocalsName) + ')';
          default:
            return null;
        }
      }
      // 其他
      else if (op.indexOf(ca[1]) > -1) {
        if (ca[1] === '<>')
          ca[1] = '!=';
        return '(' + localsWrap(ca[0], null, context.saveLocalsName)
             + ca[1] + localsWrap(ca[2], null, context.saveLocalsName) + ')';
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  }
  
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
}

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
  }
  
  for (var i = 0, len = text.length; i < len; i++) {
    var c = text[i];
    // 字符串开始或结束
    if ((c === '"' || c === '\'') && text[i - 1] !== '\\') {
      // 结束
      if (isString === c) {
        i++;
        add(i);
        lastIndex = i;
        isString = false;
      }
      // 开始
      else if (!isString) {
        add(i);
        lastIndex = i;
        isString = c;
      }
    }
    // 字符串外的空格
    if (!isString && c === ' ') {
      add(i);
      lastIndex = i;
    }
  }
  add(i);
  
  return ret;
}

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
    if (b.length !== 2 || isNaN(b[1]))
      return false;
    var name = b[0].trim();
    var value = parseInt(b[1]);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  }
  
  // for item in arrays limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + (options.offset + options.limit) + ');\n';
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
         + 'forloop.index0 = ' + ni + ';\n'
         + 'forloop.index = ++' + ni + ';\n'
         + 'forloop.rindex = forloop.length - forloop.index;\n'
         + 'forloop.rindex0 = forloop.rindex;\n'
         + 'forloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'forloop.last = ' + ni + ' === forloop.length ? true : false;\n'
         + '/* for loops body */';
  
  return script;
}

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
    if (b.length !== 2 || isNaN(b[1]))
      return false;
    var name = b[0].trim();
    var value = parseInt(b[1]);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  }
  
  // tablerow item in arrays cols:3 limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (!(options.cols > 0))
    return null;
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + (options.offset + options.limit) + ');\n';
  else if (options.limit)
    header += array + ' = ' + array + '.slice(0, ' + options.limit + ');\n';
  else if (options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ');\n';
  
  // 生成基本代码
  var script = header
         + 'locals.tablerowloop.length = ' + array + '.length;\n'
         + 'var tablerowloop = locals.tablerowloop;\n'
         + 'for (var ' + n + ' = 0; ' + n + ' < tablerowloop.length; ) {\n'
         + 'for (tablerowloop.col0 = 0; tablerowloop.col0 < ' + options.cols + ' && ' + n + ' < tablerowloop.length; tablerowloop.col0++, ' + n + '++) {\n'
         + item + ' = ' + array + '[' + n + '];\n'
         + 'tablerowloop.col = tablerowloop.col0 + 1;\n'
         + 'tablerowloop.col_first = tablerowloop.col === 1 ? true : false;\n'
         + 'tablerowloop.col_last = tablerowloop.col === ' + options.cols + ' ? true : false;\n'
         + 'tablerowloop.index0 = ' + ni + ';\n'
         + 'tablerowloop.index = ++' + ni + ';\n'
         + 'tablerowloop.rindex = tablerowloop.length - tablerowloop.index;\n'
         + 'tablerowloop.rindex0 = tablerowloop.rindex;\n'
         + 'tablerowloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'tablerowloop.last = ' + ni + ' === tablerowloop.length ? true : false;\n'
         + 'if (tablerowloop.last === true) tablerowloop.col_last = true;\n'
         + '/* tablerow loops body */';
  
  return script;
}
