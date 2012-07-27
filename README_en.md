About TinyLiquid
===============

**TinyLiquid** is a **JavaScript** compatible **Liquid** template syntax template engine. Has the following characteristics:
  
*  Powerful and flexible syntax: the template which you can use to control such as conditional, loop, assignment, function call Syntax Notation One
  
*  Rendering speed: currently only do a simple test, and the speed ejs more than four times the [performance test results](https://github.com/leizongmin/tinyliquid/blob/master/benchmark/result.txt)

*  Asynchronous rendering mode: to resolve the problem of asynchronous JavaScript programs access to multiple data, it is difficult to control

*  Can be run on the browser side and Node.js environment



Download & Installation
===============

The latest version **v0.0.8** to get TinyLiquid module in the following ways:

*  NPM installation: **npm install tinyliquid**

*  git: **git clone git://github.com/leizongmin/tinyliquid.git**
  
*  In the browser: `<script src="https://raw.github.com/leizongmin/tinyliquid/master/build/target/tinyliquid.min.js"></script>`

*  In Express: `app.register('.html', tinyliquid.__express());`
   [sample](https://github.com/leizongmin/tinyliquid/blob/master/test/express)


Template Syntax
==============

### Output Variable: {{name}}

Example:

    Hello, {{ name }}
    Hello, {{ name | escape }}  // variable value to escape
    

### Functions (Filters): {{value|method}}

Example:

    Uppercase: {{ name | upcase }}
    The time now is: {{ "now" | date: "%H:%M:%S" }}
    Nesting: {{ name |  upcase | split: '-' }}
    

### Conditional: {%if condition%} ... {%else%} ... {%endif%}

Example:

    {% if name == "old mine" %} Hello {{ name }} {% endif %}
    
    {% unless name contains "Ray" %} not mine! {% endunless %}
    
    {% if you.age < 18 %}
      You're too young
    {% else %}
      Welcome to ...
    {% endif %}

Note: The conditional operator can support equal to (==), not equal to (!= or <>), greater than (>), less than (<), greater than or equal to (>=), less than or equal to (<=), contains the string (contains).


### Cycling: {%for item in array%} ... {%endfor%}  {%tablerow item in array%} ... {%endtablerow%}

Example:

    {% for item in array %}
      {{ item }}
    {% endfor %}
    
    {% for item in array offset:2 limit:3 %}
      {{ item }}
    {% endfor %}
    
    {% tablerow item in array cols:4 %}
      {{ item }}
    {% endtablerow %}
    

### Variable assignment:  {%assign name = "value"%}

Example:

    {% assign name = "value" %}
    
    {% assign name = value | upcase %}
    

### Save output to variable: {%capture name%} ... {%endcapture%}

Example:

    {% capture name %}
      {% for item in array %}
        {% item %}
      {% endfor %}
    {% endcapture %}

    The output is saved to the variable *name* and you can output the results using: `{{ name }}`
    

### Constant loop: {%cycle 'one','two','three'%}

Example:

    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %},
    {% cycle 'one', 'two', 'three' %} 
    
Output: one,two,three,one

    
### Include file: {%include "filename"%}

Example:

    {% include "header" %}
    
    {% include "header" with data %}
    
    
### Do not interpret: {%raw%} ... {%endraw%}

Example:

    {% raw %}{{ 5 | plus: 6 }}{% endraw %} renders: '{{ 5 | plus: 6 }}' not '11'.

    
### Comment (omitted from output): {%comment%} ... {%endcomment%}

Example:

    Hello world. {% comment %} Now this is a single-line comment {% endcomment %} <br />
    Hello world,
    I think I'm gonna be happy today. {% comment %} Now this is a
    multi-line comment that should be ignored too,
    just like the single-line comment {% endcomment %}
    
Output:

    Hello world.
    Hello world, I think I'm gonna be happy today.
    
    
Syntax reference can be found here: http://wiki.shopify.com/Liquid



Usage
================

### As a Module

  In Node:
  
    var tinyliquid = require('tinyliquid');
    
  In the Browser: (Global variable **TinyLiquid** is exposed)
  
    <!-- This file can be the source inside the build/target directory -->
    <script src="tinyliquid.min.js"></script>
    <script>
      var rendered = TinyLiquid.render('{{a}}', {a: 123});
    </script>
    
    
### Compile the template: compile(text, [options])

    var tinyliquid = require('tinyliquid');
    
    // In the normal way
    var render = tinyliquid.compile('Hello {{ name }}');
    
    // If your template uses the **include** tag, you need to specify the files option
    var options = {
      files:  {
        'filename':  'content'
      }
    };
    var render = tinyliquid.compile('Hello {{ name }}', options);
    
    // By default, *compile()* returns packaged code. If you need the original js code,
    // specify the option *original*
    options.original = true;
    var render = tinyliquid.compile('Hello {{ name }}', options);
    
    
### Advanced compiler: compileAll(files, [options])

    var tinyliquid = require('tinyliquid');
    
    var files = {
      'index':  fs.readFileSync('index.html'),
      'header': fs.readFileSync('header.html'),
      'bottom': fs.readFileSync('bottom.html'),
    };
    var options = {original: true};
    
    var renderers = tinyliquid.compileAll(files, options);
    // Returns {index: [Function], header: [Function], bottom: [Function]}
    
    
### Rendering: render(data, [filters]);

    var tinyliquid = require('tinyliquid');
    var render = tinyliquid.compile('Hello {{ name }}');
    
    // In the normal way
    var text = render(data);
    
    // Custom filters
    var filters = {
      upcase: function(s) {
        return String(s).toUpperCase();
      }
    };
    var text = render(data, filters);
    
    // If option *original = true* is specified, then the *filters* parameters must be specified.
    // for default filters, use Tinyliquid.filters

    
### Advanced Rendering: advRender(render, models, options, callback)

    var tinyliquid = require('tinyliquid');
    var render = tinyliquid.compile('Hello {{ name }}');
    
    // define models
    var models = {
      name:   function(env, callback) {
        setTimeout(function() {
          callback(null, 'Hello world');
        }, 100);
      }
    };
    
    // specify options
    var options = {
      parallel: false,                  // specify true for parallel execution (defaults to false)
      filters:  tinyliquid.filters,     // optionally, add custom filters
      env:      {},                     // environment variables, namely, the *models* function parameters
    };
    
    tinyliquid.advRender(render, models, options, function(err, text) {
      if (err)
        console.error(err);
      else
        console.log(text);
    });
    

### Use the recommended

  TinyLiquid has no built-in caching mechanism, so when in use, if to call render multiple times, you
  should manually cache the compiled rendering function.



Asynchronous rendering mode
===================

In the Node.js programming, the most troubling is the asynchronous access to data layers of nested, complex callback
and TinyLiquid of automatic access to data can solve the problem. To use different ways to get data asynchronously
example:

*  Common way: [https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/normal.js](https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/normal.js)

*  Use *Jscex* way: [https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/jscex.js](https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/jscex.js)

*  Use *EventProxy* way: [https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/eventproxy.js](https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/eventproxy.js)

*  Use the TinyLiquid built-in *advRender()* way: [https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/advrender.js](https://github.com/leizongmin/tinyliquid/blob/master/test/different_ways/advrender.js)
    
Reasons to use TinyLiquid:

*  To avoid program of multi-layer nested

*  Do not need to install more modules

*  TinyLiquid template need to use the data only, will be implemented only for data manipulation, so you can define a
   public access data interface when rendering the page, TinyLiquid will need to obtain the corresponding data, and not
   to obtain The template does not require data.
  
*  Write less code
  
  
    
## Built-in functions (filters)

Built-in functions see: [lib/filters.js](tinyliquid/blob/master/lib/filters.js)

### HTML Tags

*  {{'url' | **img_tag**: 'alt'}}  generate `<img>` tag

*  {{'url' | **script_tag**}}  Generate `<script>` tag

*  {{'url' | **stylesheet_tag**: 'media'}}  Generate `<link>` tag

*  {{'link' | **link_to**: 'url', 'title'}}  Generate `<a>` tag

### Math

*  {{123 | **plus**: 456}}  Add

*  {{123 | **minus**: 456}}  Subtract

*  {{123 | **times**: 456}}  Multiply

*  {{123 | **divided_by**: 456}}  Divide

*  {{1.23 | **round**: 2}}  Round (specify how many places after the decimal)

*  {{1.23 | **integer**}}  Round

*  {{1 | **random**: 2}}  Generate random number such that: 1<=N<2

*  {{N | **pluralize**: 'item', 'items'}}  If N > 1 return items, otherwise item

### Strings

*  {{'abc' | **append**: 'd'}}  Append to the end of string

*  {{'abc' | **prepend**: 'd'}}  Prepend to the begining

*  {{'a b c' | **camelize**}}  Combine to one camelized name

*  {{'a b c' | **capitalize**}}  Combine to one capitalized name

*  {{'ABC' | **downcase**}}  To lowercase

*  {{'abc' | **upcase**}}  To uppercase

*  {{'&lt;a&gt;' | **escape**}}  Escape for use in HTML

*  {{'this is a book' | **handleize**}}  Combine to hyphen separated word: 'this-is-a-book'

*  {{'abcabc' | **replace_first**: 'a', 'x'}}  Replace the first occurrence of 'a' with 'x'

*  {{'abcabc' | **replace**: 'a', 'x'}}  Replace all occurrences of 'a' with 'x'

*  {{'abcabc' | **remove_first**: 'a'}}  Remove the first occurrence of 'a'

*  {{'abcabc' | **remove**: 'a'}}  Remove all occurrences of 'a'

*  {{'abc\nabc' | **newline_to_br**}}  Replace all newline characters with <br>
 
*  {{'a-b-c' | **split**: '-'}}  Split the string at each occurrence of '-' (returns an array)

*  {{'abcd' | **size**}}  Return the string length

*  {{'<span>123</span>' | **strip_html**}} Remove all HTML tags; returns: '123'

*  {{'abc\nabc' | **strip_newlines**}} Remove all newline characters

*  {{'abcdefg' | **truncate**: 3}}  Return only the first N characters

*  {{'this is a book' | **truncatewords**: 2}}  Return only the first N words

*  {{'abcdef' | **reverse**}}  Reverse the characters in the string

### Date and Time

*  {{0 | **timestamp**}} Take the current time in milliseconds and add 0

*  {{'now' | **date**: '%H:%M:%S'}} Format date/time (see [syntax reference](http://liquid.rubyforge.org/classes/Liquid/StandardFilters.html#M000012))

### Arrays and Objects

*  {{obj | **keys**}}  Return an array of the object's keys

*  {{array | **first**}}  Return the first element of an array

*  {{array | **last**}}  Return the last element of an array

*  {{array | **join**: ','}}  Join the array's elements into a string

*  {{array | **size**}}  Return the array's length

*  {{obj | **json**}}  Return a JSON string of the object

*  {{obj | **get**: 'prop'}}  Get an item of the Object by property name

*  {{array | **reverse**}}  Reverse the order of the array

*  {{array | **map**: 'prop'}}  Take the specified property of each element in the array, returning a new array

*  {{array | **sort**: 'desc'}}  Sort the array's elements by *asc* or *desc* order

*  {{array | **sort_by**: 'prop', 'desc'}}  Sort the array's elements by each element's specified property

### Other

*  {{count | **pagination**: size, currentPage}}  Get page *count* of the items when paginated



License
===============

You can feel free to use and distribute it under the premise of compliance with the **MIT Licence**.

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