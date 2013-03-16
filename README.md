TinyLiquid [![Build Status](https://secure.travis-ci.org/leizongmin/tinyliquid.png?branch=master)](http://travis-ci.org/leizongmin/tinyliquid) [![Dependencies Status](https://david-dm.org/leizongmin/tinyliquid.png)](http://david-dm.org/leizongmin/tinyliquid)
==============

A Liquid template syntax template engine. 

Notes: The new version 0.2 is almost a full rewrite. Version 0.1 will continue to be maintained for fixing show-stopper bugs, but no new features should be expected.


Install
=======

```bash
npm install tinyliquid
```


Quick Start
===========

```javascript
var tinyliquid = require('tinyliquid');

var render = tinyliquid.compile('Hello, {{name}}!');
var context = tinyliquid.newContext();
context.setLocals('name', 'Lily');

render(context, function (err, text) {
  if (err) throw err;
  console.log('Result: %s', text);
});
```

Using in the Express 3.x: [the express-liquid module](https://github.com/leizongmin/express-liquid)


Test
====

```bash
mocha test/
```

jscoverage:

```bash
sh bin/coverage.sh
```

jscoverage: 90%


License
=======

```
Copyright (c) 2012-2013 Lei Zongmin(雷宗民) <leizongmin@gmail.com>
http://ucdok.com

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
