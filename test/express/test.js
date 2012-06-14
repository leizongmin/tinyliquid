/**
 * Module dependencies.
 */

var express = require('express');
var tinyliquid = require('../../');

//console.log(express);
var app = express.createServer();

// 设置渲染引擎
app.register('.html', tinyliquid.__express());
//app.register('.html', require('ejs'));
app.set('views', __dirname);
app.set('view engine', 'html');
// 是否开启缓存
app.set('view cache', true);


// 测试
var users = [
  { name: 'tobi', email: 'tobi@learnboost.com' },
  { name: 'loki', email: 'loki@learnboost.com' },
  { name: 'jane', email: 'jane@learnboost.com' }
];


app.get('/', function(req, res){
  res.render('users', { users: users });
});


app.listen(3000);
console.log('Express app started on port 3000');

