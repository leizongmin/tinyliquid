'use strict';

/**
 * 编译整套模板
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var template = require('./template');
var utils = require('./utils');
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
    };
    
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
    };
    m(f);
    
    return ns;
  };
  
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
};


/**
 * 高级渲染
 *
 * @param {function} render   通过compile()编译出的模板渲染函数
 * @param {object} models     获取数据的函数 {'name': function (env, callback) {}}
 * @param {object} options    选项： parallel: true 并行方式获取，默认为false
 *                                   filters: 自定义函数
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
  };
  
  if (options.parallel)
    dataList.startParallel(cb);
  else
    dataList.start(cb);
};

