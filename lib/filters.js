'use strict';

/**
 * Default Filters
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */


/**
 * To string, if it's undefined or null, return an empty string
 *
 * @param {Object} text
 * @return {String}
 */
var toString = function (text) {
  return (text === null || typeof(text) === 'undefined') ? '' : String(text);
};

/*---------------------------- HTML Filters ----------------------------------*/
/**
 * Generate <img> tag
 *
 * @param {String} url
 * @param {String} alt
 * @return {String}
 */
exports.img_tag = function (url, alt) {
  return '<img src="' + exports.escape(url) + '" alt="' + exports.escape(alt || '') + '">';
};

/**
 * Generate <script> tag
 *
 * @param {String} url
 * @return {String}
 */
exports.script_tag = function (url) {
  return '<script src="' + exports.escape(url) + '"></sc' + 'ript>';
};

/**
 * Generate <link> tag
 *
 * @param {String} url
 * @param {String} media
 * @return {String}
 */
exports.stylesheet_tag = function (url, media) {
  return '<link href="' + exports.escape(url) + '" rel="stylesheet" type="text/css" media="' +
         exports.escape(media || 'all') + '" />';
};

/**
 * Generate <a> tag
 *
 * @param {String} link
 * @param {String} url
 * @param {String} title
 * @return {String}
 */
exports.link_to = function (link, url, title) {
  return '<a href="' + exports.escape(url || '') + '" title="' + exports.escape(title || '') + '">' +
         exports.escape(link) + '</a>';
};

/*-----------------------------Math Filters-----------------------------------*/
/**
 * Add
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.plus = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input + operand;
};

/**
 * Subtract
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.minus = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input - operand;
};

/**
 * Multiply
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.times = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input * operand;
};

/**
 * Divide
 *
 * @param {Number} input
 * @param {Number} operand
 * @return {Number}
 */
exports.divided_by = function (input, operand) {
  input = Number(input) || 0;
  operand = Number(operand) || 0;
  return  input / operand;
};

/**
 * Round (specify how many places after the decimal)
 *
 * @param {Number} input
 * @param {Number} point
 * @return {Number}
 */
exports.round = function (input, point) {
  point = parseInt(point, 10) || 0;
  if (point < 1) return Math.round(input);
  var n = Math.pow(10, point);
  return Math.round(input * n) / n;
};

/**
 * Round
 *
 * @param {Number} input
 * @return {Number}
 */
exports.integer = function (input) {
  return parseInt(input, 10) || 0;
};

/**
 * Generate random number such that: m <= Number < n
 *
 * @param {Number} m
 * @param {Number} n
 * @return {Number}
 */
exports.random = function (m, n) {
  m = parseInt(m);
  n = parseInt(n);
  if (!isFinite(m)) return Math.random();
  if (!isFinite(n)) {
    n = m;
    m = 0;
  }
  return Math.random() * (n - m) + m;
};

/**
 *  If input > 1 return singular, otherwise plural
 *
 * @param {Number} input
 * @param {String} singular
 * @param {String} plural
 * @return {String}
 */
exports.pluralize = function (input, singular, plural) {
  return Number(input) > 1 ? plural : singular;
};

/*-------------------------- Date and Time filters ----------------------------*/
/**
 * Take the current time in milliseconds and add 0
 *
 * @param {Number} input
 * @return {Number}
 */
exports.timestamp = function (input) {
  input = parseInt(input, 10) || 0;
  return new Date().getTime() + input;
};

/**
 * Format date/time
 * see syntax reference: http://liquid.rubyforge.org/classes/Liquid/StandardFilters.html#M000012
 *
 * @param {String} input
 * @param {String} format
 * @return {String}
 */
