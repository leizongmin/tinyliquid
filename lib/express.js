'use strict';

/**
 * 支持express渲染
 *
 * @param 老雷<leizongmin@gmail.com>
 */

var tinyliquid = require('../');
var fs = require('fs');
var path = require('path');

/**
 * 返回用于express 3.x的渲染函数
 * 
 * @param {object} options
 * @return {function}
 *
 * options
 *   编译相关：
 *     tags        自定义标记解析  {tagname: [Function]}
 *     includeFile 解析include标记时，读取文件的函数  function (filename, callback) 默认为读取当前文件所在目录
 *   渲染相关：
 *     parallel    异步获取数据时，是否采用并行方式，默认为false
 *     filters     模板内可用的函数
 *
 * 模板：
 *    {% include "filename" %} 其中的filename默认为views目录下绝对路径，与当前模板文件所在路径无关 
 *                             filename必须为文件的全名称，不能省略扩展名
 *
 * 布局layout：
 *    指定locals变量layout为布局模板，如：  res.locals.layout = 'layout.liquid';
 *    在布局模板中通过 {{body}} 或 {{content_for_layout}} 来获取当前模板的内容
 */
module.exports = function (options) {
  options = options || {};
  var cache = {};

  /**
   * 合并对象
   */
  var merge = function () {
    var ret = {};
    for (var i in arguments) {
      var obj = arguments[i];
      for (var j in obj) {
        ret[j] = obj[j];
      }
    }
    return ret;
  };

  /**
   * 编译模板
   *
   * @param {string} filename
   * @param {object} settings
   * @param {function} callback
   */
  var compileFile = function (filename, settings, callback) {
    var readFile = function (filename, callback) {
      try {
        fs.readFile(path.resolve(settings.views, filename), 'utf8', callback);
      } catch (err) {
        return callback(err);
      }
    };
    var includeFile = options.includeFile || readFile;

    readFile(filename, function (err, data) {
      if (err) return callback(err);
      var files = {};
      files['$$$'] = data;

      var filenames = Object.keys(tinyliquid.parse(data, options).includes);
      var allFilenames = filenames.slice();
      
      var readFileDone = function () {
        try {
          var fn = tinyliquid.compileAll(files, options)['$$$'];
          return callback(null, fn);
        } catch (err) {
          return callback(err);
        }
      };
      var readNextFile = function () {
        var filename = filenames.shift();
        if (!filename) return readFileDone();
        // 读取模板内容，并读取该模板include的子模版内容
        includeFile(filename, function (err, data) {
          if (err) return callback(err);
          files[filename] = data;
          var includes = Object.keys(tinyliquid.parse(data, options).includes);
          includes.forEach(function (f) {
            if (allFilenames.indexOf(f) === -1) {
              allFilenames.push(f);
              filenames.push(f);
            }
          });
          readNextFile();
        });
      };
      readNextFile();
    });
  };

  /**
   * 渲染模板
   *
   * @param {function} fn
   * @param {object} locals
   * @param {function} callback
   */
  var render = function (fn, locals, callback) {
    var opts = merge(options, {env: locals});
    tinyliquid.advRender(fn, locals, opts, callback);
  };

  /**
   * 在指定布局中渲染模板
   *
   * @param {function} fn
   * @param {object} options
   * @param {function} callback
   */
  var renderInLayout = function (fn, options, callback) {
    var layout;
    var renderBody = function () {
      render(fn, options, function (err, body) {
        if (err) return callback(err);
        options.body = options.content_for_layout = body;
        render(layout, options, callback);
      });
    };
    if (options.cache && typeof cache[options.layout] === 'function') {
      layout = cache[options.layout];
      renderBody();
    } else {
      compileFile(options.layout, options.settings, function (err, fn) {
        if (err) return callback(err);
        cache[options.layout] = layout = fn;
        renderBody();
      });
    }
  };


  return function (filename, options, callback) {
    if (options.layout === true) options.layout = 'layout.liquid';
    // console.log(options);
    // console.log(cache);
    if (options.cache && typeof cache[filename] === 'function') {
      var fn = cache[filename];
      (typeof options.layout === 'string' ? renderInLayout : render)(fn, options, callback);
    } else {
      compileFile(filename, options.settings, function (err, fn) {
        if (err) return callback(err);
        if (options.cache) cache[filename] = fn;
        (typeof options.layout === 'string' ? renderInLayout : render)(fn, options, callback);
      });
    }
  };
};
