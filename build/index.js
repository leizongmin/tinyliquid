/**
 * 构建用于浏览器端的库
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
 
var fs = require('fs');
var path = require('path');
var tinyliquid = require('../');
var exec = require('child_process').exec;


process.chdir(__dirname);

var readModuleFile = function (name) {
  if (name === 'index')
    var filename = path.resolve('../index.js');
  else
    var filename = path.resolve('../lib', path.basename(name));
  var context = fs.readFileSync(filename, 'utf8');
  return context.replace(/require\s*\(\s*['"].*['"]\s*\)/mg, function (name) {
    var mn = /require\s*\(\s*['"](.*)['"]\s*\)/.exec(name)[1];
    return 'modules.' + path.basename(mn, '.js');
  });
};


// 读入各个模块
var models = {
  main:     readModuleFile('index'),
  files:    {}
};

var dir = fs.readdirSync(path.resolve('../lib'));
for (var i in dir) {
  if (path.extname(dir[i]) === '.js') {
    models.files[path.basename(dir[i], '.js')] = readModuleFile(dir[i])
  }
};


// 渲染
var template = fs.readFileSync('./template.liquid', 'utf8');
var output = tinyliquid.render(template, models);
fs.writeFileSync('./target/tinyliquid.js', output);


// 生成压缩文件
exec('uglifyjs ' + path.resolve('./target/tinyliquid.js'), function (err, stdout, stderr) {
  if (err)
    throw err;
  if (stderr)
    console.error(stderr);
  fs.writeFileSync(path.resolve('./target/tinyliquid.min.js'), stdout);
  
  console.log('已生成文件：');
  console.log('    ' + path.resolve('./target/tinyliquid.js'));
  console.log('    ' + path.resolve('./target/tinyliquid.min.js'));
});