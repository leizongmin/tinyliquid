
var http = require('http');
var path = require('path');
var quickweb = require('quickweb');
var liquid = require('../../');
var filters = require('../../lib/filters');

var render = function (text, data) {
  console.log(liquid.parse(text));
  var fn = liquid.compile(text);
  console.log(fn.toString());
  var html = fn(data, filters);
  return html;
}
    
http.createServer(function (req, res) {
  quickweb.extend(req, res);
  
  if (/POST/img.test(req.method)) {
    req.on('post complete', function () {
      try {
        var text = req.post.text;
        var data = JSON.parse(req.post.data);
        res.contentType('text/html');
        var html = render(text, data);
        console.log('====================================');
        console.log(html);
        console.log('====================================');
        res.send(html);
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