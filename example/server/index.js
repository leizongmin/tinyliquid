
var http = require('http');
var path = require('path');
var quickweb = require('quickweb');
var liquid = require('../../');
var filters = require('../../lib/filters');

var render = function (text, data) {
  console.log(liquid.parse(text).code);
  var fn = liquid.compile(text, {original: true});
  console.log(fn.toString());
  var html = fn(data, filters);
  return html;
}

var compile = function (text) {
  var code = liquid.parse(text).code;
  try {
    var fn = liquid.compile(text, {original: true});
  }
  catch (err) {
    console.log(err.stack);
    return code;
  }
  console.log(fn.toString());
  return fn;
}
    
http.createServer(function (req, res) {
  quickweb.extend(req, res);
  
  if (/POST/img.test(req.method)) {
    req.on('post complete', function () {
      try {
        var text = req.post.text;
        var data = JSON.parse(req.post.data);
        
        if (req.post.compile) {
          res.send(compile(text).toString());
        }
        else if (req.post.compile2) {
          var r = compile(text);
          res.sendJSON({
            code:     r.toString(),
            names:    r.names,
            includes: r.includes
          });
        }
        else {
          res.contentType('text/html');
          var html = render(text, data);
          //console.log('====================================');
          //console.log(html);
          //console.log('====================================');
          res.send(html);
        }
      }
      catch (err) {
        res.sendError(500, err.stack);
      }
    });
  }
  else {
    res.sendFile(path.resolve(__dirname, 'index.html'));
  }

}).listen(8888);
console.log('Server listen on http://127.0.0.1:8888/');