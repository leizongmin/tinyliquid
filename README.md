关于TinyLiquid
===============

**TinyLiquid**是一个基于**Node.js**，使用类似于**Liquid**模板语法的的模板引擎。
其具有以下特点：
  
*  强大灵活的语法：在模板当中，你可以使用诸如条件判断、循环、赋值、过滤器等语法
  标记来进行控制
  
*  渲染速度快：目前仅做了简单的测试，其速度为ejs的3倍以上

*  异步渲染模式：可解决使用Node.js开发Web应用时异步获取多个数据时，难以控制的问题

-----------------------------------------


模板语法
==============

### 输出

例：

    你好, {{ name }}
    

### 过滤器(Filters)

例：

    大写：{{ name | upcase }}
    现在的时间是：{{ "now" | date: "%H时%M分%S秒" }}
    

### 条件判断

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


### 循环

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
    
    
### 变量赋值

例：

    {% assign name = "value" %}
    
    {% assign name = value | upcase %}
    

### 保存局部输出

例：

    {% capture name %}
      {% for item in array %}
        {% item %}
      {% endfor %}
    {% endcapture %}
    array循环的输出被保存到name当中了
    

### 包含文件

例：

    {% include "header" %}
    
    {% include "header" with data %}
    
    
详细语法说明可参考这里：http://wiki.shopify.com/Liquid

-----------------------------------------


异步渲染模式
===================

在Node.js编程中，最令人头疼的是异步获取数据的层层嵌套，还有错综复杂的回调，而
TinyLiquid的自动获取数据功能可以解决该问题。如下面例子：


### 普通获取数据方式

    DB.query('select * from table1', function (err, data1) {
      // ...
      DB.query('select * from table2', function (err, data2) {
        // ...
        DB.query('select * from table3', function (err, data3) {
          // ...
          DB.query('select * from table4', function (err, data4) {
            // ...
            // ...
            render({data1: data1, data2: data2, data3: data3, data4: data4});
          });
        });
      });
    });

    
### 使用Jscex方式获取

    eval(Jscex.compile("async", function () {
    
      var data1 = $await(DB.queryAsync('select * from table1'));
      
      var data2 = $await(DB.queryAsync('select * from table2'));
      
      var data3 = $await(DB.queryAsync('select * from table3'));
      
      var data4 = $await(DB.queryAsync('select * from table4'));
      
      render({data1: data1, data2: data2, data3: data3, data4: data4});
    
    })).start();


### TinyLiquid的自动获取方式

    var models = {
      data1:  function (env, callback) {
        DB.query('select * from table1', callback); 
      },
      data2:  function (env, callback) {
        DB.query('select * from table2', callback); 
      },
      data3:  function (env, callback) {
        DB.query('select * from table3', callback); 
      },
      data4:  function (env, callback) {
        DB.query('select * from table4', callback); 
      }
    };
    
    TinyLiquid.advRender(render, models, {}, function (err, text) {
      // 渲染完成时的回调函数
    });
    

### 使用TinyLiquid的好处

*  避免程序的多层嵌套

*  不需要安装更多的模块

*  TinyLiquid仅在模板需要用到该数据时，才会执行获取数据操作，因此你可以定义一个
  公共的获取数据接口，当渲染不同的页面时，TinyLiquid会根据需要获取相应的数据，而
  有不会去获取模板中不需要的数据。
  
  
  
开始使用
================

### 安装

  直接从github上下载源码：
  
    git clone git://github.com/leizongmin/tinyliquid.git
    
  或者通过npm命令来安装：
  
    npm install tinyliquid
    
    
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
      filters:  tinyliquid.filters,     // 可选，筛选器
      env:      {},                     // 可选，环境变量，即models函数中的第一个参数
    };
    
    tinyliquid.advRender(render, models, options, function (err, text) {
      if (err)
        console.error(err);
      else
        console.log(text);
    });
    
    
### 过滤器  filters

详见 [lib/filters.js](tinyliquid/lib/filters.js)


