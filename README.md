此模板引擎实现了Liquid中定义的大部分语法标记。
======================

与ejs模板引擎执行速度对比
================
  
    200*200个数据的循环：
  
    ejs编译： 0.36 ms
    ejs渲染： 504.27 ms

    本引擎编译： 0.84 ms
    本引擎渲染： 165.69 ms



= Using liquid markup =

Liquid is the engine of Shopify's customization. It’s a small and fast template language which is quick to learn but very powerful for full customization.

== Basics ==

There are two types of markup in liquid: Output and Tag.

<ul>
<li><p>Output is surrounded by</p>
<pre> {{ two curly brackets }} </pre></li>
<li><p>Tags are surrounded by</p>
<pre> {% a curly bracket and a percent %} </pre></li></ul>

Output blocks will always be replaced with the data which they reference. If your liquid template has a product object exposed to it you can print the name of the product to the screen by referencing {{ product.title }}.

Tags drive the logic of templates. They are responsible for loops and branching logic such as If / Else.

== Output ==

Here is a simple example of Output:

<pre>Hello {{name}}          
Hello {{user.name}}
Hello {{ 'tobi' }}</pre>
=== Filters ===

Output markup takes [[FilterReference|filters]]. Filters are simple methods. The first parameter is always the output of the left side of the filter. The return value of the filter will be the new left value when the next filter is run. When there are no more filters the template will receive the resulting string.

<pre>The word &quot;tobi&quot; in uppercase: {{ 'tobi' | upcase }}
The word &quot;tobi&quot; has {{ 'tobi' | size }} letters!
Change &quot;Hello world&quot; to &quot;Hi world&quot;: {{ 'Hello world' | replace: 'Hello', 'Hi' }}
The date today is {{ 'now' | date: &quot;%Y %b %d&quot; }}</pre>
[[Image:Filterchain.jpg|[[Image:/upload/8/8c/Filterchain.jpg|Image:Filterchain.jpg]]]]

The code above results in the following:

