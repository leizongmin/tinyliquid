
var easytpl = require('./index');
var fs = require('fs');

var tpl = fs.readFileSync('test.html', 'utf8');
/*
console.log(tpl);

console.log('\n===================================================\n');

var text = easytpl.parse(tpl);

console.log('\n===================================================\n');

console.log(text);

console.log('\n===================================================\n');
*/

var fn = easytpl.compile(tpl);
var data = {
  name:   '<b>QuickWeb<b>',
  group:  ['Node.js', 'Web Framework', 'Application Server']
}
console.log(fn(data));
