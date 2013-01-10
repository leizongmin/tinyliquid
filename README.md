English user [see here](https://github.com/leizongmin/tinyliquid/blob/master/README_en.md)
===============

TinyLiquid
===============

[![Build Status](https://secure.travis-ci.org/leizongmin/tinyliquid.png?branch=master)](http://travis-ci.org/leizongmin/tinyliquid)

**TinyLiquid**是一个基于**JavaScript**，兼容**Liquid**模板语法的的模板引擎。
其具有以下特点：
  
*  强大灵活的语法：在模板当中，你可以使用诸如条件判断、循环、赋值、函数调用等语法
  标记来进行控制
  
*  渲染速度快：目前仅做了简单的测试，其速度为ejs的4倍以上 [性能测试结果](https://github.com/leizongmin/tinyliquid/blob/master/benchmark/result.txt)

*  异步渲染模式：可解决JavaScript程序中异步获取多个数据时，难以控制的问题

*  可运行于浏览器端及Node.js环境下



下载 & 安装
===============

目前最新版为**v0.0.9**，可通过以下方式来获取TinyLiquid模块：

*  通过NPM安装：**npm install tinyliquid**

*  通过git下载：**git clone git://github.com/leizongmin/tinyliquid.git**
  
*  在**浏览器**端使用：`<script src="https://raw.github.com/leizongmin/tinyliquid/master/build/target/tinyliquid.min.js"></script>`

*  在**Express 3.x**中使用：模块[express-liquid](https://github.com/leizongmin/express-liquid)



模板语法
==============

### 输出变量 {{name}}

例：

    你好, {{ name }}
    你好, {{ name | escape }}  // 对变量值进行转义
    

### 函数调用(Filters) {{value|method}}

例：

    大写：{{ name | upcase }}
    现在的时间是：{{ "now" | date: "%H时%M分%S秒" }}
    嵌套：{{ name |  upcase | split: '-' }}
    

### 条件判断 {%if condition%}...{%else%}...{%endif%} 

例：

    {% if name == "老雷" %} {{ name }}，你好 {% endif %}
    
    {% unless name contains "雷" %} 你不是老雷！ {% endunless %}
    
    {% if you.age < 18 %}
      你还未成年呐~~
    {% else %}
      欢迎进入...
    {% endif %}
    
说明：条件判断操作符可支持等于(==)、不等于(!=或<>)、大于(>)、小于(<)、
大于或等于(>=)、小于或等于(<=)、包含字符串(contains)


### 循环 {%for item in array%}...{%endfor%}  {%tablerow item in array%}...{%endtablerow%}

例：

    {% for item in array %}
      {{ item }}
    {% endfor %}
    
    {% for item in array offset:2 limit:3 %}
      {{ item }}
    {% endfor %}
    
    {% tablerow item in array cols:4 %}
      {{ item }}
    {% endtablerow %}
    
    
### 变量赋值 {%assign name = "value"%}

例：

    {% assign name = "value" %}
    
    {% assign name = value | upcase %}
    

### 保存局部输出 {%capture name%}...{%endcapture%}

例：

    {% capture name %}
      {% for item in array %}
        {% item %}
      {% endfor %}
    {% endcapture %}
    array循环的输出被保存到name当中了，通过`{{ name }}`可输出该结果
    

### 常量循环 {%cycle 'one','two','three'%}

例：

    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %} 
    
将输出：one,two,three,one

    
### 包含文件 {%include "filename"%}

例：

    {% include "header" %}
    
    {% include "header" with data %}
    
    
### 不解析部分 {%raw%}...{%endraw%}

例：

    {% raw %}{{ 5 | plus: 6 }}{% endraw %} is equal to {{ 5 | plus: 6 }}.
    
将输出：{{ 5 | plus: 6 }} is equal to 11.
    
    
### 注释部分 {%comment%}...{%endcomment%}

例：

    Hello world. {% comment %} Now this is a single-line comment {% endcomment %} <br />
    Hello world,
    I think I'm gonna be happy today. {% comment %} Now this is a
    multi-line comment that should be ignored too,
    just like the single-line comment {% endcomment %}
    
将输出：

    Hello world.
    Hello world, I think I'm gonna be happy today.
    
    
详细语法说明可参考这里：

http://wiki.shopify.com/Liquid （英文）

https://wiki.shopqi.com/liquid （中文）



开始使用
================

### 载入模块

  在Node.js环境下：
  
    var tinyliquid = require('tinyliquid');
    
  在浏览器环境下：（在浏览器环境下，通过全局变量**TinyLiquid**来操作）
  
    <!-- 该文件可在源码里面的build/target目录获得 -->
    <script src="tinyliquid.min.js"></script>
    <script>
      TinyLiquid.render('{{a}}', {a: 123});
    </script>
    
    
### 编译模板  compile(text, [options])

    var tinyliquid = require('tinyliquid');
    
    // 普通方式
    var render = tinyliquid.compile('模板内容 {{ name }}');
    
    // 如果模板中使用到了**include**标签，则需要指定files选项
    var options = {
      files:  {
        'filename':  'content'
      }
    };
    var render = tinyliquid.compile('模板内容 {{ name }}', options);
    
    // 默认情况下，compile()返回的是封装后的代码，如果需要返回原始的js代码，
    // 可指定original选项
    options.original = true;
    var render = tinyliquid.compile('模板内容 {{ name }}', options);
    
    
### 高级编译  compileAll(files, [options])

    var tinyliquid = require('tinyliquid');
    
    var files = {
      'index':    fs.readFileSync('index.html', 'utf8'),
      'header':   fs.readFileSync('header.html', 'utf8'),
      'bottom':   fs.readFileSync('bottom.html', 'utf8'),
    };
    var options= { original: true};
    
    var render = tinyliquid.compileAll(files, options);
    // 返回 {index: [Function], header: [Function], bottom: [Function]}
    
    
### 渲染  render(data, [filters]);

    var tinyliquid = require('tinyliquid');
    var render = tinyliquid.compile('模板内容 {{ name }}');
    
    // 普通方式
    var text = render(data);
    
    // 自定义filters方式
    var filters = {
      upcase: function (s) {
        return String(s).toUpperCase();
      }
    };
    var text = render(data, filters);
    
    // 如果在编译模板的时候指定了选项original=true，则渲染时必须指定filters参数，
    // 可以为 tinyliquid.filters ，否则，模板中将无法使用filters功能
    
    
### 高级渲染  advRender(render, models, options, callback)

    var tinyliquid = require('tinyliquid');
    var render = tinyliquid.compile('模板内容 {{ name }}');
    
    // 定义models
    var models = {
      name:   function (env, callback) {
        setTimeout(function () {
          callback(null, '你好');
        }, 100);
      }
    };
    
    // 选项
    var options = {
      parallel: false,                  // 可选，true 并行方式获取，默认为false
      filters:  tinyliquid.filters,     // 可选，自定义函数
      env:      {},                     // 可选，环境变量，即models函数中的第一个参数
    };
    
    tinyliquid.advRender(render, models, options, function (err, text) {
      if (err)
        console.error(err);
      else
        console.log(text);
    });
    

### 自定义函数 (filters)

    var tinyliquid = require('tinyliquid');
    var render = tinyliquid.compile('{{ "hello, world!" | my_filter }}');

    // 编译出来的函数中，第二个参数可用来指定自定义的filters集合
    var filters = {};
    // 先复制原来的filters，否则传入自定义的filters后，将不能使用旧的
    for (var i in tinyliquid.filters) {
      filters[i] = tinyliquid.filters[i];
    }
    filters.my_filter = function (str) {
      return String(str).replace('world', 'abc');
    };
    console.log(render({}, filters));  // 输出 hello, abc!

### 自定义标签 (tag)

    var tinyliquid = require('tinyliquid');

    // 自定义标签
    var tags = {};
    // words    当前标签中用空格隔开的单词数组，除第一个之外
    // line     当前标签的文本，即 {% %} 里面的内容
    // context  环境变量
    // methods  为编译时提供相应的方法，其中包含：
    //   loopNotMatch   返回标签不匹配出错信息
    //   syntaxError    返回语法错误出错信息
    //   unknownTag     返回不可识别的标签出错信息
    //   localsWrap     取得渲染模板时的内部表示变量名称
    //   printString    返回输出字符串的js代码
    //   printLocals    返回输出变量的js代码
    // 自定义标签函数应该返回该标签所生成的js代码，
    // 若返回null将输出一个syntaxError()出错信息
    tags.my_tag = function (words, line, context, methods) {
      // 在本例中返回以下js代码：
      //    $_buf += 'hello, ';\n
      //    $_buf += locals.name;\n
      return methods.printString('hello, ') + methods.printLocals(words[0]);
    };

    var render = tinyliquid.compile('{% my_tag name %}', {tags: tags});
    console.log(render({name: 'world'}));   // 输出： hello, world

### 使用建议

  TinyLiquid没有内置的缓存机制，因此在使用时，如果需要多次调用某个模板来进行渲染，需要
  手动缓存编译出来的渲染函数。



异步渲染模式
===================

在Node.js编程中，最令人头疼的是异步获取数据的层层嵌套，还有错综复杂的回调，而
TinyLiquid的自动获取数据功能可以解决该问题。以下为使用不同方式异步获取数据的例子：

*  普通获取数据方式 [https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/normal.js](https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/normal.js)

*  使用Jscex获取数据方式 [https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/jscex.js](https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/jscex.js)

*  使用EventProxy获取数据方式 [https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/eventproxy.js](https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/eventproxy.js)

*  使用TinyLiquid内置的advRender()自动获取数据方式 [https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/advrender.js](https://github.com/leizongmin/tinyliquid/blob/master/example/different_ways/advrender.js)
    
使用TinyLiquid的好处

*  避免程序的多层嵌套

*  不需要安装更多的模块

*  TinyLiquid仅在模板需要用到该数据时，才会执行获取数据操作，因此你可以定义一个
  公共的获取数据接口，当渲染不同的页面时，TinyLiquid会根据需要获取相应的数据，而
  不会去获取模板中不需要的数据。
  
*  编写更少的代码
  
  
    
## 内置函数  filters

内置支持的函数详见 [lib/filters.js](tinyliquid/blob/master/lib/filters.js)

### 标签相关

*  {{'url' | **img_tag**: 'alt'}}  生成`<img>`标签

*  {{'url' | **script_tag**}}  生成`<script>`标签

*  {{'url' | **stylesheet_tag**: 'media'}}  生成`<link>`CSS标签

*  {{'link' | **link_to**: 'url', 'title'}}  生成`<a>`标签

### 算数运算相关

*  {{123 | **plus**: 456}}  相加

*  {{123 | **minus**: 456}}  相减

*  {{123 | **times**: 456}}  相乘

*  {{123 | **divided_by**: 456}}  相除

*  {{1.23 | **round**: 2}}  四舍五入，保留小数点后2位

*  {{1.23 | **integer**}}  取整

*  {{1 | **random**: 2}}  返回1<=N<2的随机数

*  {{N | **pluralize**: 'item', 'items'}}  如果N大于1则返回items，否则返回item

### 字符串相关

*  {{'abc' | **append**: 'd'}}  在后面拼接字符串

*  {{'abc' | **prepend**: 'd'}}  在前面拼接字符串

*  {{'a b c' | **camelize**}}  将字符串转化为驼峰命名方式

*  {{'a b c' | **capitalize**}}  字符串首字母大写

*  {{'ABC' | **downcase**}}  转化为小写

*  {{'abc' | **upcase**}}  转化为大写

*  {{'&lt;a&gt;' | **escape**}}  HTML字符串转义

*  {{'this is a book' | **handleize**}}  将字符串转化为'this-is-a-book'

*  {{'abcabc' | **replace_first**: 'a', 'x'}}  替换第一次出现的字符串a为x

*  {{'abcabc' | **replace**: 'a', 'x'}}  替换所有指定字符串a为x

*  {{'abcabc' | **remove_first**: 'a'}}  删除第一次出现的指定字符串a

*  {{'abcabc' | **remove**: 'a'}}  删除所有指定字符串a

*  {{'abc\nabc' | **newline_to_br**}}  将换行符转换为<br>标签
 
*  {{'a-b-c' | **split**: '-'}}  用指定字符串分割，返回数组

*  {{'abcd' | **size**}}  返回字符串长度

*  {{'<span>123</span>' | **strip_html**}} 去除HTML标签，返回文本123

*  {{'abc\nabc' | **strip_newlines**}} 取出换行符

*  {{'abcdefg' | **truncate**: 3}}  取前N个字符

*  {{'this is a book' | **truncatewords**: 2}}  取前N个单词

*  {{'abcdef' | **reverse**}}  反转字符串

*  {{'ancdefg' | **substr**: N, M}}  从起始索引号N开始提取字符串中指定数目M的字符

### 日期时间相关

*  {{0 | **timestamp**}} 取当前毫秒时间戳，并加上0

*  {{'now' | **date**: '%H:%M%S'}} 格式化日期时间字符串

### 数组、对象相关

*  {{obj | **keys**}}  返回对象的所有键，结果为数组

*  {{array | **first**}}  返回数组(或对象)的第一个元素

*  {{array | **last**}}  返回数组(或对象)的最后一个元素

*  {{array | **join**: ','}}  将数组以指定的字符串拼接起来

*  {{array | **size**}}  返回数组长度

*  {{obj | **json**}}  转换为JSON格式的字符串

*  {{obj | **get**: 'prop'}}  取对象的指定属性

*  {{array | **reverse**}}  反转数组

*  {{array | **map**: 'prop'}}  取数组各个元素的指定属性，返回数组

*  {{array | **sort**: 'desc'}}  对数组进行排序，可为asc(升序)或desc(降序)

*  {{array | **sort_by**: 'prop', 'desc'}}  根据数组各个元素中的指定属性排序

### 其他

*  {{count | **pagination**: size, currentPage}}  生成导航页码



授权
===============

你可以在遵守**MIT Licence**的前提下随意使用并分发它。

    Copyright (c) 2012 Lei Zongmin <leizongmin@gmail.com>
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