<pre>The word &quot;tobi&quot; in uppercase: TOBI
The word &quot;tobi&quot; has 4 letters!
Change &quot;Hello world!&quot; to &quot;Hi world!&quot;: Hi world
The date today is 2009 Mar 02 [depends on when you're viewing this document]</pre>
== Tags ==

Tags are for the logic in your template. Not to be confused with [[Help:Products#Adding_New_Products|product tags]].

Here is a list of currently supported tags:

=== Comments ===

Comments are enclosed with a &quot;{% comment %}&quot; opening tag and a &quot;{% endcomment %}&quot; closing tag. As in other languages, all characters enclosed by these tags are ignored and will not be parsed by the language. These tags also work for multi-line comments.

<pre>Hello world. {% comment %} Now this is a single-line comment {% endcomment %} &lt;br /&gt;
Hello world,
I think I'm gonna be happy today. {% comment %} Now this is a
multi-line comment that should be ignored too,
just like the single-line comment {% endcomment %}</pre>
The code above will result in:

<pre>Hello world.
Hello world, I think I'm gonna be happy today.</pre>
=== No Liquid Zone: the raw tag ===

Any Liquid tags between a <tt>{% raw %}</tt> opening tag and a <tt>{% endraw %}</tt> closing tag will be ignored by the Liquid parser. What is enclosed by the raw tags is sent back to the browser, this differentiates raw tags from comment tags. Use raw tags to wrap JavaScript templates that use curly braces. [[Image:New.gif|[[Image:/upload/e/e0/New.gif|Image:New.gif]]]]

<pre>{% raw %}{{ 5 | plus: 6 }}{% endraw %} is equal to {{ 5 | plus: 6 }}.</pre>
The code above will result in:

<pre>{{ 5 | plus: 6 }} is equal to 11.</pre>
=== If / Else / Unless ===

If else should be well known from any language imaginable. Liquid allows you to write simple expressions in the if. Unless is the opposite of If and is useful if you only need to check that something isn't true.

'''PLEASE NOTE: Shopify does not export a user variable. This example is for conditional logic demonstration purposes only.'''

<pre>{% if user %}
  Hi {{ user.name }}
{% endif %}

{% if user.name == 'tobi' %}
  hi tobi
{% endif %}

{% if user.name != 'tobi' %} 
  hi non-tobi
{% endif %}

{% unless user.name == 'tobi' %} 
  hi non-tobi
{% endunless %}

{% if user.name == 'tobi' or user.name == 'marc' %} 
  hi marc or tobi
{% endif %}

{% if user.name == 'tobi' and user.last_name == 'scottish' %} 
  hi tobi scottish
{% endif %}

{% if user.name contains 'tobi' %} 
  hi tobias
{% endif %}

{% if user.creditcard == nil %}
   poor sob
{% endif %}

{% if user.payments == empty %}
   you haven't paid yet! 
{% endif %}

{% if user.age &gt; 18 %}
   Login here
{% else %}
   Sorry, you are too young
{% endif %}

{% unless user.age &gt; 18 %}
  Sorry, you are too young
{% else %}
  Login here
{% endunless %}
</pre>
=== Case Statement ===

If you need more than one condition you can use the Case Statement

<pre>{% case condition %} 
  {% when 1 %} 
    hit 1 
  {% when 2 %} 
    hit 2 
  {% else %} 
    hit else
{% endcase %} </pre>
'''Example:'''

<pre>{% case template %}
  {% when 'index' %}
     Welcome
  {% when 'product' %}
     {{ product.vendor | link_to_vendor }} / {{ product.title }}
  {% else %}
     {{ page_title }}
{% endcase %}</pre>

=== For loops ===

Liquid allows for loops over collections

<pre>  {% for item in array %} 
    {{ item }}
  {% endfor %} </pre>
During every for loop there are following helper variables available for extra styling needs:

<pre> forloop.length       # =&gt; length of the entire for loop
 forloop.index        # =&gt; index of the current iteration 
 forloop.index0       # =&gt; index of the current iteration (zero based) 
 forloop.rindex       # =&gt; how many items are still left?
 forloop.rindex0      # =&gt; how many items are still left? (zero based)
 forloop.first        # =&gt; is this the first iteration?
 forloop.last         # =&gt; is this the last iteration? </pre>
There are several attributes you can use to influence which items you receive in your loop

'''limit''' lets you restrict how many items you get '''offset''' lets you start the collection with the nth item.

<pre>  # array = [1,2,3,4,5,6]
  {% for item in array limit:2 offset:2 %} 
    {{ item }}
  {% endfor %} 
  # results in 3,4 </pre>
Instead of looping over an existing collection, you can define a range of numbers to loop through. The range can be defined by both literal and variable numbers:

<pre>  # if item.quantity is 4...
  {% for i in (1..item.quantity) %}
    {{ i }}
  {% endfor %}
  # results in 1,2,3,4</pre>
=== Tables ===

Liquid can create table rows and cells for you (you still need to wrap a table tag around the tablerow instruction):

<pre>  {% tablerow item in items cols: 3 limit: 12 %}
    {{ item.variable }}
  {% endtablerow %}</pre>
You can also find out whether a table cell is the first or last column in a row or directly query the column number:

<pre> tablerowloop.length       # =&gt; length of the entire for loop
 tablerowloop.index        # =&gt; index of the current iteration 
 tablerowloop.index0          # =&gt; index of the current iteration (zero based) 
 tablerowloop.rindex       # =&gt; how many items are still left?
 tablerowloop.rindex0      # =&gt; how many items are still left? (zero based)
 tablerowloop.first        # =&gt; is this the first iteration?
 tablerowloop.last         # =&gt; is this the last iteration? 
 tablerowloop.col          # =&gt; index of column in the current row
 tablerowloop.col0         # =&gt; index of column in the current row (zero based)
 tablerowloop.col_first    # =&gt; is this the first column in the row?
 tablerowloop.col_last     # =&gt; is this the last column in the row?</pre>
<pre>  {% tablerow item in items cols: 3 %}
    {% if tablerowloop.col_first %}
      First column: {{ item.variable }}
    {% else %}
      Different column: {{ item.variable }}
    {% endif %}
  {% endtablerow %}</pre>
=== Variable Assignment ===

You can store data in your own variables, to be used in output or other tags as desired. The simplest way to create a variable is with the '''assign''' tag, which has a pretty straightforward syntax:

<pre>{% assign name = 'freestyle' %}
{% for t in collections.tags %}{% if t == name %}
  &lt;p&gt;Freestyle!&lt;/p&gt;
{% endif %}{% endfor %}</pre>
Another way of doing this would be to assign true/false values to the variable:

<pre>{% assign freestyle = false %}
{% for t in collections.tags %}{% if t == 'freestyle' %}
  {% assign freestyle = true %}
{% endif %}{% endfor %}
{% if freestyle %}
  &lt;p&gt;Freestyle!&lt;/p&gt;
{% endif %}</pre>
If you want to combine a number of strings into a single string and save it to a variable, you can do that with the '''capture''' tag. This tag is a block which &quot;captures&quot; whatever is rendered inside it and assigns it to the given variable instead of rendering it to the screen. Here's how it works:

<pre>  {% capture attribute_name %}{{ item.title | handleize }}-{{ i }}-color{% endcapture %}

  &lt;label for=&quot;{{ attribute_name }}&quot;&gt;Color:&lt;/label&gt;
  &lt;select name=&quot;attributes[{{ attribute_name }}]&quot; id=&quot;{{ attribute_name }}&quot;&gt;
    &lt;option value=&quot;red&quot;&gt;Red&lt;/option&gt;
    &lt;option value=&quot;green&quot;&gt;Green&lt;/option&gt;
    &lt;option value=&quot;blue&quot;&gt;Blue&lt;/option&gt;
  &lt;/select&gt;</pre>
=== Include Statement ===



== Introduction ==

The <tt>include</tt> tag lets you insert one of your theme's snippets into another layout, template, or snippet.

== Usage ==

Given a snippet called <tt>foo.liquid</tt> that you have saved in your snippets folder:

<pre>{% include 'foo' %}</pre>
This will render foo.liquid with access to all the currently assigned variables and insert it within the parent template at the include tag's position. The optional <tt>with</tt> clause lets you specify a value which is bound to the snippet's name within the snippet's context:

<pre>{% include 'foo' with 'bar' %}</pre>
== Examples ==

Within a snippet called <tt>color.liquid</tt>:

<pre>color: '{{ color }}'
shape: '{{ shape }}'</pre>
Within the <tt>theme.liquid</tt> layout:

<pre>{% assign shape = 'circle' %}
{% include 'color' %}
{% include 'color' with 'red' %}
{% include 'color' with 'blue' %}
{% assign shape = 'square' %}
{% include 'color' with 'red' %}</pre>
Output:

<pre>
color: ''
shape: 'circle'
color: 'red'
shape: 'circle'
color: 'blue'
shape: 'circle'

color: 'red'
shape: 'square'</pre>

