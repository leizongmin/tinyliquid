/**
 * 过滤器
 *
 * @author 老雷<leizongmin@gmail.com>
 */


/**
 * HTML字符转义
 *
 * @param {string} html
 * @return {string}
 */
exports.escape = function (html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
 
/**
 * 返回数组的第一个元素
 *
 * @param {array} obj
 * @return {object}
 */
exports.first = function (obj) {
  return obj[0];
};

/**
 * 返回数组的最后一个元素
 *
 * @param {array} obj
 * @return {object}
 */
exports.last = function (obj) {
  return obj[obj.length - 1];
};

/**
 * 首字母大写
 *
 * @param {string} str
 * @return {string}
 */
exports.capitalize = function (str) {
  str = String(str);
  return str[0].toUpperCase() + str.substr(1, str.length);
};

/**
 * 转换为小写
 *
 * @param {string} str
 * @return {string}
 */
exports.downcase = function (str) {
  return String(str).toLowerCase();
};

/**
 * 转换为大写
 *
 * @param {string} str
 * @return {string}
 */
exports.upcase = function (str) {
  return String(str).toUpperCase();
};

/**
 * 数组排序
 *
 * @param {array} obj
 * @return {array}
 */
exports.sort = function (obj) {
  return Object.create(obj).sort();
};

/**
 * 按照数组元素的指定属性排序
 *
 * @param {array} obj
 * @param {string} prop
 * @return {array}
 */
exports.sort_by = function (obj, prop) {
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

/**
 * 取对象长度
 *
 * @param {array|string} obj
 * @return {int}
 */
exports.size = exports.length = function (obj) {
  return obj.length;
};

/**
 * 数值相加
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
exports.plus = function(a, b){
  return Number(a) + Number(b);
};

/**
 * 数值相减
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
exports.minus = function (a, b) {
  return Number(a) - Number(b);
};

/**
 * 数值相乘
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
exports.times = function (a, b) {
  return Number(a) * Number(b);
};

/**
 * 数值相除
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
exports.divided_by = function (a, b){
  return Number(a) / Number(b);
};

/**
 * 用指定字符串连接数组各个元素
 *
 * @param {array} obj
 * @param {string} str
 * @return {string}
 */
exports.join = function (obj, str) {
  return obj.join(str || ', ');
};

/**
 * 截断字符串
 *
 * @param {string} str
 * @param {int} len
 * @return {string}
 */
exports.truncate = function (str, len) {
  str = String(str);
  return str.substr(0, len);
};

/**
 * 取字符串的前N个单词
 *
 * @param {string} str
 * @param {int} n
 * @return {string}
 */
exports.truncate_words = function (str, n) {
  var str = String(str)
    , words = str.split(/ +/);
  return words.slice(0, n).join(' ');
};

/**
 * 替换字符串
 *
 * @param {string} str
 * @param {string} pattern
 * @param {string} substitution
 * @return {string}
 */
exports.replace = function (str, pattern, substitution) {
  return String(str).replace(pattern, substitution || '');
};

/**
 * 向前插入一个元素
 *
 * @param {string|array} obj
 * @param {string} val
 * @return {string|array}
 */
exports.prepend = function (obj, val) {
  return Array.isArray(obj)
    ? [val].concat(obj)
    : val + obj;
};

/**
 * 向后插入一个元素
 *
 * @param {string|array} obj
 * @param {string} val
 * @return {string|array}
 */
exports.append = function (obj, val) {
  return Array.isArray(obj)
    ? obj.concat(val)
    : obj + val;
};

/**
 * 取数组的指定列的数据
 *
 * @param {array} arr
 * @param {string} prop
 * @return {array}
 */
exports.map = function (arr, prop) {
  return arr.map(function(obj){
    return obj[prop];
  });
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
 * 取指定属性值
 *
 * @param {object} obj
 * @param {string} prop
 * @return {object}
 */
exports.get = function(obj, prop){
  return obj[prop];
};

/**
 * 转化为JSON字符串
 *
 * @param {object} obj
 * @return {string}
 */
exports.json = function(obj){
  return JSON.stringify(obj);
};