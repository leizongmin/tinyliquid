Logic are conditional Liquid statements.

Example of a logic statement
============================

Lets say we are working on product.liquid template and want to display the message &quot;Free shipping&quot;, but only on products whose price is greater than $100. Since the product will either have a price greater than $100 or less than $100, the if logic statement is the most appropriate statement to use...

<pre>{% if product.price &gt; 100?%}
  Free Shipping
{% else?%}
  No free shipping
{% end if?%}</pre>
Notice how we use the {% %} logic tags and not the {{ }} output tags

Operators
=========

You can use different operators when using logic statements...

* '''==''' - Equal
* '''!=''' - Not equal
* '''&gt;''' - Bigger than
* '''&lt;''' - Smaller than
* '''&gt;=''' - Bigger than or equal
* '''&lt;=''' - Less than or equal
* '''or''' - either this or that
* '''and''' - must be this and that

If/Else Logic
=============

You can use use 3 statements inside of your if statement: {% if %}, {% elsif %} or {% else %}. Let's go through some examples:

Simple if statement

<pre>{% if product.price &gt; 5000?%}
  Free shipping
{% endif?%}</pre>
if/else statement

<pre>{% if product.available?%}
  This product is available
{% else?%}  
  Sorry, this product is not available
{% endif?%}</pre>
if/elseif/else statement

<pre>{% if product.price &gt; 5000?%}
  Free shipping
{% elsif product.price == 5000?%}
  half price shipping
{% else?%}  
  Shipping is $20
{% endif?%}</pre>

Case Statements
===============

If you need to test more than one condition. Here is the liquid syntax:

<pre>{% case condition?%} 
  {% when 1?%} 
    red
  {% when 2?%} 
    blue
  {% else?%} 
    green
{% endcase?%} </pre>
Example case statement...

<pre>{% case template?%}
  {% when 'index'?%}
     Welcome
  {% when 'product'?%}
     {{ product.vendor | link_to_vendor }} / {{ product.title }}
  {% else?%}
     {{ page_title }}
{% endcase?%}</pre>

Cycle
=========

If you need to alternate between things. Example of a cycle statement....

<pre>{% cycle 'one', 'two', 'three'?%}
 
{% cycle 'one', 'two', 'three'?%}
 
{% cycle 'one', 'two', 'three'?%}
 
{% cycle 'one', 'two', 'three'?%} </pre>
<pre class="output">one
two
three
one</pre>
You can give a cycle a group name. This is useful if you use multiple cycles in your template...

<pre>{% cycle 'group 1': 'one', 'two', 'three'?%}
 
{% cycle 'group 1': 'one', 'two', 'three'?%}
 
{% cycle 'group 2': 'one', 'two', 'three'?%}
 
{% cycle 'group 2': 'one', 'two', 'three'?%} </pre>
<pre class="output">one
two 
one
two</pre>

For Loop
===========

A loop is used when you need to repeat something multiple times. Here is an example of the liquid syntax

<pre>{% for item in array?%} 
  do something
{% endfor?%} </pre>
There is also some loop objects you can use to help style your layout

* '''forloop.length''' - length of the entire for loop
* '''forloop.index''' - index of the current iteration
* '''forloop.index0''' - index of the current iteration (zero based)
* '''forloop.rindex''' - how many items are still left?
* '''forloop.rindex0''' - how many items are still left? (zero based)
* '''forloop.first''' - is this the first iteration?
* '''forloop.last''' - is this the last iteration?

You can use 2 attributes to change how your loop works:

* '''Limit''' - restricts the number of times the loop repeats
* '''Offset''' - lets you start the loop on whatever number you want

Lets say we are viewing a collection with a total of 5 products (a,b,c,d,e). Using the example below...

<pre>{% for product in collections.frontpage.products limit:2 offset:2?%}
  Product Name: {{ product.name }}
{% endfor?%}</pre>
<pre class="output">Product Name: c
Product Name: d</pre>
We can also define a range of numbers to loop through. The range can be define literally or variable numbers. Here is an example if item.quantity is 4...

