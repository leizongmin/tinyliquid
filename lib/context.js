/**
 * Context对象
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var flow = require('bright-flow');
var utils = require('./utils');
var parser = require('./parser');
var filters = require('./filters');
var vm = require('./vm');
var merge = utils.merge;


/**
 * VM的Context对象
 *
 * @param {Object} options
 *   - {Object} filters
 *   - {Object} asyncFilters
 *   - {Object} locals
 *   - {Object} syncLocals
 *   - {Object} asyncLocals
 *   - {Integer} timeout 异步执行时超时时间，单位ms
 */
var Context = module.exports = exports = function (options) {
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
  this._onErrorHandler = null;
  
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
  return vm.run(astList, this, callback);
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
 * @return {Array} [属性, 值, 子节点列表, 是否为普通可缓存变量]，找不到返回null
 */
Context.prototype.getLocals = function (name) {
  var NORMAL = this.STATIC_LOCALS;
  
  // for循环内的专用变量
  if (this._isInForloop) {
    var loop = this.forloopInfo();
    var name2 = name + '.';
    if (name2.substr(0, loop.itemName.length) === loop.itemName) {
      return [NORMAL, loop.item, name.split('.').slice(1)];
    }
  }
  
  // tablerow循环内的专用变量
  if (this._isInTablerowloop) {
    var loop = this.tablerowloopInfo();
    var name2 = name + '.';
    if (name2.substr(0, loop.itemName.length) === loop.itemName) {
      return [NORMAL, loop.item, name.split('.').slice(1)];
    }
  }

  name = this._localsPrefix + name;
  return this._getLocals(name);
};

/**
 * 取局部变量（不包括forloop和tablerowloop前缀）
 *
 * @param {String} name
 * @return {Array} [属性, 值, 子节点列表, 是否为普通可缓存变量]，找不到返回null
 */
Context.prototype._getLocals = function (name) {
  var childs = name.split('.');
  var name = childs[0];
  childs = childs.slice(1);

  if (name in this._locals) return [this.STATIC_LOCALS, this._locals[name], childs];
  if (name in this._syncLocals) return [this.SYNC_LOCALS, this._syncLocals[name], childs, true];
  if (name in this._asyncLocals) return [this.ASYNC_LOCALS, this._asyncLocals[name], childs, true];
  for (var i = 0, len = this._asyncLocals2.length; i < len; i++) {
    var item = this._asyncLocals2[i];
    if (item[0].test(name)) {
      return [this.ASYNC_LOCALS, item[1], childs, true];
    }
  }
  return null;
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
  console.log('[tinyliquid] debug - %s', info);
};

/**
 * 注册运行出错时的处理函数
 *
 * @param {Function} fn 格式：function (err) { return 返回出错对象或null; }
 */
Context.prototype.onError = function (fn) {
  this._onErrorHandler = fn;
};

/**
 * 处理出错信息
 *
 * @param {Object} err
 * @return {Object} 如果出错，返回Error对象，否则返回null
 */
Context.prototype.error = function (err) {
  if (err && typeof(this._onErrorHandler) === 'function') {
    return this._onErrorHandler(err);
  } else {
    return err || null;
  }
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
 * 抛出超时异常
 */
Context.prototype.throwTimeoutError = function () {
  throw new Error('Timeout.');
};

/**
 * 抛出变量未定义异常
 *
 * @param {String} name
 */
Context.prototype.throwLocalsUndefinedError = function (name) {
  this.debug('Locals ' + name + ' is undefined.');
};

/**
 * 抛出Filter未定义异常
 *
 * @param {String} name
 */
Context.prototype.throwFilterUndefinedError = function (name) {
  this.debug('Filter ' + name + ' is undefined.');
}

/**
 * 抛出未知操作码异常
 *
 * @param {String} code
 */
Context.prototype.throwUnknownOpcodeError = function (code) {
  this.debug('Unknown opcode ' + code + '.');
};
