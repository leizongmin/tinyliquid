TinyLiquid [![Build Status](https://secure.travis-ci.org/leizongmin/tinyliquid.png?branch=master)](http://travis-ci.org/leizongmin/tinyliquid) [![Dependencies Status](https://david-dm.org/leizongmin/tinyliquid.png)](http://david-dm.org/leizongmin/tinyliquid)
==============

A Liquid syntax template engine. 

__Notes__: The new version 0.2 is almost a full rewrite. Version 0.1 will continue to be maintained for fixing show-stopper bugs, but no new features should be expected.
**The new version is not compatible with the old version**. The version 0.1 documents: https://github.com/leizongmin/tinyliquid/blob/v0.1/README_en.md

![tinyliquid](https://nodei.co/npm/tinyliquid.png?downloads=true&stars=true)

Features
========

* Support asynchronous-locals and asynchronous-filter

* Easy to add your custom tags and custom filters

* Almost fully support the liquid syntax

* Support the Express 3.x framework

* High test coverage (92% coverage)


Installation
============

```bash
$ npm install tinyliquid
```


Quick Start
===========

TinyLiquid Wiki: https://github.com/leizongmin/tinyliquid/wiki

The Liquid Templating language: http://liquidmarkup.org/

Using on the Express 3.x: [the express-liquid module](https://github.com/leizongmin/express-liquid)

Using on the browser side: 

```HTML
<script src="https://raw.github.com/leizongmin/tinyliquid/master/target/tinyliquid.js"></script>
reference the file "test/test.html" from the source directory
```


The difference with Liquid language
==============

TinyLiquid not support the locals variables like this: `a[0]`, `a["b"]`, `a[0]["b"]` and so on.

Only support to use `.` as the separator: `a.b`, `a.b.c`


Running Tests
=============

To run the test suite first invoke the following command within the repo, installing the development dependencies:

```bash
$ npm install
```

then run the tests:

```bash
$ npm test
```

Get the test coverage report: open the file "./coverage.html" in your browser.


License
=======

```
Copyright (c) 2012-2014 Zongmin Lei (雷宗民) <leizongmin@gmail.com>
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