<pre>{% for i in (1..item.quantity)?%}
  '''Bold text'''{{ i }}
{% endfor?%}</pre>
<pre class="output">1, 2, 3, 4</pre>

Tables
=========

Liquid can automatically generate table row and cells. Use this syntax:

<pre>{% tablerow product in collection.frontpage cols: 3 limit: 12?%}
  {{ product.name }}
{% endtablerow?%}</pre>
There are two attributes you can use with tablerow

* '''Limit:''' limits the number of whatever you are generating (in the exampel above it's products)
* '''Cols:''' specifies the number of columns you want in your table

<br />
 You can also use a series of tablerowloop objects to help style your design:

* '''tablerowloop.length''' - length of the entire for loop
* '''tablerowloop.index''' - index of the current iteration
* '''tablerowloop.index0''' - index of the current iteration (zero based)
* '''tablerowloop.rindex''' - how many items are still left?
* '''tablerowloop.rindex0''' - how many items are still left? (zero based)
* '''tablerowloop.first''' - is this the first iteration?
* '''tablerowloop.last''' - is this the last iteration?
* '''tablerowloop.col''' - index of column in the current row
* '''tablerowloop.col0'''- index of column in the current row (zero based)
* '''tablerowloop.col_first''' - is this the first column in the row?
* '''tablerowloop.col_last''' - is this the last column in the row?

Example on how to use tablerowloop.col_first:

<pre>{% tablerow product in collections.frontpage.products cols: 3?%}
  {% if col_first?%}
    This is the first column
  {% else?%}
    This is not the first column
  {% endif?%}
{% endtablerow?%}</pre>

Variable Assignment
===================

You can store data in your own variables to be used in output or other tags. The easiest way to create a variable is the assign tag which looks like this...

<pre>{% assign name = 'bananas'?%}
{% for product in collections.frontpage.products?%}
  {% if product.title == name?%}    
    The product name matches my variable!
  {% endif?%}
{% endfor?%}</pre>
You can also store a true or false value in your variable:

<pre>  {% assign bananas = false?%}

  {% for product in collections.frontpage.products?%}
    {% if product.name == 'bananas'?%}
      {% assign bananas = true?%}
    {% endif?%}
  {% endfor?%}
  
  {% if bananas?%}
  Yes we have a banana!
  {% endif?%} </pre>
You can also store a number in a variable with assign:

<pre>  {% assign number = 3?%}

  {% for product in collections.frontpage.products?%}
    {% if forloop.index == number?%}
      This is the 3rd iteration!
    {% endif?%}
  {% endfor?%} </pre>
If you want to combine a number of strings into a single string and save it to a variable, you can do that with the capture tag. This tag is a block which &quot;captures&quot; whatever is rendered inside it and assigns it to the given variable instead of rendering it to the screen. Here's how it works:

<pre>{% capture attribute_name?%}{{ product.title | handleize }}-{{ i }}-color{% endcapture?%}
  &lt;label for=&quot;{{ attribute_name }}&quot;&gt;Color:&lt;/label&gt;
  &lt;select name=&quot;attributes[{{ attribute_name }}]&quot; id=&quot;{{ attribute_name }}&quot;&gt;
    &lt;option value=&quot;red&quot;&gt;Red&lt;/option&gt;
    &lt;option value=&quot;green&quot;&gt;Green&lt;/option&gt;
    &lt;option value=&quot;blue&quot;&gt;Blue&lt;/option&gt;
  &lt;/select&gt;</pre>
'''Note''': what you store in a variable using '''capture''' is always a string (text). You have to remember this!

<pre>  {% capture value?%}10{% endcapture?%}
  {% if value == 10?%}
  This will never be output.
  {% endif?%}
  {% if value == '10'?%}
  This will be output.
  {% endif?%}</pre>
