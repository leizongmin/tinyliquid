关于TinyLiquid
===============

**TinyLiquid**是一个基于**Node.js**，使用类似于**Liquid**模板语法的的模板引擎。
其具有以下特点：
  
*  强大灵活的语法：在模板当中，你可以使用诸如条件判断、循环、赋值、过滤器等语法
  标记来进行控制；
  
*  渲染速度快：目前仅做了简单的测试，其速度为ejs的3倍以上；

*  异步渲染模式：可解决使用Node.js开发Web应用时异步获取多个数据时，难以控制的问题；

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
    

详细语法说明可参考这里：http://wiki.shopify.com/Liquid

-----------------------------------------


异步渲染模式
===================

在Node.js编程中，最令人头疼的是异步获取数据的层层嵌套，还有错综复杂的回调，