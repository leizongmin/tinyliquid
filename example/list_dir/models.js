

var fs = require('fs');
var path = require('path');
var os = require('os');


//--------------------------------- 静态数据 -----------------------------------
// OS信息
var osInfo = exports.os = {};
for (var i in os) {
  if (typeof os[i] !== 'function')
    continue;
  osInfo[i] = os[i]();
}

// 进程信息
var processInfo = exports.process = {};
for (var i in process) {
  if (typeof process[i] === 'function')
    continue;
  processInfo[i] = process[i];
}


//--------------------------------- 动态数据 -----------------------------------
// 启动时间
exports['uptime'] = function (env, callback) {
  var uptime = process.uptime();
  console.log('取已运行时间: ' + uptime);
  return callback(null, uptime);
}

// 列出当前目录
exports.files = function (env, callback) {
  var dir = path.resolve(env.path);
  fs.stat(dir, function (err, stats) {
    if (err)
      return callback(err);
    if (stats.isDirectory()) {
      console.log('列出目录：' + dir);
      fs.readdir(dir, function (err, files) {
        if (err)
          return callback(null);
        files.unshift('..');
        return callback(null, files);
      });
    }
    else {
      return callback(null, null);
    }
  });
}

// 取当前文件内容
exports.file = function (env, callback) {
  var file = path.resolve(env.path);
  fs.stat(file, function (err, stats) {
    if (err)
      return callback(err);
    if (stats.isFile()) {
      console.log('读取文件：' + file);
      fs.readFile(file, 'utf8', callback);
    }
    else {
      return callback(null, null);
    }
  });
}

// 当前路径
exports.path = function (env, callback) {
  return callback(null, path.resolve(env.path));
}

// 当前时间
exports.now = function (env, callback) {
  return callback(null, new Date());
}