exports.date = function (input, format) {
  if (toString(input).toLowerCase() == 'now') {
    var time = new Date();
  } else {
    var timestamp = parseInt(input, 10);
    if (timestamp == input) {
      var time = new Date(timestamp);
    } else {
      var time = new Date(input);
    }
  }
  if (!time || !isFinite(time.valueOf())) return 'Invalid Date';
  if (!format) format = '%Y-%m-%j %H:%M:%S';
  // example: ["Wed", "Apr", "11", "2012"]
  var dates = time.toDateString().split(/\s/);
  // example: ["Wednesday,", "April", "11,", "2012"]
  var dateS = time.toLocaleDateString().split(/\s/);
  // example: ["10", "37", "44", "GMT", "0800", "(中国标准时间)"]
  var times = time.toTimeString().split(/[\s:\+]/);
  var n2 = function (n) {
    return n < 10 ? '0' + n : n;
  };
  var replace = {
    a:      dates[0],                   // week day
    A:      dateS[0],
    b:      dates[1],                   // month
    B:      dateS[1],
    c:      time.toLocaleString(),
    d:      dates[2],
    H:      times[0],                   // 24 hour
    I:      times[0] % 12,              // 12 hour
    j:      dates[2],                   // date
    m:      n2(time.getMonth() + 1),    // month
    M:      times[1],                   // minute
    p:      Number(times[0]) < 12 ? 'AM' : 'PM',
    S:      times[2],                   // second
    U:      weekNo(time),               // start on Sunday
    W:      weekNo(time, true),         // start on Monday
    w:      time.getDay(),              // week day (0-6)
    x:      time.toDateString(),
    X:      time.toTimeString(),
    y:      dates[3].substr(-2),        // year
    Y:      dates[3],
    Z:      times[4]                    // time zone
  };
  var ret = toString(format);
  for (var i in replace) {
    ret = ret.replace(new RegExp('%' + i, 'g'), replace[i]);
  }
  return ret;
};

function weekNo (now, mondayFirst) {
  var totalDays = 0;
  var years = now.getFullYear();
  var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (years % 100 === 0) {
    if (years % 400 === 0) days[1] = 29;
  } else if (years % 4 === 0) {
    days[1] = 29;
  }
  if (now.getMonth() === 0) {
    totalDays = totalDays + now.getDate();
  } else {
    var curMonth = now.getMonth();
    for (var count = 1; count <= curMonth; count++) {
      totalDays = totalDays + days[count - 1];
    }
    totalDays = totalDays + now.getDate();
  }
  // default to start on Sunday
  var week = Math.round(totalDays / 7);
  if (mondayFirst && new Date(toString(years)).getDay() === 0) week += 1;
  return week;
}

/*---------------------------Strings Filters-----------------------------*/
/**
 * Append to the end of string
 *
 * @param {String} input
 * @param {String} characters
 * @return {String}
 */
exports.append = function (input, characters) {
  if (!characters) return toString(input);
  return toString(input) + toString(characters);
};

/**
 * Prepend to the begining
 *
 * @param {String} input
 * @param {String} characters
 * @return {String}
 */
exports.prepend = function (input, characters) {
  if (!characters) return toString(input);
  return toString(characters) + toString(input);
};

/**
 * Combine to one camelized name
 *
 * @param {String} input
 * @return {String}
 */
exports.camelize = function (input) {
  input = toString(input);
  return input.replace(/[^a-zA-Z0-9]+(\w)/g, function(_, ch) {
    return ch.toUpperCase();
  });
};

/**
 * Combine to one capitalized name
 *
 * @param {String} input
 * @return {String}
 */
exports.capitalize = function (input) {
  input = toString(input);
  if (input.length < 1) return input;
  return input[0].toUpperCase() + input.substr(1);
};

/**
 * To lowercase
 *
 * @param {String} input
 * @return {String}
 */
exports.downcase = function (input) {
  return toString(input).toLowerCase();
};

/**
 * To uppercase
 *
 * @param {String} input
 * @return {String}
 */
exports.upcase = function (input) {
  return toString(input).toUpperCase();
};

/**
 * Escape for use in HTML
 *
 * @param {String} input
 * @return {String}
 */
