/**
 * 演示1：列出目录下的文件
 */
 
var fs = require('fs');
var path = require('path');
var os = require('os');
var http = require('http');
var url = require('url');
var liquid = require('../../');

process.chdir(__dirname);

// 渲染模板
var templates = liquid.compileAll({
  'index':    fs.readFileSync('index.html', 'utf8'),
  'header':   fs.readFileSync('header.html', 'utf8'),
  'bottom':   fs.readFileSync('bottom.html', 'utf8')
}, {original: true});


// 数据模型
var models = require('./models');

//==============================================================================
var PORT = 80;
var server = http.createServer(function (req, res) {
  var urlInfo = url.parse(req.url, true);
  var params = urlInfo.query;
  
  if (/\.ico$/img.test(urlInfo.pathname))
    return res.end();
  
  // 环境变量
  var env = {
    path:   params.path
  };
  // 自定义函数
  var filters = {
    resolve_path:   function (p, f) {
      return path.resolve(params.path, f, p);
    }
  };
  
  console.log('Request: ' + req.socket.remoteAddress);
  res.setHeader('Content-Type', 'text/html');
  
  liquid.advRender(templates.index, models, {env: env, filters: filters}, function (err, text) {
    if (err)
      res.end(err.toString());
    else
      res.end(text);
  });
  
});
server.listen(PORT);
console.log('Work Path:' + process.cwd() + '    Port:' + PORT);