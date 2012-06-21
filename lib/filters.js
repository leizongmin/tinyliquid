'use strict';

/**
 * 内置函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

/*---------------------------- HTML Filters ----------------------------------*/
/**
 * 创建一个img标签
 *
 * @param {string} url
 * @param {string} alt
 * @return {string}
 */
exports.img_tag = function (url, alt) {
  if (!alt)
    alt = '';
  url = escape(url);
  alt = escape(alt);
  return '<img src="' + url + '" alt="' + alt + '">';
};

/**
 * 创建一个script标签
 *
 * @param {string} url
 * @return {string} 
 */
exports.script_tag = function (url) {
  url = escape(url);
  return '<script src="' + url + '"></script>';
};

/**
 * 创建一个样式表link标签
 *
 * @param {string} url
 * @param {string} media
 * @return {string}
 */
exports.stylesheet_tag = function (url, media) {
  if (!media)
    media = 'all';
  url = escape(url);
  media = escape(media);
  return '<link href="' + url + '" rel="stylesheet" type="text/css" media="' + media + '" />';
};

/**
 * A链接标签
 *
 * @param {string} link
 * @param {string} url
 * @param {string} title
 * @return {string}
 */
exports.link_to = function (link, url, title) {
  if (!url)
    url = '';
  if (!title)
    title = '';
  link = escape(link);
  url = escape(url);
  title = escape(title);
  return '<a href="' + url + '" title="' + title + '">' + link + '</a>';
};

/*-----------------------------Math Filters-----------------------------------*/
/**
 * 相加
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.plus = function (input, operand) {
  var input = Number(input);
  var operand = Number(operand);
  if (isNaN(input))
    input = 0;
  if (isNaN(operand))
    operand = 0;
  return  input + operand;
};

/**
 * 相减
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.minus = function (input, operand) {
  var input = Number(input);
  var operand = Number(operand);
  if (isNaN(input))
    input = 0;
  if (isNaN(operand))
    operand = 0;
  return  input - operand;
};

/**
 * 相乘
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.times = function (input, operand) {
  var input = Number(input);
  var operand = Number(operand);
  if (isNaN(input))
    input = 0;
  if (isNaN(operand))
    operand = 0;
  return  input * operand;
};

/**
 * 相除
 *
 * @param {number} input
 * @param {number} operand
 * @return {number}
 */
exports.divided_by = function (input, operand) {
  var input = Number(input);
  var operand = Number(operand);
  if (isNaN(input))
    input = 0;
  if (isNaN(operand))
    operand = 0;
  return  input / operand;
};

/**
 * 四舍五入
 *
 * @param {number} input
 * @param {int} point
 * @return {number}
 */
exports.round = function (input, point) {
  if (!(point >= 0))
    point = 0;
  else
    point = parseInt(point);
  if (point < 1)
    return Math.round(input);
  var n = Math.pow(10, point);
  var ret = Math.round(input * n);
  return ret / n;
};

/**
 * 整数
 *
 * @param {number} input
 * @return {int}
 */
exports.integer = function (input) {
  return parseInt(input);
};

/**
 * 返回指定范围的随机数
 *
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
exports.random = function (m, n) {
  if (isNaN(m))
    return Math.random();
  if (isNaN(n)) {
    n = m;
    m = 0;
  }
  return Math.random() * (n - m) + m;
};

/*---------------------------Manipulation Filters-----------------------------*/
/**
 * 在后面拼接字符串
 *
 * @param {string} input
 * @param {string} characters
 * @return {string}
 */
exports.append = function (input, characters) {
  if (!characters)
    return String(input);
  return String(input) + String(characters);
};

/**
 * 在前面拼接字符串
 *
 * @param {string} input
 * @param {string} characters
 * @return {string}
 */
exports.prepend = function (input, characters) {
  if (!characters)
    return String(input);
  return String(characters) + String(input);
};

/**
 * 将字符串转化为驼峰命名方式
 *
 * @param {string} input
 * @return {string}
 */
exports.camelize = function (input) {
  var ret = String(input).split(/[^a-zA-Z0-9]/).map(function (a) {
    return a[0].toUpperCase() + a.substr(1);
  }).join('');
  return ret[0].toLowerCase() + ret.substr(1);
};

/**
 * 字符串首字母大写
 *
 * @param {string} input
 * @return {string}
 */
exports.capitalize = function (input) {
  input = String(input);
  return input[0].toUpperCase() + input.substr(1);
};

/**
 * 取当前毫秒时间戳
 *
 * @param {int} input
 * @return {int}
 */
exports.timestamp = function (input) {
  if (isNaN(input))
    input = 0;
  return new Date().getTime() + input;
};

/**
 * 格式化日期字符串
 *
 * @param {string} input
 * @param {string} format
 * @return {string}
 */