exports.escape = function (input) {
  return toString(input)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Unescape HTML
 *
 * @param {String} input
 * @return {String}
 */
exports.unescape = function (input) {
  return toString(input)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
};

/**
 * Combine to hyphen separated word: 'this-is-a-book'
 *
 * @param {String} input
 * @return {String}
 */
exports.handleize = function (input) {
  return toString(input).replace(/[^0-9a-zA-Z ]/g, '').replace(/[ ]+/g, '-').toLowerCase();
};

/**
 * Replace the first occurrence of substring with replacement
 *
 * @param {String} input
 * @param {String} substring
 * @param {String} replacement
 * @return {String}
 */
exports.replace_first = function (input, substring, replacement) {
  return toString(input).replace(substring, replacement);
};

/**
 * Replace all occurrences of substring with replacement
 *
 * @param {String} input
 * @param {String} substring
 * @param {String} replacement
 * @return {String}
 */
exports.replace = function (input, substring, replacement) {
  input = toString(input);
  while (input.indexOf(substring) > -1) {
    input = input.replace(substring, replacement);
  }
  return input;
};

/**
 * Remove all occurrences of substring
 *
 * @param {String} input
 * @param {String} substring
 * @return {String}
 */
exports.remove = function (input, substring) {
  return exports.replace(input, substring, '');
};

/**
 * Remove the first occurrence of substring
 *
 * @param {String} input
 * @param {String} substring
 * @return {String}
 */
exports.remove_first = function (input, substring) {
  return exports.replace_first(input, substring, '');
};

/**
 * Replace all newline characters with "<br>"
 *
 * @param {String} input
 * @return {String}
 */
exports.newline_to_br = function (input) {
  return toString(input).replace(/\n/img, '<br>');
};

/**
 * Split the string at each occurrence of '-' (returns an array)
 *
 * @param {String} input
 * @param {String} delimiter
 * @return {String}
 */
exports.split = function (input, delimiter) {
  if (!delimiter) delimiter = '';
  return toString(input).split(delimiter);
};

/**
 * Return the string length
 *
 * @param {array|string} input
 * @return {String}
 */
exports.size = function (input) {
  if (!input) return 0;
  var len = input.length;
  return len > 0 ? len : 0;
};

/**
 * Remove all HTML tags
 *
 * @param {String} text
 * @return {String}
 */
exports.strip_html = function (text) {
  return toString(text).replace(/<[^>]*>/img, '');
};

/**
 * Remove all newline characters
 *
 * @param {String} input
 * @return {String}
 */
exports.strip_newlines = function (input) {
  return toString(input).replace(/[\r\n]+/g, '');
};

/**
 * Return only the first N characters
 *
 * @param {String} input
 * @param {Number} n
 * @return {String}
 */
exports.truncate = function (input, n) {
  n = parseInt(n, 10);
  if (!isFinite(n) || n < 0) n = 100;
  return toString(input).substr(0, n);
};

/**
 * Return only the first N words
 *
 * @param {String} input
 * @param {Number} n
 * @return {String}
 */
exports.truncatewords = function (input, n) {
  n = parseInt(n, 10);
  if (!isFinite(n) || n < 0) n = 15;
  return toString(input).trim().split(/ +/).slice(0, n).join(' ');
};

/**
 * Reverse the characters in the string
 *
 * @param {string|array} arr
 * @return {string|array}
 */
exports.reverse = function (arr) {
  return Array.isArray(arr) ? arr.reverse() : toString(arr).split('').reverse().join('');
};

/**
 * Extracts parts of a string, beginning at the character at the specified posistion 'start',
 * and returns the specified number of characters 'length'.
 *
 * @param {String} input
 * @param {Number} start
 * @param {Number} length
 * @return {String}
 */
exports.substr = function (input, start, length) {
  return toString(input).substr(start, length);
};

/**
 * Search a substring, return its index position
 *
 * @param {string|array} arr
 * @param {Object} searchvalue
 * @param {Number} fromindex
 * @return {Number}
 */
exports.indexOf = function (arr, searchvalue, fromindex) {
  if (!Array.isArray(arr)) arr = toString(arr);
  return arr.indexOf(searchvalue, fromindex);
};

/**
 * If input is empty, default returns value, otherwise, the input.
 * Can be used with strings, arrays, and hashes.
 *
 * @param  {string|array|object} input
 * @param  {string|array|object} value
 * @return {string|array|object}
 */
exports.default = function(input, value) {
  return (input && input.length > 0)
    ? toString(input)
    : toString(value);
};


/*----------------------- Arrays and Objects Filters -------------------------*/

function objectGetKeys (obj) {
  return ((obj && typeof obj === 'object') ? Object.keys(obj) : []);
}

function getFirstKey (obj) {
  if (Array.isArray(obj)) {
    return 0;
  } else {
    var keys = objectGetKeys(obj);
    return keys[0] || '';
  }
};

function getLastKey (obj) {
  if (Array.isArray(obj)) {
    return obj.length - 1;
  } else {
    var keys = objectGetKeys(obj);
    return keys.pop() || '';
  }
};

/**
 * Return an array of the object's keys
 *
 * @param {Object} input
 * @return {Array}
 */
exports.keys = function (input) {
  try {
    return objectGetKeys(input);
  } catch (err) {
    return [];
  }
};

/**
 * Return the first element of an array
 *
 * @param {Array} array
 * @return {Object}
 */
exports.first = function (array) {
  return array && array[getFirstKey(array)];
};

/**
 * Return the last element of an array
 *
 * @param {Array} array
 * @return {Object}
 */
exports.last = function (array) {
  return array && array[getLastKey(array)];
};

/**
 * Join the array's elements into a string
 *
 * @param {Array} input
 * @param {String} segmenter
 * @return {String}
 */
exports.join = function (input, segmenter) {
  if (!segmenter) segmenter = ' ';
  if (Array.isArray(input)) {
    return input.join(segmenter);
  } else {
    return '';
  }
};

/**
 * Return a JSON string of the object
 *
 * @param {Object} input
 * @return {String}
 */
exports.json = function (input) {
  try {
    var ret = JSON.stringify(input);
  } catch (err) {
    return '{}';
  }
  return typeof ret !== 'string' ? '{}' : ret;
};

/**
 * Get an item of the Object by property name
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Object}
 */
exports.get = function(obj, prop){
  if (!obj) obj = {};
  return obj[prop];
};

/**
 * Take the specified property of each element in the array, returning a new array
 *
 * @param {Array} arr
 * @param {String} prop
 * @return {Array}
 */
exports.map = function (arr, prop) {
  if (!Array.isArray(arr)) return [];
  return arr.map(function(obj){
    return obj && obj[prop];
  });
};

/**
 * Sort the array's elements by asc or desc order
 *
 * @param {Array} arr
 * @param {Number} order
 * @return {Array}
 */
exports.sort = function (arr, order) {
  if (!Array.isArray(arr)) return [];
  order = toString(order).trim().toLowerCase();
  var ret1 = order === 'desc' ? -1 : 1;
  var ret2 = 0 - ret1;
  return arr.sort(function (a, b) {
    if (a > b)  return ret1;
    if (a < b)  return ret2;
    return 0;
  });
};

/**
 * Sort the array's elements by each element's specified property
 *
 * @param {Array} obj
 * @param {String} prop
 * @param {Number} order
 * @return {Array}
 */
exports.sort_by = function (obj, prop, order) {
  if (!Array.isArray(obj)) return [];
  order = toString(order).trim().toLowerCase();
  var ret1 = order === 'desc' ? -1 : 1;
  var ret2 = 0 - ret1;
  return Object.create(obj).sort(function (a, b) {
    a = a[prop];
    b = b[prop];
    if (a > b) return ret1;
    if (a < b) return ret2;
    return 0;
  });
};

/*------------------------------- Other Filters ------------------------------*/
/**
 * Get page count of the items when paginated
 *
 * @param {Number} count
 * @param {Number} size
 * @param {Number} page
 * @listurn {Array}
 */
exports.pagination = function (count, size, page) {
  if (count % size === 0) {
    var maxPage = parseInt(count / size, 10);
  } else {
    var maxPage = parseInt(count / size, 10) + 1;
  }
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  page = parseInt(page);

  var list = [page - 2, page - 1, page, page + 1, page + 2];
  for (var i = 0; i < list.length;) {
    if (list[i] < 1 || list[i] > maxPage) {
      list.splice(i, 1);
    } else {
      i++;
    }
  }
  if (list[0] !== 1) {
    list.unshift('...');
    list.unshift(1);
  }
  if (list[list.length - 1] < maxPage) {
    list.push('...');
    list.push(maxPage);
  }

  var ret = {
    current:    page,
    next:       page + 1,
    previous:   page - 1,
    list:       list
  };
  if (ret.next > maxPage) ret.next = maxPage;
  if (ret.previous < 1)   ret.previous = 1;

  return ret;
};
