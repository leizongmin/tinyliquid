/**
 * TinyLiquid模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var TinyLiquid = (function (exports) {

  var modules = {};
  
  /*--------------- ./lib/utils.js ----------------*/
  modules.utils = (function (exports) {
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
  
  var inGlobalLocals = function () { return null; };
  
  var ret = js.split('|').reduce(function (js, filter) {
    hasFilters = true;
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.shift() || '';
    if (isFirst) {
      js = localsWrap(js, inGlobalLocals(js), context.saveLocalsName);
      isFirst = false;
    }
    if (args) {
      var a = args.split(',');
      for (var i in a)
        a[i] = localsWrap(a[i], inGlobalLocals(a[i]), context.saveLocalsName);
      args = ', ' + a.join(', ');
    }
    return options.filters + name + '(' + js + args + ')';
  });
  
  if (!hasFilters)
    ret = localsWrap(ret, inGlobalLocals(ret), context.saveLocalsName);
  
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

/**
 * 解析assign
 *
 * @param {string} expression
 * @param {object} context
 * @return {string}
 */
exports.assign = function (expression, context) {
  // console.log(expression, context);
  var ret = exports.filtered(expression, null, context);
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
}


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
}
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
}

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
  }
  var node = getFather(data, ns, oldns);
  node[key] = value;
  
  return data;
}

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
    }
    next();
  }
  catch (err) {
    return callback(err);
  }
}

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
  }
  
  try {
    for (var i in names) {
      getItem(names[i], names);
    }
  }
  catch (err) {
    return callback(err);
  }
}

    return exports;
  })({});
  /*-----------------------------------------------*/
  
  /*-------------- ./lib/filters.js ---------------*/
  modules.filters = (function (exports) {
    /**
 * 过滤器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

/*---------------------------- HTML Filters ----------------------------------*/
/**
 * 创建一个img标签
 *
 * @param {string} url
 * @param {string} alt
 * @return {string}
 */
exports.img_tag = function (url, alt) {
  if (!alt)
    alt = '';
  return '<img src="' + url + '" alt="' + alt + '">';
}

/**
 * 创建一个script标签
 *
 * @param {string} url
 * @return {string} 
 */
exports.script_tag = function (url) {
  return '<script src="' + url + '"></script>';
}

/**
 * 创建一个样式表link标签
 *
 * @param {string} url
 * @param {string} media
 * @return {string}
 */
exports.stylesheet_tag = function (url, media) {
  if (!media)
    media = 'all';
  return '<link href="' + url + '" rel="stylesheet" type="text/css" media="' + media + '" />';
}

/**
 * A链接标签
 *
 * @param {string} link
 * @param {string} url
 * @param {string} title
 * @return {string}
 */
exports.link_to = function (link, url, title) {
  if (!title)
    title = '';
  return '<a href="' + url + '" title="' + title + '">' + link + '</a>';
}

/*-----------------------------Math Filters-----------------------------------*/
/**
 * 相加
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.plus = function (input, operand) {
  return Number(input) + Number(operand);
}

/**
 * 相减
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.minus = function (input, operand) {
  return Number(input) - Number(operand);
}

/**
 * 相乘
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.times = function (input, operand) {
  return Number(input) * Number(operand);
}

/**
 * 相除
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.divided_by = function (input, operand) {
  return Number(input) / Number(operand);
}

/*---------------------------Manipulation Filters-----------------------------*/
/**
 * 在后面拼接字符串
 *
 * @param {string} input
 * @param {string} characters
 * @return {string}
 */
exports.append = function (input, characters) {
  return String(input) + String(characters);
}

/**
 * 在前面拼接字符串
 *
 * @param {string} input
 * @param {string} characters
 * @return {string}
 */
exports.prepend = function (input, characters) {
  return String(characters) + String(input);
}

/**
 * 将字符串转化为驼峰命名方式
 *
 * @param {string} input
 * @return {string}
 */
exports.camelize = function (input) {
  var ret = String(input).split(/[^a-zA-Z0-9]/).map(function (a) {
    return a[0].toUpperCase() + a.substr(1);
  }).join('');
  return ret[0].toLowerCase() + ret.substr(1);
}

/**
 * 字符串首字母大写
 *
 * @param {string} input
 * @return {string}
 */
exports.capitalize = function (input) {
  input = String(input);
  return input[0].toUpperCase() + input.substr(1);
}

/**
 * 格式化日期字符串
 *
 * @param {string} input
 * @param {string} format
 * @return {string}
 */
exports.date = function (input, format) {
  var time;
  if (String(input).toLowerCase() == 'now')
    time = new Date();
  else
    time = new Date(input);
  var dates = time.toDateString().split(/\s/);      // ["Wed", "Apr", "11", "2012"]
  var dateS = time.toLocaleDateString().split(/\s/);// ["Wednesday,", "April", "11,", "2012"]
  var times = time.toTimeString().split(/[\s:\+]/); // ["10", "37", "44", "GMT", "0800", "(中国标准时间)"]
  var replace = {
    a:      dates[0], // 星期
    A:      dateS[0],
    b:      dates[1], // 月份
    B:      dateS[1],
    c:      time.toLocaleString(),
    d:      dates[2],
    H:      times[0],       // 24小时制
    I:      times[0] % 12,  // 12小时制
    j:      dates[2], // 日
    m:      time.getMonth() + 1,  // 月份
    M:      times[1], // 分钟
    p:      Number(times[0]) < 12 ? 'AM' : 'PM',  // 上午/下午
    S:      times[2],
    U:      weekNo(time),         // 当年的第几周，星期日开始
    W:      weekNo(time, true),   // 星期一开始
    w:      time.getDay(),  // 星期几(0-6)
    x:      time.toDateString(),
    X:      time.toTimeString(),
    y:      dates[3].substr(-2),  // 年份
    Y:      dates[3],
    Z:      times[4],   // 时区
  };
  var ret = String(format);
  for (var i in replace) {
    ret = ret.replace(RegExp('%' + i, 'mg'), replace[i]);
  }
  return ret;
}

function weekNo (now, mondayFirst) {
  var totalDays = 0;
  var years = now.getFullYear();
  var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (years % 100 === 0) {
    if (years % 400 === 0)
      days[1] = 29;
  }
  else if (years % 4 === 0)
    days[1] = 29;
  
  if (now.getMonth() === 0) {
    totalDays = totalDays + now.getDate();
  }
  else {
    var curMonth = now.getMonth();
    for (var count = 1; count <= curMonth; count++)
      totalDays = totalDays + days[count - 1];
    totalDays = totalDays + now.getDate();
  }
  // 默认是以星期日开始的
  var week = Math.round(totalDays / 7);
  if (mondayFirst && new Date(String(years)).getDay() === 0)
    week += 1;
  return week;
}

/**
 * 将字符串转换为小写
 *
 * @param {string} input
 * @return {string}
 */
exports.downcase = function (input) {
  return String(input).toLowerCase();
}

/**
 * 将字符串转换为大写
 *
 * @param {string} input
 * @return {string}
 */
exports.upcase = function (input) {
  return String(input).toUpperCase();
}

/**
 * 字符串转义（HTML）
 *
 * @param {string} input
 * @return {string}
 */
exports.escape = function (input) {
  return String(input)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFirstKey (obj) {
  if (Array.isArray(obj)) {
    return 0;
  }
  else {
    var keys = Object.keys(obj);
    return keys[0] || '';
  }
}

function getLastKey (obj) {
  if (Array.isArray(obj)) {
    return obj.length - 1;
  }
  else {
    var keys = Object.keys(obj);
    return keys.pop() || '';
  }
}

/**
 * 取第一个元素
 *
 * @param {array} array
 * @return {object}
 */
exports.first = function (array) {
  return array[getFirstKey(array)];
}

/**
 * 取最后一个元素
 *
 * @param {array} array
 * @return {object}
 */
exports.last = function (array) {
  return array[getLastKey(array)];
}

/**
 * 转化为handle字符串
 *
 * @param {string} input
 * @return {string}
 */
exports.handleize = function (input) {
  return String(input)
              .replace(/[^0-9a-zA-Z ]/g, '')
              .replace(/[ ]+/g, '-')
              .toLowerCase();
}

/**
 * 将数组以指定的字符串拼接起来
 *
 * @param {array} input
 * @param {string} segmenter
 * @return {string}
 */
exports.join = function (input, segmenter) {
  if (!segmenter)
    segmenter = ' ';
  if (Array.isArray(input))
    return input.join(segmenter);
  else
    return '';
}

/**
 * 替换第一次出现的字符串
 *
 * @param {string} input
 * @param {string} substring
 * @param {string} replacement
 * @return {string}
 */
exports.replace_first = function (input, substring, replacement) {
  return String(input).replace(substring, replacement);
}

/**
 * 删除指定字符串
 *
 * @param {string} input
 * @param {string} substring
 * @return {string}
 */
exports.remove = function (input, substring) {
  input = String(input);
  while (input.indexOf(substring) > -1)
    input = input.replace(substring, '');
  return input;
}

/**
 * 删除第一次出现的指定字符串
 *
 * @param {string} input
 * @param {string} substring
 * @return {string}
 */
exports.remove = function (input, substring) {
  return String(input).replace(substring, '');
}

/**
 * 将\n转换为<br>
 *
 * @param {string} input
 * @return {string}
 */
exports.newline_to_br = function (input) {
  return String(input).replace(/\n/img, '<br>');
}

/**
 * 如果输入的数等于1则输出第2个参数，否则输出第3个参数
 *
 * @param {int} input
 * @param {string} singular
 * @param {string} plural
 * @return {string}
 */
exports.pluralize = function (input, singular, plural) {
  return Number(input) > 1 ? plural : singular;
}

/**
 * 返回数组或字符串的长度
 *
 * @param {array|string} input
 * @return {string}
 */
exports.size = function (input) {
  return input.length;
}

/**
 * 分割字符串
 *
 * @param {string} input
 * @param {string} delimiter
 * @return {string}
 */
exports.split = function (input, delimiter) {
  return String(input).split(delimiter);
}

/**
 * 去除HTML标签
 *
 * @param {string} text
 * @return {string}
 */
exports.strip_html = function (text) {
  return String(text).replace(/<[^>]*>/img, '');
}

/**
 * 去除换行符
 *
 * @param {string} input
 * @return {string}
 */
exports.strip_newlines = function (input) {
  return String(input).replace(/\n/img, '');
}

/**
 * 截断字符串
 *
 * @param {string} input
 * @param {int} characters
 * @return {string}
 */
exports.truncate = function (input, characters) {
  if (isNaN(characters))
    characters = 100;
  return String(input).substr(0, characters);
}

/**
 * 取字符串的前N个单词
 *
 * @param {string} input
 * @param {int} n
 * @return {string}
 */
exports.truncatewords = function (input, words) {
  if (isNaN(words))
    words = 15;
  return String(input).split(/ +/).slice(0, words).join(' ');
}

/**
 * 转换为json字符串
 *
 * @param {object} input
 * @return {string}
 */
exports.json = function (input) {
  return JSON.stringify(input);
}

/**
 * 取指定属性值
 *
 * @param {object} obj
 * @param {string} prop
 * @return {object}
 */
exports.get = function(obj, prop){
  return obj[prop];
}

/**
 * 反转字符串或数组
 *
 * @param {string|array} obj
 * @return {string|array}
 */
exports.reverse = function (obj) {
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
}

/**
 * 取数组的指定列的数据
 *
 * @param {array} arr
 * @param {string} prop
 * @return {array}
 */
exports.map = function (arr, prop) {
  return arr.map(function(obj){
    return obj[prop];
  });
}

/**
 * 按照数组元素的指定属性排序
 *
 * @param {array} obj
 * @param {string} prop
 * @return {array}
 */
exports.sort_by = function (obj, prop) {
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
}

/**
 * 根据数量生成导航页码
 *
 * @param {int} count 总数
 * @param {int} size 每页显示数量
 * @param {int} page 当前页码
 * @listurn {array}
 */
exports.pagination = function (count, size, page) {
  if (count % size === 0)
    var maxPage = parseInt(count / size);
  else
    var maxPage = parseInt(count / size) + 1;
    
  if (isNaN(page) || page < 1)
    page = 1;
  page = parseInt(page);
    
  var list = [page - 2, page - 1, page, page + 1, page + 2];
  for (var i = 0; i < list.length;) {
    if (list[i] < 1 || list[i] > maxPage)
      list.splice(i, 1);
    else
      i++;
  }
  if (list[0] !== 1) {
    list.unshift('...');
    list.unshift(1);
  }
  if (list[list.length - 1] < maxPage) {
    list.push('...');
    list.push(maxPage);
  }
  
  ret = {
    current:    page,
    next:       page + 1,
    previous:   page - 1,
    list:       list
  }
  if (ret.next > maxPage)
    ret.next = maxPage;
  if (ret.previous < 1)
    ret.previous = 1;
  
  return ret;
}
    return exports;
  })({});
  /*-----------------------------------------------*/
  
  /*--------------- ./lib/parser.js ---------------*/
  modules.parser = (function (exports) {
    /**
 * 代码分析器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var utils = modules.utils;
var template = modules.template;


exports.output = function (text, start, context) {
  if (context.isRaw)
    return null;
  
  // 查找结束标记
  var end = text.indexOf('}}', start);
  if (end === -1)
    return null;
  
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
  
  var line = text.slice(start + 2, end).trim();
  end += 2;
  
  // 支持筛选器
  var script = '$_buf.push(' + utils.filtered(line, null, context) + ');';
  
  return {start: start, end: end, script: script};
}

 
exports.tags = function (text, start, context) {
  // 查找结束标记
  var end = text.indexOf('%}', start);
  if (end === -1)
    return null;
  
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
  
  var line = text.slice(start + 2, end).trim();
  end += 2;
  // console.log('Line: ' + line);
  
  // 解析语句
  var space_start = line.indexOf(' ');
  var script = '';
  
  // 设置行号，以便检查运行时错误
  var setLineNumber = function () {
    if (script.substr(-1) === '\n')
      script += '$_line_num = ' + context.line_num + ';\n';
    else
      script += '\n$_line_num = ' + context.line_num + ';\n';
  }
  
  // 当前在raw标记内，则只有遇到 enddraw 标记时才能终止
  if (context.isRaw) {
    if (line === 'endraw') {
      context.isRaw = false;
      setLineNumber();
      script += '/* endraw */';
      return {start: start, end: end, script: script};
    }
    else {
      return null;
    }
  }
  
  // 嵌套开始
  var enterLoop = function (name) {
    context.loop++;
    context.loopName.push({
      name:     name,
      start:    start,
      end:      end,
      line:     line,
      line_num: context.line_num
    });
  }
  
  // 退出嵌套
  var outLoop = function () {
    context.loop--;
    context.loopName.pop();
  }
  
  // 嵌套结束标记不匹配
  var loopNotMatch = function () {
    context.error = {
      message:    'Unexpected token: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  }
  
  // 意外的标记
  var syntaxError = function () {
    context.error = {
      message:    'SyntaxError: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  }
  
  // 无法识别的标记
  var unknowTag = function () {
    context.error = {
      message:    'UnknowTag: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  }
  
  // 当前嵌套名称
  if (context.loopName.length > 0)
    var loopName = context.loopName[context.loopName.length - 1].name;
  else
    var loopName = '';
  
  // 简单标记(一般为标记结尾)
  if (space_start === -1) {
    switch (line) {
      // raw 标记
      case 'raw':
        context.isRaw = true;
        setLineNumber();
        script += '/* raw */';
        break;
      // endif
      case 'endif':
        if (loopName !== 'if')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // endunless
      case 'endunless':
        if (loopName !== 'unless')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // else
      case 'else':
        if (loopName === 'if' || loopName === 'unless') {
          setLineNumber();
          script += '} else {';
          setLineNumber();
        }
        else if (loopName === 'case') {
          setLineNumber();
          script += 'break;\n' +
                    'default:';
          setLineNumber();
        }
        else
          loopNotMatch();
        break;
      // endcase
      case 'endcase':
        if (loopName !== 'case')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // endfor
      case 'endfor':
        if (loopName !== 'for')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}\n'
                  + '})($_merge(locals));';
          outLoop();
        }
        break;
      // endtablerow
      case 'endtablerow':
        if (loopName !== 'tablerow')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}\n'
                  + '}\n'
                  + '})($_merge(locals));';
          outLoop();
        }
        break;
      // endcapture
      case 'endcapture':
        if (loopName !== 'capture')
          loopNotMatch();
        else {
          setLineNumber();
          script += '} catch (err) {\n'
                  + '  $_rethrow(err);\n'
                  + '}\n'
                  + 'return $_buf.join(\'\');\n'
                  + '})([]);';
          outLoop();
        }
        break;
      // 出错
      default:
        unknowTag();
    }
  }
  // 复杂标记(一般为标记开头)
  else {
    var line_left = line.substr(0, space_start);
    var line_right = line.substr(space_start).trim();
    switch (line_left) {
      // if / unless 判断
      case 'if':
        enterLoop(line_left);
        setLineNumber();
        script += 'if ' + utils.condition(line_right, context) + ' {';
        break;
      case 'unless':
        enterLoop(line_left);
        setLineNumber();
        script += 'if (!' + utils.condition(line_right, context) + ') {';
        break;
      // case 判断
      case 'case':
        enterLoop(line_left);
        setLineNumber();
        script += 'switch (' + utils.localsWrap(line_right, null, context.saveLocalsName) + ') {';
        break;
      case 'when':
        if (context.hasWhen)
          script += 'break;\n';
        if (loopName !== 'case')
          loopNotMatch();
        else {
          script += 'case ' + utils.localsWrap(line_right, null, context.saveLocalsName) + ':';
          setLineNumber();
          context.hasWhen = true;
        }
        break;  
      // for 循环
      case 'for':
        enterLoop(line_left);
        var s = utils.forloops(line_right, context);
        if (s === null)
          syntaxError();
        else {
          setLineNumber();
          script += s;
        }
        break;
      // tablerow 循环
      case 'tablerow':
        enterLoop(line_left);
        var s = utils.tablerow(line_right, context);
        if (s === null)
          syntaxError();
        else {
          setLineNumber();
          script += s;
        }
        break;
      // assign 定义变量
      case 'assign':
        var eq_op = line_right.indexOf('=');
        if (eq_op === -1) {
          syntaxError();
        }
        else {
          var assign_name = utils.localsWrap(line_right.substr(0, eq_op).trim(), null, context.saveLocalsName);
          context.assignNames[assign_name] = true;
          var assign_expr = utils.assign(line_right.substr(eq_op + 1).trim(), context);
          setLineNumber();
          script += 'global.' + assign_name + ' = ' + assign_expr + ';';
        }
        break;
      // capture 定义变量块
      case 'capture':
        enterLoop(line_left);
        var n = utils.localsWrap(line_right, null, context.saveLocalsName);
        setLineNumber();
        script += 'global.' + n + ' = ' + n + ' = (function ($_buf) {\n'
                + 'try {\n'
                + '/* captures */\n';
        break;
      // include 标记
      case 'include':
        var inc_blocks = utils.split(line_right);
        var inc_tag = {};
        var inc_ok = false;
        if (inc_blocks.length === 1) {
          inc_tag.name = utils.stripQuotes(inc_blocks[0]);
          inc_ok = true;
        }
        else if (inc_blocks.length === 3) {
          inc_tag.name = utils.stripQuotes(inc_blocks[0]);
          inc_tag.with = utils.stripQuotes(inc_blocks[2]);
          inc_ok = true;
        }
        else {
          syntaxError();
        }
        if (inc_ok) {
          // 添加到依赖的资源文件
          context.addIncludes(inc_tag.name);
          // 如果提供了该资源文件，则插入代码
          if (context.files[inc_tag.name]) {
            setLineNumber();
            script += '/* === include "' + inc_tag.name + '"' + (inc_tag.with ? ' with "' + inc_tag.with + '"' : '') + ' === */\n'
                    + 'try {\n'
                    + '$_buf.push((function (locals) {\n'
                    + context.files[inc_tag.name] + '\n'
                    + 'return $_buf.join(\'\');\n'
                    + '})(' + (inc_tag.with ? utils.localsWrap(inc_tag.with) : 'locals') + '));\n'
                    + '} catch (err) {\n'
                    + '  $_rethrow(err);\n'
                    + '}\n'
                    + '/* === end include "' + inc_tag.name + '" === */';
          }
        }
        break;
      // 其他
      default:
        unknowTag();
    }
  }
  
  return {start: start, end: end, script: script}
}
    return exports;
  })({});
  /*-----------------------------------------------*/
  
  /*-------------- ./lib/template.js --------------*/
  modules.template = (function (exports) {
    /**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */


var parser = modules.parser;
var utils = modules.utils;
var filters = modules.filters;



/**
 * 编译代码(仅解析模板)
 *
 * @param {string} text
 * @param {object} options  files:子模版文件代码,用parse编译
 * @return {object}
 */
exports.parse = function (text, options) {
  options = options || {};
  
  var line_number = 1; // 行号
  var html_start = 0;  // HTML代码开始
  var scripts = [];    // 编译后的代码
  var context = {}     // 编译时传递的环境变量
  
  scripts.add = function (s) {
    scripts.push(s);
  }
  
  // 初始化编译环境
  context.loop = 0;           // { 嵌套层数
  context.loopName = [];      // 当前嵌套标记名称
  context.isRaw = false;      // 是否为raw标记
  context.assignNames = {};   // 使用assign标记定义的变量名称
  context.varNames = {};      // 变量的名称及引用的次数
  context.saveLocalsName = function (name) {  // 使用变量名称
    // 忽略tablerowloop和forloop
    if (name.substr(0, 13) === 'tablerowloop.' || name.substr(0, 8) === 'forloop.')
      return;
    if (!context.varNames[name])
      context.varNames[name] = 1;
    else
      context.varNames[name]++;
  };
  context.includes = {};                  // 包含的子模版
  context.files = options.files || {};    // 提供的资源文件
  context.addIncludes = function (name) { // 包含子模版
    if (!context.includes[name])
      context.includes[name] = 1;
    else
      context.includes[name]++;
  }
  
  // 捕捉严重的错误
  var catchError = function (data) {
    if (!context.error && data) {
      context.error = {
        start:      data.start,
        end:        data.end,
        line:       data.line,
        message:    'SyntaxError: Unexpected end of input'
      }
    }
    
    // 生成出错信息描述
    var html_top = utils.outputHtml(text.slice(0, context.error.start));
    var html_bottom = utils.outputHtml(text.slice(context.error.end));
    var html_error = 'Line:' + line_number + '\n'
                   + '    ' + context.error.line + '\n\n'
                   + context.error.message + '\n';
    // 嵌套栈
    var loop;
    while (loop = context.loopName.pop()) {
      html_error += '    at ' + loop.line + ' (line: ' + loop.line_num + ')\n';
    }
    
    // 输出出错信息
    html_error = utils.outputHtml(html_error);
    scripts.splice(0, scripts.length);
    scripts.add('$_buf.push(\'' + html_top + '\');');
    scripts.add('$_buf.push($_err(\'' + html_error + '\'));');
    scripts.add('$_buf.push(\'' + html_bottom + '\');');
    
    html_start = text.length;
  }
  
  for (var i = 0, len; len = text.length, i < len; i++) {
    var block = text.substr(i, 2);
    if (text[i] === '\n')
      line_number++;
    context.line_num = line_number;
    
    //console.log('Block: ' + block);
    switch (block) {
      // 变量
      case '{{':
        var ret = parser.output(text, i, context);
        break;     
      // 语句
      case '{%':
        var ret = parser.tags(text, i, context);
        break;  
      // HTML代码
      default:
        var ret = null;
    }
    
    // 检查是否出错
    if (context.error) {
      catchError();
      break;
    }
    
    if (ret !== null) {
      //console.log(ret);
      var html = text.slice(html_start, ret.start);
      if (html.length > 0) {
        html = utils.outputHtml(html);
        scripts.add('$_buf.push(\'' + html + '\');');
      }
      // 代码
      scripts.add(ret.script);
      
      i = ret.end - 1;
      html_start = ret.end;
    }
  }
  
  // 最后一部分的HTML
  var html = text.slice(html_start, len);
  if (html.length > 0) {
    html = utils.outputHtml(html);
    scripts.add('$_buf.push(\'' + html + '\');');
  }
  
  // 检查是否出错(嵌套是否匹配)
  if (context.loopName.length > 0) {
    catchError(context.loopName.pop());
  }
  
  // 包装
  var wrap_top =    '/* == Template Begin == */\n'
               +    'var $_buf = [];\n'
               +    'var $_line_num = 0;\n';
  var wrap_bottom = '\n/* == Template End == */\n';
  var code = wrap_top + scripts.join('\n') + wrap_bottom;
  
  // console.log('names', context.varNames);
  // console.log('includes', context.includes);
  
  return {code: code, names: context.varNames, includes: context.includes};
}

/**
 * 编译代码(可运行的函数代码)
 *
 * @param {string} text 模板内容
 * @param {object} options 选项  files:子模版文件代码, original:是否返回原始代码
 * @return {function}
 */
exports.compile = function (text, options) {
  options = options || {};
  
  // 编译代码
  var tpl = exports.parse(text, options);
  
  var script = '(function (locals, filters) { \n'
             + 'locals = locals || {};\n'
             + 'filters = filters || {};\n'
             + 'var global = {locals: locals, filters: filters};\n'
             + 'var $_html = ' + utils.outputHtml.toString() + ';\n'
             + 'var $_err = ' + utils.errorMessage.toString() + ';\n'
             + 'var $_rethrow = ' + utils.rethrowError.toString() + ';\n'
             + 'var $_merge = ' + utils.merge.toString() + ';\n'
             + 'var $_range = ' + utils.range.toString() + ';\n'
             + 'var $_array = ' + utils.toArray.toString() + ';\n'
             //+ 'var $_table = ' + utils.tableSplit.toString() + ';\n'
             + 'try { \n'
             + tpl.code + '\n'
             + '} catch (err) {\n'
             + '  $_rethrow(err);\n'
             + '}\n'
             + 'return $_buf.join(\'\');\n'
             + '})';
  //console.log(script);
  try {
    var fn = eval(script);
    
    // 设置依赖的资源
    fn.names = tpl.names;         // 变量
    fn.includes = tpl.includes;   // 子模版
    
    // 如果设置了original=true选项，则直接返回原始代码，否则自动封装filters
    if (options.original)
      return fn;
      
    // 封装filters
    var fnWrap = function (d, f) {
      return fn(d, f || filters);
    };
    fnWrap.names = fn.names;
    fnWrap.includes = fn.includes;
    return fnWrap;
  }
  catch (err) {
    throw Error('Compile error: ' + err);
  }
}

/**
 * 渲染
 *
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @param {object} f 过滤器
 * @return {text}
 */
exports.render = function (text, data, f) {
  var fn = exports.compile(text);
  return fn(data, f);
}

    return exports;
  })({});
  /*-----------------------------------------------*/
  
  /*------------ ./lib/advtemplate.js -------------*/
  modules.advtemplate = (function (exports) {
    /**
 * 编译整套模板
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var template = modules.template;
var utils = modules.utils;
var AsyncDataList = utils.AsyncDataList;


/**
 * 编译所有模板
 *
 * @param {object} files 模板文件内容，如: {abc: '...', efc: '...'}
 * @param {object} options 选项  original:是否返回原始代码
 * @return {object}
 */
exports.compileAll = function (files, options) {
  options = options || {};
  
  // 第一遍编译
  var pCodes = {};
  var pFiles = {};
  for (var i in files) {
    var tpl = template.parse(files[i]);
    pCodes[i] = tpl;
    pFiles[i] = tpl.code;
  }
  
  // 合并模板文件依赖的变量
  var mergeRequire = function (f, field) {
    // console.log('merge', f, field);
    var ns = {};      // 名称
    var _f = {};      // 已分析过的模板名称
    
    var addName = function (n, c) {
      // console.log('add', f, field, n, c);
      if (!ns[n])
        ns[n] = c;
      else
        ns[n] += c;
    }
    
    // 初始化ns
    var t = pCodes[f];
    for (var i in t[field])
      addName(i, t[field][i]);
    
    // 合并子模版中的名称
    var m = function (f) {
      // console.log('m', f, _f);
      if (f in _f)
        return false;
      else
        _f[f] = true;
      
      var t = pCodes[f];
      if (!t)
        throw Error('Cannot find include file "' + f + '".');
      
      // 合并名称
      for (var i in t[field])
        addName(i, t[field][i]);
        
      // 合并子模版
      for (var i in t.includes)
        m(i);
        
      return true;
    }
    m(f);
    
    return ns;
  }
  
  // 计算深度的依赖关系
  for (var i in files) {
    pCodes[i].names = mergeRequire(i, 'names');
    pCodes[i].includes = mergeRequire(i, 'includes');
    // 如果出现闭环，则抛出异常
    if (i in pCodes[i].includes)
      throw Error('Cannot include file "' + i + '" in file "' + i + '".');
  }
  
  // 根据依赖关系安排模板文件的编译顺序
  // 计算得分
  var scores = {};
  for (var i in pCodes) {
    scores[i] = 0;
  }
  for (var i in pCodes) {
    scores[i]++;
    for (var j in pCodes[i].includes) {
      scores[j]++;
    }
  }
  // 按照得分排序
  var _scores = [];
  for (var i in scores) {
    _scores.push({n: i, s: scores[i]});
  }
  scores = _scores.sort(function (a, b) {
    return a.s < b.s;
  });
  // console.log(scores);
  
  // 第二遍编译
  var opt = utils.merge(options, {files: pFiles});
  for (var i in scores) {
    var n = scores[i].n;
    var tpl = template.parse(files[n], opt);
    pFiles[n] = tpl.code;
  }
  
  // 最后编译
  var cFn = {};
  var opt = utils.merge(options, {files: pFiles});
  for (var i in files) {
    var tpl = template.compile(files[i], opt);
    cFn[i] = tpl;
    cFn[i].names = pCodes[i].names;
    cFn[i].includes = pCodes[i].includes;
  }
  
  return cFn;
}


/**
 * 高级渲染
 *
 * @param {function} render   通过compile()编译出的模板渲染函数
 * @param {object} models     获取数据的函数 {'name': function (env, callback) {}}
 * @param {object} options    选项： parallel: true 并行方式获取，默认为false
 *                                   filters: 筛选器
 *                                   env: 环境变量，即models函数中的第一个参数
 * @param {function} callback 回调 function (err, text)
 */
exports.advRender = function (render, models, options, callback) {
  // 获取模板需要的变量数据
  var names = Object.keys(render.names);
  var dataList = AsyncDataList(models, names, options.env);
  
  var cb = function (err, data) {
    if (err)
      return callback(err);
    try {
      var text = render(data, options.filters);
      return callback(null, text);
    }
    catch (err) {
      return callback(err);
    }
  }
  
  if (options.parallel)
    dataList.startParallel(cb);
  else
    dataList.start(cb);
}


    return exports;
  })({});
  /*-----------------------------------------------*/
  
  /*------------------ ./index.js -----------------*/
  /**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var template = modules.template;
var advtemplate = modules.advtemplate;
var filters = modules.filters; 
 
 
// 版本
exports.version = '0.0.1';
 
// 解析代码
exports.parse = template.parse;

// 编译函数
exports.compile = template.compile;

// 渲染函数
exports.render = template.render;

// 编译整套模板
exports.compileAll = advtemplate.compileAll;

// 高级渲染
exports.advRender = advtemplate.advRender;

// 过滤器
exports.filters = filters;

 
  return exports;
  /*-----------------------------------------------*/
})({});

// 如果是在Node.js环境，则输出module.exports
if (typeof module !== 'undefined' && module.exports)
  module.exports = TinyLiquid;