exports.date = function (input, format) {
  if (String(input).toLowerCase() == 'now')
    var time = new Date();
  else {
    var timestamp = parseInt(input);
    if (timestamp == input)
      var time = new Date(timestamp);
    else
      var time = new Date(input);
  }
  if (time.toString() === 'Invalid Date')
    return 'Invalid Date';
  if (!format)
    format = '%Y-%m-%j %H:%M:%S';
  var dates = time.toDateString().split(/\s/);      // ["Wed", "Apr", "11", "2012"]
  var dateS = time.toLocaleDateString().split(/\s/);// ["Wednesday,", "April", "11,", "2012"]
  var times = time.toTimeString().split(/[\s:\+]/); // ["10", "37", "44", "GMT", "0800", "(中国标准时间)"]
  var replace = {
    a:      dates[0], // 星期
    A:      dateS[0],
    b:      dates[1], // 月份
    B:      dateS[1],
    c:      time.toLocaleString(),
    d:      dates[2],
    H:      times[0],       // 24小时制
    I:      times[0] % 12,  // 12小时制
    j:      dates[2], // 日
    m:      time.getMonth() + 1,  // 月份
    M:      times[1], // 分钟
    p:      Number(times[0]) < 12 ? 'AM' : 'PM',  // 上午/下午
    S:      times[2], // 秒
    U:      weekNo(time),         // 当年的第几周，星期日开始
    W:      weekNo(time, true),   // 星期一开始
    w:      time.getDay(),  // 星期几(0-6)
    x:      time.toDateString(),
    X:      time.toTimeString(),
    y:      dates[3].substr(-2),  // 年份
    Y:      dates[3],
    Z:      times[4],   // 时区
  };
  var ret = String(format);
  for (var i in replace) {
    ret = ret.replace(RegExp('%' + i, 'mg'), replace[i]);
  }
  return ret;
};

function weekNo (now, mondayFirst) {
  var totalDays = 0;
  var years = now.getFullYear();
  var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (years % 100 === 0) {
    if (years % 400 === 0)
      days[1] = 29;
  }
  else if (years % 4 === 0)
    days[1] = 29;
  
  if (now.getMonth() === 0) {
    totalDays = totalDays + now.getDate();
  }
  else {
    var curMonth = now.getMonth();
    for (var count = 1; count <= curMonth; count++)
      totalDays = totalDays + days[count - 1];
    totalDays = totalDays + now.getDate();
  }
  // 默认是以星期日开始的
  var week = Math.round(totalDays / 7);
  if (mondayFirst && new Date(String(years)).getDay() === 0)
    week += 1;
  return week;
};

/**
 * 将字符串转换为小写
 *
 * @param {string} input
 * @return {string}
 */
exports.downcase = function (input) {
  return String(input).toLowerCase();
};

/**
 * 将字符串转换为大写
 *
 * @param {string} input
 * @return {string}
 */
exports.upcase = function (input) {
  return String(input).toUpperCase();
};

/**
 * 字符串转义（HTML）
 *
 * @param {string} input
 * @return {string}
 */
