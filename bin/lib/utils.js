'use strict';

/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');


/**
 * 列出目录下（包括子目录）所有指定类型的文件
 *
 * @param {string} dir 目录
 * @param {string} extname 后缀
 * @return {object} 相对路径， file:文件, dir:目录
 */
exports.listdir = function (dir, extname) {
  // 读取当前目录下的所有文件名
  var dirs = fs.readdirSync(dir);
  var extlen = extname ? extname.length : 0;
  var ret = {file: [], dir: []};
  // 逐个判断，如果是目录，则继续深度搜索
  for (var i in dirs) {
    try {
      var d = dirs[i];
      // 忽略.和..
      if (d === '.' || d === '..')
        continue;
      // 取文件属性
      var tp = path.resolve(dir, d);
      var s = fs.statSync(tp);
      if (!s)
        continue;
      // 是文件
      if (s.isFile()) {
        if (!extname)
          ret.file.push(tp);
        else if (extname && (tp.substr(0 - extlen) == extname))
          ret.file.push(tp);
      }
      // 是目录
      else if (s.isDirectory()) {
        ret.dir.push(tp);
        var r = exports.listdir(tp, extname);
        for (var j in r.file)
          ret.file.push(path.resolve(tp, r.file[j]));
        for (var j in r.dir)
          ret.dir.push(path.resolve(tp, r.dir[j]));
      }
    }
    catch (err) {
      console.error(err.stack)
    }
  }
  return ret;
};

/**
 * 生成出错信息
 *
 * @param {string} filename
 * @param {string} text
 * @param {string} code
 * @param {function} callback
 */
exports.makeErrorInfo = function (filename, text, code, callback) {
  var tmpdir = process.env.TMP || process.env.TEMP || '/tmp';
  var tmpfilename = path.resolve(tmpdir, new Date().getTime() + '-' + parseInt(Math.random() * 10000));
  fs.writeFileSync(tmpfilename, code);
  var retcallback = function () {
    try {
      fs.unlink(tmpfilename);
    }
    catch (err) {
      console.error(err);
    }
    return callback.apply(null, arguments);
  };
  child_process.exec(process.execPath + ' ' + tmpfilename, function (err, stdout, stderr) {
    if (!err) {
      console.error(stdout);
      console.error(stderr);
      return;
    }
    
    var errs = err.stack.split(/\r?\n/);
    var codeLines = code.split(/\r?\n/);
    var textLines = text.split(/\r?\n/);
    var i = errs[1].lastIndexOf(':');
    var num = parseInt(errs[1].substr(i + 1));
    
    /*
    // 打印代码
    codeLines.forEach(function (line, i) {
      console.log((i + 1) + ': ' + line);
    });
    // 打印模板
    textLines.forEach(function (line, i) {
      console.log((i + 1) + ': ' + line);
    });
    */
    
    for (var i = num; i >= 0; i--) {
      if (/(var\s*)?\$_line_num\s*=\s*\d+;/img.test(codeLines[i])) {
        var j = codeLines[i].lastIndexOf('=');
        var num2 = parseInt(codeLines[i].substr(j + 1));
        if (num2 < 1)
          num2 = 1;
        return retcallback(null, {
          filename: filename,
          line:     textLines[num2 - 1],
          code:     codeLines[num -1],
          lineNum:  num2,
          error:    errs[8]
        });
      }
    }
    return retcallback(null, [errs[1], num]);
  });
};
