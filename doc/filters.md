Filters manipulate the output of variables. Filters look like this <nowiki>{{ variablename | filtername }}</nowiki>. For example:

<pre>{{ product.title | upcase }}</pre>
<pre class="output">YOUR PRODUCT TITLE</pre>

HTML Filters
=============

* **Img_tag|img_tag** Wraps element in &lt;img&gt; tag. 'img_tag(url, alt=&quot;&quot;)'
* **Script_tag|script_tag** Wraps element in &lt;script&gt; tag
* **Stylesheet_tag|stylesheet_tag** Wraps link in a stylesheet &lt;link&gt; tag

Math Filters
==============

* **Plus|plus** Adding input to operand 'plus: 10'
* **Minus|minus** Subtracting input from operand 'minus: 10'
* **Times|times** Multiplying input by operand 'times: 10'
* **Divided_by|divided_by** Dividing input by operand 'divided_by: 10'

Manipulation Filters
=====================

* **Append|append** Append characters to a string
* **Camelize|camelize** Converts into CamelCase, strips spaces and irregular characters
* **Capitalize|capitalize** Capitalizes a string
* **Date|date** Reformat a date
* **Paginate#The_easy_way:_default_pagination|default_pagination** Use with the paginate liquid tag to create pagination
* **Downcase|downcase** Converts a string into lowercase
* **Escape|escape** Escapes a string
* **First|first** Get the first element of the passed in array
* **Handleize|handleize** Non-word characters are stripped out and characters are lowercased
* **Highlight_active_tag|highlight_active_tag** Creats a span with the class &quot;active&quot;
* **Join|join** Joins an array with a specified character 'join: ', 
* **Last|last** Get the last element in an array
* **Replace_first|replace_first** Replace the first occurrence of a string with another
* **Remove|remove** Removes all occurrences of the substring from the input 'remove: 'red
* **Remove_first|remove_first** Removes only the first occurrence of the substring from the input 'remove_first: 'red
* **Newline_to_br|newline_to_br** Inserts a &lt;br /&gt; tag in front of every \n linebreak character.
* **Pluralize|pluralize** Can make a word plural 'pluralize: 'item', 'items
* **Prepend|prepend** Append characters to a string
* **Size|size** Return the size of an array or string
* **Split|split** Divides a string into substrings based on a delimiter, returning an array of these substrings
* **Strip_html|strip_html** Striple all html tags from string
* **Strip_newlines|strip_newlines** Removes all newlines from the input
* **Replace|replace** Will replace all occurrences of a string with another
* **Truncate|truncate** Truncate a string down to x characters
* **Truncatewords|truncatewords** Truncate string down to x words
* **Upcase|upcase** Convert a input string to uppercase
* **Weight_with_unit|weight_with_unit** Converts a weight into the unit system of the shop
* **Json|json** Converts some content into a JSON string