exports.escape = function (input) {
  return String(input)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

function getFirstKey (obj) {
  if (Array.isArray(obj)) {
    return 0;
  }
  else {
    var keys = Object.keys(obj);
    return keys[0] || '';
  }
};

function getLastKey (obj) {
  if (Array.isArray(obj)) {
    return obj.length - 1;
  }
  else {
    var keys = Object.keys(obj);
    return keys.pop() || '';
  }
};

/**
 * 返回对象的所有键
 *
 * @param {object} input
 * @return {array}
 */
exports.keys = function (input) {
  try {
    return Object.keys(input);
  }
  catch (err) {
    return [];
  };
};

/**
 * 取第一个元素
 *
 * @param {array} array
 * @return {object}
 */
exports.first = function (array) {
  return array[getFirstKey(array)];
};

/**
 * 取最后一个元素
 *
 * @param {array} array
 * @return {object}
 */
exports.last = function (array) {
  return array[getLastKey(array)];
};

/**
 * 转化为handle字符串
 *
 * @param {string} input
 * @return {string}
 */
exports.handleize = function (input) {
  return String(input)
              .replace(/[^0-9a-zA-Z ]/g, '')
              .replace(/[ ]+/g, '-')
              .toLowerCase();
};

/**
 * 将数组以指定的字符串拼接起来
 *
 * @param {array} input
 * @param {string} segmenter
 * @return {string}
 */
exports.join = function (input, segmenter) {
  if (!segmenter)
    segmenter = ' ';
  if (Array.isArray(input))
    return input.join(segmenter);
  else
    return '';
};

/**
 * 替换第一次出现的字符串
 *
 * @param {string} input
 * @param {string} substring
 * @param {string} replacement
 * @return {string}
 */
exports.replace_first = function (input, substring, replacement) {
  return String(input).replace(substring, replacement);
};

/**
 * 替换指定字符串
 *
 * @param {string} input
 * @param {string} substring
 * @param {string} replacement
 * @return {string}
 */
exports.replace = function (input, substring, replacement) {
  input = String(input);
  while (input.indexOf(substring) > -1)
    input = input.replace(substring, replacement);
  return input;
};

/**
 * 删除指定字符串
 *
 * @param {string} input
 * @param {string} substring
 * @return {string}
 */
exports.remove = function (input, substring) {
  return exports.replace(input, substring, '');
};

/**
 * 删除第一次出现的指定字符串
 *
 * @param {string} input
 * @param {string} substring
 * @return {string}
 */
exports.remove_first = function (input, substring) {
  return exports.replace_first(input, substring, '');
};

/**
 * 将\n转换为<br>
 *
 * @param {string} input
 * @return {string}
 */
exports.newline_to_br = function (input) {
  return String(input).replace(/\n/img, '<br>');
};

/**
 * 如果输入的数大于1则输出第2个参数，否则输出第3个参数
 *
 * @param {int} input
 * @param {string} singular
 * @param {string} plural
 * @return {string}
 */
exports.pluralize = function (input, singular, plural) {
  return Number(input) > 1 ? plural : singular;
};

/**
 * 返回数组或字符串的长度
 *
 * @param {array|string} input
 * @return {string}
 */
exports.size = function (input) {
  if (!input)
    return 0;
  var len = input.length;
  return len > 0 ? len : 0;
};

/**
 * 分割字符串
 *
 * @param {string} input
 * @param {string} delimiter
 * @return {string}
 */
exports.split = function (input, delimiter) {
  if (!delimiter)
    delimiter = '';
  return String(input).split(delimiter);
};

/**
 * 去除HTML标签
 *
 * @param {string} text
 * @return {string}
 */
exports.strip_html = function (text) {
  return String(text).replace(/<[^>]*>/img, '');
};

/**
 * 去除换行符
 *
 * @param {string} input
 * @return {string}
 */
exports.strip_newlines = function (input) {
  return String(input).replace(/\n/img, '');
};

/**
 * 截断字符串
 *
 * @param {string} input
 * @param {int} characters
 * @return {string}
 */
exports.truncate = function (input, characters) {
  if (isNaN(characters))
    characters = 100;
  return String(input).substr(0, characters);
};

/**
 * 取字符串的前N个单词
 *
 * @param {string} input
 * @param {int} n
 * @return {string}
 */
exports.truncatewords = function (input, words) {
  if (isNaN(words))
    words = 15;
  return String(input).trim().split(/ +/).slice(0, words).join(' ');
};

/**
 * 转换为json字符串
 *
 * @param {object} input
 * @return {string}
 */
exports.json = function (input) {
  try {
    var ret = JSON.stringify(input);
  }
  catch (err) {
    return '{}';
  }
  return typeof ret !== 'string' ? '{}' : ret;
};

/**
 * 取指定属性值
 *
 * @param {object} obj
 * @param {string} prop
 * @return {object}
 */
exports.get = function(obj, prop){
  if (!obj)
    obj = {};
  return obj[prop];
};

/**
 * 反转字符串或数组
 *
 * @param {string|array} obj
 * @return {string|array}
 */
exports.reverse = function (obj) {
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
};

/**
 * 取数组的指定列的数据
 *
 * @param {array} arr
 * @param {string} prop
 * @return {array}
 */
exports.map = function (arr, prop) {
  if (!Array.isArray(arr))
    return [];
  return arr.map(function(obj){
    return obj[prop];
  });
};

/**
 * 数组排序，默认升序
 *
 * @param {array} obj
 * @param {int} order
 * @return {array}
 */
exports.sort = function (obj, order) {
  if (!Array.isArray(obj))
    return [];
  order = String(order).trim().toLowerCase();
  var ret1 = order === 'desc' ? -1 : 1;
  var ret2 = 0 - ret1;
  return obj.sort(function (a, b) {
    if (a > b)  return ret1;
    if (a < b)  return ret2;
    return 0;
  });
};

/**
 * 按照数组元素的指定属性排序
 *
 * @param {array} obj
 * @param {string} prop
 * @param {int} order
 * @return {array}
 */
exports.sort_by = function (obj, prop, order) {
  if (!Array.isArray(obj))
    return [];
  order = String(order).trim().toLowerCase();
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

/**
 * 根据数量生成导航页码
 *
 * @param {int} count 总数
 * @param {int} size 每页显示数量
 * @param {int} page 当前页码
 * @listurn {array}
 */
exports.pagination = function (count, size, page) {
  if (count % size === 0)
    var maxPage = parseInt(count / size);
  else
    var maxPage = parseInt(count / size) + 1;
    
  if (isNaN(page) || page < 1)
    page = 1;
  page = parseInt(page);
    
  var list = [page - 2, page - 1, page, page + 1, page + 2];
  for (var i = 0; i < list.length;) {
    if (list[i] < 1 || list[i] > maxPage)
      list.splice(i, 1);
    else
      i++;
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
  if (ret.next > maxPage)
    ret.next = maxPage;
  if (ret.previous < 1)
    ret.previous = 1;
  
  return ret;
};

//------------------------------------------------------------------------------
var ns = Object.keys(exports);
for (var i in ns) {
  var n = ns[i];
  var n2 = n[0].toUpperCase() + n.substr(1);
  exports[n2] = exports[n];
}
