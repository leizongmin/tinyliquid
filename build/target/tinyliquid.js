/**
 * TinyLiquid模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var TinyLiquid = (function (exports) {

  var modules = {};
  
  /*--------------- ./lib/md5.js ----------------*/
  var m = {exports: {}};
  (function (module, exports) {
    'use strict';

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}function rstr2hex(c){try{hexcase}catch(g){hexcase=0}var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}return b}function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}return b}function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}return a}function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}return a}function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}return Array(o,n,m,l)}function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};

module.exports = hex_md5;

    return exports;
  })(m, m.exports);
  modules.md5 = m.exports;
  /*-----------------------------------------------*/
  
  /*--------------- ./lib/utils.js ----------------*/
  var m = {exports: {}};
  (function (module, exports) {
    'use strict';

/**
 * 工具函数
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var md5 = modules.md5;

/**
 * MD5
 *
 * @param {string} str
 * @return {string}
 */
exports.md5 = md5;

/**
 * 去掉字符串外面的引号
 *
 * @param {string} input
 * @return {string}
 */
exports.stripQuotes = function (input) {
  input = String(input);
  var s = 0;
  var e = input.length;
  var ei = e - 1;
  if (input[0] === '\'' || input[0] === '"') {
    s++;
    e--;
  }
  if (input[ei] === '\'' || input[ei] === '"')
    e--;
  return input.substr(s, e);
};
 
/**
 * 合并多个对象
 *
 * @param {object} obja
 * @param {object} objb
 * @return {object}
 */
exports.merge = function () {
  var ret = {}
  for (var i in arguments) {
    var obj = arguments[i];
    for (var j in obj)
      ret[j] = obj[j];
  }
  return ret;
};

/**
 * 将对象转换为数组
 *
 * @param {object} data
 * @return {array}
 */
exports.toArray = function (data) {
  if (Array.isArray(data))
    return data;
  var ret = [];
  for (var i in data)
    if (i !== 'size')
      ret.push(data[i]);
  return ret;
};

/**
 * 表格分割
 *
 * @param {object|array} data
 * @param {int} col 列数
 * @param {int} offset 偏移量
 * @param {int} limit 返回数量
 * @return {array}
 */
exports.tableSplit = function (data, col, offset, limit) {
  if (isNaN(col))
    return data;
  if (isNaN(offset))
    offset = 0;
  if (isNaN(limit))
    data = data.slice(offset);
  else
    data = data.slice(offset, offset + limit);
  var len = data.length;
  var ret = [];
  var rowi = 0;
  var di = 0;
  while (di < len) {
    var row = ret[rowi++] = [];
    for (var i = 0; i < col && di < len; i++)
      row.push(data[di++]);
  }
  return ret;
};

/**
 * 取指定范围的数字数组
 *
 * @param {int} s
 * @param {int} e
 * @return {array}
 */
exports.range = function (s, e) {
  s = parseInt(s);
  e = parseInt(e);
  var r = [];
  if (isNaN(s) || isNaN(e))
    return r;
  for (; s <= e; s++)
    r.push(s);
  return r;
};

/**
 * 输出文本
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
 * 输出HTML
 *
 * @param {string} html
 * @return {string}
 */
exports.outputHtml = function (html) {
  return html.replace(/\\/img, '\\')
             .replace(/'/img, '\\\'')
             .replace(/"/img, '\\\"')
             .replace(/\r/img, '\\r')
             .replace(/\n/img, '\\n');
};
var $_html = exports.outputHtml;

/**
 * 出错信息
 *
 * @param {string} msg
 */
exports.errorMessage = function (msg) {
  var html = '<pre style="font-weight:bold; font-size:14px; color:red; padding:4px 20px 4px 20px; border:1px solid #CCC; background-color:#FFF5F0;">' + msg + '</pre>';
  //console.log(html);
  return html;
};
var $_err = exports.errorMessage;

/**
 * 抛出运行时出错信息
 *
 * @param {Error} err
 */
exports.rethrowError = function (err) {
  var msg = 'An error occurred while rendering\n'
          + 'Line: ' + $_line_num + '\n'
          + '    ' + err;
  $_buf+=($_err(msg));
};

/**
 * 包装变量
 *
 * @param {string} n
 * @param {string} locals
 * @param {function} saveFunc
 * @return {string}
 */
exports.localsWrap = function (n, locals, saveFunc) {
  if (!locals)
    locals = 'locals';
  locals += '.';
  n = n.trim();
  // 是否为常量
  if (CONST_VAL.indexOf(n) > -1)
    return n;
  // 是否为字符串
  if (/^['"].*['"]$/.test(n))
    return n;
  // 是否为数值
  if (/^\d[\d\.]*\d?$/.test(n))
    return n;
  // 是否为标识符
  if (/^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(n) && n.substr(-1) !== '.') {
    if (typeof saveFunc === 'function')
      saveFunc(n);
    return locals + n;
  }
  
  var i = n.indexOf('[');
  if (i !== -1 && typeof saveFunc === 'function') {
    var s = n.substr(0, i);
    if (s.substr(-1) === '.')
      s = s.substr(0, s.length - 1);
    saveFunc(s);
  }
  
  //转换为字符串索引
  n = n.replace(/\.?((([\w\d\_]*[^\w\d\_\.\[\]]+[\w\d\_]*)+)|([\d]+[\w].*))\.?/img, function (a) {
    if (/^["']|["']$/img.test(a))
      return a;
    if (a[0] === '.')
      a = a.substr(1);
    if (a.substr(-1) === '.')
      a = a.substr(0, a.length - 1);
    a = a.replace(/"/img, '\\"');
    return '["' + a + '"]';
  });
  n = n.replace(/"\]/img, '"].');
  
  // 变量索引
  var left = n.indexOf('[');
  var right = n.lastIndexOf(']');
  if (left !== -1 && right !== -1) {
    if (typeof saveFunc === 'function') {
      n.split('[').forEach(function (item) {
        var i = item.indexOf(']');
        if (i === -1)
          return;
        var n = item.substr(0, i);
        if (!/^['"].*['"]$/.test(n) && !/^\d[\d\.]*\d?$/.test(n) &&
            /^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(n))
          saveFunc(n);
      });
    }
    n = n.replace(/\.?\[/img, '[' + locals)
         .replace(RegExp((locals + '[\'"\\d]').replace(/\./img, '\\.'), 'img'), function (a) {
           return a.substr(locals.length);
         });
  }
  
  if (n.substr(-1) === '.')
    n = n.substr(0, n.length - 1);
  // console.log('--------', n);
  if (n[0] === '[')
    return locals.substr(0, locals.length - 1) + n;
  else
    return locals + n;
};
// 常量
var CONST_VAL = ['nil', 'null', 'empty', 'blank', 'true', 'false'];

/**
 * 解析函数调用
 *
 * @param {string} js
 * @param {object} options
 * @param {object} context
 * @return {string}
 */
exports.filtered = function (js, options, context) {
  options = options || {}
  if (!options.locals)
    options.locals = 'locals';
  if (!options.filters)
    options.filters = 'filters';
  options.locals += '.';
  options.filters += '.';
  
  if (!context)
    context = {};
  
  var localsWrap = exports.localsWrap;
  
  var isFirst = true;
  var hasFilters = false;
  
  var ret = exports.splitBy(js, '|').reduce(function (js, filter) {
    hasFilters = true;
    var parts = exports.splitBy(filter, ':');
    var name = parts.shift();
    var args = (parts.shift() || '').trim();
    if (isFirst) {
      js = localsWrap(js, null, context.saveLocalsName);
      isFirst = false;
    }
    if (args) {
      var a = exports.splitBy(args, ',');
      for (var i in a)
        a[i] = localsWrap(a[i], null, context.saveLocalsName);
      args = ', ' + a.join(', ');
    }
    return options.filters + name.trim() + '(' + js + args + ')';
  });
  
  if (!hasFilters)
    ret = localsWrap(ret, null, context.saveLocalsName);
  
  return ret;
};

/**
 * 解析条件语句
 *
 * @param {string} cond
 * @param {object} context
 * @return {string}
 */
exports.condition = function (cond, context) {
  if (!context)
    context = {};
  var localsWrap = function (a) {
    return exports.localsWrap(a, null, context.saveLocalsName);
  };
  
  var blocks = exports.split(cond);
  // console.log(blocks);
  // 拆分成多个子条件
  var conds = [[]];
  var condi = 0;
  for (var i in blocks) {
    var b = blocks[i];
    switch (b) {
      // 连接元素
      case 'and':
      case 'or':
        condi++;
        conds[condi] = b;
        condi++;
        conds[condi] = [];
        break;
      // 其他元素
      default:
        conds[condi].push(b);
    }
  }
  
  // 生成单个条件的js代码
  var op = ['>', '<', '==', '!=', '>=', '<>', '<=', 'contains', 'hasValue', 'hasKey'];
  var vempty = ['nil', 'null', 'empty', 'blank'];
  var one = function (ca) {
    if (ca.length === 1) {
      return '(' + localsWrap(ca[0]) + ')';
    }
    if (ca.length === 3) {
      var op1 = localsWrap(ca[0]);
      var op2 = localsWrap(ca[2]);
      ca[1] = ca[1].toLowerCase();
      // console.log(ca[1]);
      // contains 语句
      if (ca[1] === 'contains') {
        return '(String(' + op1
             + ').toLowerCase().indexOf(' + op2
             + ') !== -1)';
      }
      // hasValue 语句
      else if (ca[1] === 'hasvaule') {
        return '(Array.isArray(' + op1 + ') ? (' + op1 + '.indexOf(' + op2 + ') !== -1 ? true : false) : '
             + '(function () {  for (var i in ' + op1 + ') if (' + op1 + ' == ' + op2 + ') return true;'
             + '  return false; })())';
      }
      // hasKey 语句
      else if (ca[1] === 'haskey') {
        return '(' + op1 + ' && typeof ' + op1 + '[' + op2 + '] !== \'undefined\')';
      }
      // nil, empty
      else if (vempty.indexOf(ca[2]) > -1) {
        switch (ca[1]) {
          case '!=':
          case '<>':
            return '(' + op1 + ')';
          case '==':
            return '(!' + op1 + ')';
          default:
            return null;
        }
      }
      // 其他
      else if (op.indexOf(ca[1]) > -1) {
        if (ca[1] === '<>')
          ca[1] = '!=';
        return '(' + op1 + ca[1] + op2 + ')';
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  };
  
  var ret = [];
  for (var i in conds) {
    var c = conds[i];
    if (Array.isArray(c)) {
      var s = one(c);
      if (s === null)
        return null;
      else
        ret.push(s);
    }
    else if (c === 'and') {
      ret.push('&&');
    }
    else if (c === 'or') {
      ret.push('||');
    }
  }
  
  if (ret.length > 1)
    return '(' + ret.join(' ') + ')';
  else
    return ret.join(' ');
};

/**
 * 空格分割字符串
 *
 * @param {string} text
 * @return {array}
 */
exports.split = function (text) {
  var isString = false;
  var lastIndex = 0;
  var ret = [];
  var add = function (end) {
    var w = text.slice(lastIndex, end).trim();
    if (w.length > 0)
      ret.push(w);
    lastIndex = end;
  };
  
  for (var i = 0, len = text.length; i < len; i++) {
    var c = text[i];
    // console.log(i, c);
    // 字符串开始或结束
    if ((c === '"' || c === '\'') && text[i - 1] !== '\\') {
      // 结束
      if (isString === c) {
        i++;
        add(i);
        isString = false;
      }
      // 开始
      else if (!isString) {
        add(i);
        isString = c;
      }
    }
    // 非字符串
    else if (!isString) {
      var isOpChar = function (c) {
        return (c === '<' || c === '>' || c === '=' || c === '!');
      };
      // 空格
      if (c === ' ') {
        add(i);
      }
      // 中间的比较运算符 如 a<b
      else if (isOpChar(c)) {
        add(i);
        do {
          i++;
        } while (isOpChar(text[i]));
        add(i);
        i--;
      }
    }
  }
  add(i);
  
  return ret;
};

/**
 * 使用指定字符分割
 *
 * @param {string} text
 * @param {string} sep
 * @return {array}
 */
exports.splitBy = function (text, sep) {
  var arr = text.split(sep);
  var ret = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    var g = arr[i];
    // 合并误分割的字符串内分割符
    var gl = g.trimLeft();
    var gr = g.trimRight();
    if ((gl[0] === '"' || gl[0] === "'") && gl[0] !== gr.substr(-1)) {
      var j = i;
      do {
        j++;
      } while (j < len && arr[j].trimRight().substr(-1) !== gl[0])
      if (j < len) {
        g = arr.slice(i, j + 1).join(sep);
        i = j;
      }
    }
    ret.push(g.trim());
  }
  return ret;
};

/**
 * 解析for循环
 *
 * @param {string} loops
 * @param {object} context
 * @return {string}
 */
exports.forloops = function (loops, context) {
  var blocks = loops.split(/\s+/);
  
  // 如果为for array，自动转化为默认的 for item in array
  if (blocks.length === 1) {
    blocks[1] = 'in';
    blocks[2] = blocks[0];
    blocks[0] = 'item';
  }
  
  var loopIndex = context.loop;
  
  var localsWrap = exports.localsWrap;
  var n = '$_loop_' + loopIndex;        // 索引
  var ni = '$_loop_i_' + loopIndex;     // 数字索引
  var array = localsWrap(blocks[2], null, context.saveLocalsName);    // 数组的名称
  var item = localsWrap(blocks[0], null, context.saveLocalsName);     // 当前元素的名称
  
  // loop item临时名称
  context.loopName[context.loopName.length - 1].itemName = item;
  
  var header = '(function (locals) {\n'
             + 'var ' + ni + ' = 0;\n'
             + 'locals.forloop = {};\n';
  
  // for i in (1..item.quantity)
  var r = /^\((.+)\.\.(.+)\)$/.exec(blocks[2]);
  if (r !== null) {
    array = localsWrap('_range_' + loopIndex, null, context.saveLocalsName);
    header += array + ' = $_range(' + localsWrap(r[1], null, context.saveLocalsName) + ', '
           + localsWrap(r[2], null, context.saveLocalsName) + ');\n';
  }
  
  // 将对象转换为数组
  var _array = '$_loop_arr_' + loopIndex;
  header += 'var ' + _array + ' = $_array(' + array + ');\n';
  array = _array;
  
  // 允许增加的标记属性
  var OPTIONS = ['limit', 'offset'];
  var options = {};
  var getOptions = function (block) {
    var b = block.split(':');
    if (b.length !== 2)
      return false;
    var name = b[0].trim();
    var value = localsWrap(b[1], null, context.saveLocalsName);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  };
  
  // 格式化参数 limit: N offset: M  =>  limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (blocks[i].substr(-1) === ':') {
      blocks[i] += blocks[i + 1];
      blocks.splice(i + 1, 1);
    }
  }
  // for item in arrays limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + options.offset + ' + ' + options.limit + ');\n';
  else if (options.limit)
    header += array + ' = ' + array + '.slice(0, ' + options.limit + ');\n';
  else if (options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ');\n';
  
  // 生成基本代码
  var script = header
         + 'locals.forloop.length = ' + array + '.length;\n'
         + 'var forloop = locals.forloop;\n'
         + 'for (var ' + n + ' = 0; ' + n + ' < forloop.length; ' + n + '++) {\n'
         + item + ' = ' + array + '[' + n + '];\n'
         + 'forloop.name = \'' + blocks[0] + '\';\n'
         + 'forloop.index0 = ' + ni + ';\n'
         + 'forloop.index = ++' + ni + ';\n'
         + 'forloop.rindex0 = forloop.length - forloop.index;\n'
         + 'forloop.rindex = forloop.length - forloop.index0;\n'
         + 'forloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'forloop.last = ' + ni + ' === forloop.length ? true : false;\n'
         + '/* for loops body */';
  
  return script;
};

/**
 * 解析tablerowloop循环
 *
 * @param {string} loops
 * @param {object} context
 * @return {string}
 */
exports.tablerow = function (loops, context) {
  var blocks = loops.split(/\s+/);
  
  var loopIndex = context.loop;
  
  if (blocks.length < 2)
    return null;
  
  // 如果为tablerow array，自动转化为默认的 tablerow item in array
  if (blocks.length === 2) {
    blocks[3] = blocks[1];
    blocks[1] = 'in';
    blocks[2] = blocks[0];
    blocks[0] = 'item';
  }
  
  var localsWrap = exports.localsWrap;
  var n = '$_loop_' + loopIndex;        // 索引
  var ni = '$_loop_i_' + loopIndex;     // 数字索引
  var array = localsWrap(blocks[2], null, context.saveLocalsName);    // 数组的名称
  var item = localsWrap(blocks[0], null, context.saveLocalsName);     // 当前元素的名称
  
  // loop item临时名称
  context.loopName[context.loopName.length - 1].itemName = item;
  
  var header = '(function (locals) {\n'
             + 'var ' + ni + ' = 0;\n'
             + 'locals.tablerowloop = {};\n';
  
  // tablerow i in (1..item.quantity)
  var r = /^\((.+)\.\.(.+)\)$/.exec(blocks[2]);
  if (r !== null) {
    array = localsWrap('_range_' + loopIndex, null, context.saveLocalsName);
    header += array + ' = $_range(' + localsWrap(r[1], null, context.saveLocalsName) + ', '
           + localsWrap(r[2], null, context.saveLocalsName) + ');\n';
  }
  
  // 将对象转换为数组
  var _array = '$_loop_arr_' + loopIndex;
  header += 'var ' + _array + ' = $_array(' + array + ');\n';
  array = _array;
  
  // 允许增加的标记属性
  var OPTIONS = ['cols', 'limit', 'offset'];
  var options = {};
  var getOptions = function (block) {
    var b = block.split(':');
    if (b.length !== 2)
      return false;
    var name = b[0].trim();
    var value = localsWrap(b[1], null, context.saveLocalsName);
    if (OPTIONS.indexOf(name) === -1)
      return false;
    options[name] = value;
    return true;
  };
  
  // 格式化参数 limit: N offset: M  =>  limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (blocks[i].substr(-1) === ':') {
      blocks[i] += blocks[i + 1];
      blocks.splice(i + 1, 1);
    }
  }
  // tablerow item in arrays cols:3 limit:N offset:M
  for (var i = 3; i < blocks.length; i++) {
    if (getOptions(blocks[i]) === false)
      return null;
  }
  if (options.limit && options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ', ' + options.offset + ' + ' + options.limit + ');\n';
  else if (options.limit)
    header += array + ' = ' + array + '.slice(0, ' + options.limit + ');\n';
  else if (options.offset)
    header += array + ' = ' + array + '.slice(' + options.offset + ');\n';
  
  // 生成基本代码
  var script = header
         + 'locals.tablerowloop.length = ' + array + '.length;\n'
         + 'var tablerowloop = locals.tablerowloop;\n'
         + 'var ' + n + '_row = 0;\n'
         + 'for (var ' + n + ' = 0; ' + n + ' < tablerowloop.length; ) {\n'
         + n + '_row++;\n'
         + '$_buf += \'<tr class=\"row\' + (' + n + '_row) + \'\">\\n\';'
         + 'for (tablerowloop.col0 = 0; tablerowloop.col0 < ' + options.cols + ' && ' + n + ' < tablerowloop.length; tablerowloop.col0++, ' + n + '++) {\n'
         + item + ' = ' + array + '[' + n + '];\n'
         + 'tablerowloop.name = \'' + blocks[0] + '\';\n'
         + 'tablerowloop.col = tablerowloop.col0 + 1;\n'
         + 'tablerowloop.col_first = tablerowloop.col === 1 ? true : false;\n'
         + 'tablerowloop.col_last = tablerowloop.col === ' + options.cols + ' ? true : false;\n'
         + 'tablerowloop.index0 = ' + ni + ';\n'
         + 'tablerowloop.index = ++' + ni + ';\n'
         + 'tablerowloop.rindex0 = tablerowloop.length - tablerowloop.index;\n'
         + 'tablerowloop.rindex = tablerowloop.length - tablerowloop.index0;\n'
         + 'tablerowloop.first = ' + ni + ' === 1 ? true : false;\n'
         + 'tablerowloop.last = ' + ni + ' === tablerowloop.length ? true : false;\n'
         + 'if (tablerowloop.last === true) tablerowloop.col_last = true;\n'
         + '$_buf += \'<td class=\"col\' + tablerowloop.col + \'\">\';'
         + '/* tablerow loops body */';
  
  return script;
};

/**
 * 解析assign
 *
 * @param {string} expression
 * @param {object} context
 * @return {string}
 */
exports.assign = function (expression, context) {
  // console.log(expression, context);
  // 如果为 [], array() 则创建一个数组
  if (expression === '[]' || expression === 'array()')
    var ret = '[]';
  // 如果为 {}, object(), {"a":"xxx"} 则创建相应的对象
  else if (expression === 'object()')
    var ret = '{}';
  else if (/^\{.*\}$/img.test(expression))
    var ret = 'JSON.parse(\'' + expression + '\')';
  else
    var ret = exports.filtered(expression, null, context);
  // console.log(expression, ret);
  // 替换用assign定义的名称为global
  // console.log(expression, context.assignNames);
  for (var i in context.assignNames) {
    // 忽略loop中的名称名称（即优先使用loop内定义的名称）
    if (context.loopName.length > 0) {
      if (i === context.loopName[context.loopName.length - 1].itemName ||
          i.substr(0, 8) === 'forloop.' || i.substr(0, 13) === 'tablerowloop.')
        continue;
    }
    
    ret = ret.replace(RegExp(i, 'img'), 'global.' + i);
  }
  // console.log(ret);
  return ret;
};

/**
 * 解析cycle
 *
 * @param {string} strlist
 * @param {object} context
 * @return {string}
 */
exports.cycle = function (strlist, context) {
  var localsWrap = exports.localsWrap;
  
  var list = strlist.split(/\s*,\s*/);
  for (var i in list) {
    list[i] = localsWrap(list[i], null, context.saveLocalsName);
  }
  
  var cycleKey = md5(list.join(',')).substr(0, 8);
  context.addCycle(cycleKey, list);
  
  var cycleName = '$_cycle_' + cycleKey;
  var script = '$_buf+=(' + cycleName + '.items[' + cycleName + '.i])\n'
             + '$_cycle_next(' + cycleName + ');\n';
  return script;
};


/**
 * 异步获取数据对象
 *
 * @param {object} models
 * @param {array} names
 * @param {object} env
 */
var AsyncDataList = function (models, names, env) {
  if (!(this instanceof AsyncDataList))
    return new AsyncDataList(models, names, env);
  this.models = models || {};
  this.names = names || {};
  this.env = env || {};
  this.data = {};
};
exports.AsyncDataList = AsyncDataList;

/**
 * 获取一个数据
 *
 * @param {string} name
 * @param {function} callback
 */
AsyncDataList.prototype.getItem = function (name, callback) {
  var self = this;
  var data = self.data;
  var models = self.models;
  try {
    
    var model = models[name];
    if (typeof model === 'undefined') {
      // 智能分析，比如需要 a.b.c 如果该项没注册，会自动递归查找其父项 a.b 和 a
      var ns = name.split('.');
      while (ns.pop() && ns.length > 0) {
        name = ns.join('.');
        model = models[name];
        if (typeof model !== 'undefined')
          break;
      }
    }
    
    // 如果为function，则调用其以取得数据
    var modelType = typeof model;
    if (modelType === 'function') {
      return model(self.env, function (err, d) {
        if (err)
          return callback(err);
        self.saveItem(name, d);
        return callback(null);
      });
    }
    else if (modelType !== 'undefined') {
      self.saveItem(name, model);
      return callback(null);
    }
    
    return callback(null);
  }
  catch (err) {
    callback(err);
    return false;
  }
};

/**
 * 保存一个数据
 *
 * @param {string} name
 * @param {object} value
 */
AsyncDataList.prototype.saveItem = function (name, value) {
  var data = this.data;
  var ns = name.split('.');
  var oldns = [];
  var key = ns.pop();
  var getFather = function (node, ns, oldns) {
    if (ns.length < 1)
      return node;
    var key = ns.shift();
    if (!node[key])
      node[key] = {};
    oldns.push(key);
    if (typeof node[key] !== 'object')
      throw Error('Cannot set childs because "' + oldns.join('.') + '" is not an object');
    return getFather(node[key], ns, oldns);
  };
  var node = getFather(data, ns, oldns);
  node[key] = value;
  
  return data;
};

/**
 * 队列式读取数据
 *
 * @param {function} callback  function (err, data)
 */
AsyncDataList.prototype.start = function (callback) {
  var models = this.models;
  var names = this.names;
  var data = this.data;
  var self = this;
  
  try {
    var next = function (err) {
      if (err)
        return callback(err);
      if (names.length < 1)
        return callback(null, data);
      var name = names.shift();
      self.getItem(name, next);
    };
    next();
  }
  catch (err) {
    return callback(err);
  }
};

/**
 * 并行式读取数据
 *
 * @param {function} callback  function (err, data)
 */
AsyncDataList.prototype.startParallel = function (callback) {
  var models = this.models;
  var names = this.names;
  var data = this.data;
  var self = this;
  
  var isReturn = false;
  
  var getItem = function (name, names) {
    self.getItem(name, function (err) {
      if (err && !isReturn) {
        isReturn = true;
        return callback(err);
      }
      var i = names.indexOf(name);
      names.splice(i, 1);
      if (names.length < 1 && !isReturn) {
        isReturn = true;
        return callback(null, data);
      }
    });
  };
  
  try {
    for (var i in names) {
      getItem(names[i], names);
    }
  }
  catch (err) {
    return callback(err);
  }
};

    return exports;
  })(m, m.exports);
  modules.utils = m.exports;
  /*-----------------------------------------------*/
  
  /*-------------- ./lib/filters.js ---------------*/
  var m = {exports: {}};
  (function (module, exports) {
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

    return exports;
  })(m, m.exports);
  modules.filters = m.exports;
  /*-----------------------------------------------*/
  
  /*--------------- ./lib/parser.js ---------------*/
  var m = {exports: {}};
  (function (module, exports) {
    'use strict';

/**
 * 代码分析器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var utils = modules.utils;
var template = modules.template;


exports.output = function (text, start, context) {
  if (context.isRaw)
    return null;
  
  // 查找结束标记
  var end = text.indexOf('}}', start);
  if (end === -1)
    return null;
  
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
  
  var line = text.slice(start + 2, end).trim();
  end += 2;
  
  // 支持函数调用
  var script = '$_line_num = ' + context.line_num + ';\n'
             + '$_buf+=(' + utils.filtered(line, null, context) + ');';
  
  return {start: start, end: end, script: script};
};

 
exports.tags = function (text, start, context) {
  // 查找结束标记
  var end = text.indexOf('%}', start);
  if (end === -1)
    return null;
  
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
  
  var line = text.slice(start + 2, end).trim();
  end += 2;
  // console.log('Line: ' + line);
  
  // 解析语句
  var space_start = line.indexOf(' ');
  var script = '';
  
  // 设置行号，以便检查运行时错误
  var setLineNumber = function () {
    if (script.substr(-1) === '\n')
      script += '$_line_num = ' + context.line_num + ';\n';
    else
      script += '\n$_line_num = ' + context.line_num + ';\n';
  };
  
  // 当前在raw标记内，则只有遇到 enddraw 标记时才能终止
  if (context.isRaw) {
    if (line === 'endraw') {
      context.isRaw = false;
      setLineNumber();
      script += '/* endraw */';
      return {start: start, end: end, script: script};
    }
    else {
      return null;
    }
  }
  
  // 嵌套开始
  var enterLoop = function (name) {
    context.loop++;
    context.loopName.push({
      name:     name,
      start:    start,
      end:      end,
      line:     line,
      line_num: context.line_num
    });
  };
  
  // 退出嵌套
  var outLoop = function () {
    context.loop--;
    context.loopName.pop();
  };
  
  // 嵌套结束标记不匹配
  var loopNotMatch = function () {
    context.error = {
      message:    'Unexpected token: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  };
  
  // 意外的标记
  var syntaxError = function () {
    context.error = {
      message:    'SyntaxError: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  };
  
  // 无法识别的标记
  var unknowTag = function () {
    context.error = {
      message:    'UnknowTag: ' + line,
      start:      start,
      end:        end,
      line:       line
    }
  };
  
  // 当前嵌套名称
  if (context.loopName.length > 0)
    var loopName = context.loopName[context.loopName.length - 1].name;
  else
    var loopName = '';
  
  // 简单标记(一般为标记结尾)
  if (space_start === -1) {
    switch (line) {
      // raw 标记
      case 'raw':
        context.isRaw = true;
        setLineNumber();
        script += '/* raw */';
        break;
      // endif
      case 'endif':
        if (loopName !== 'if')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // endunless
      case 'endunless':
        if (loopName !== 'unless')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // else
      case 'else':
        if (loopName === 'if' || loopName === 'unless') {
          setLineNumber();
          script += '} else {';
          setLineNumber();
        }
        else if (loopName === 'case') {
          setLineNumber();
          script += 'break;\n' +
                    'default:';
          setLineNumber();
        }
        else if (loopName === 'for') {
          setLineNumber();
          script += '}\n'
                  + 'if (forloop.length < 1) {';
        }
        else
          loopNotMatch();
        break;
      // endcase
      case 'endcase':
        if (loopName !== 'case')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}';
          outLoop();
        }
        break;
      // endfor
      case 'endfor':
        if (loopName !== 'for')
          loopNotMatch();
        else {
          setLineNumber();
          script += '}\n'
                  + '})($_merge(locals));';
          outLoop();
        }
        break;
      // endtablerow
      case 'endtablerow':
        if (loopName !== 'tablerow')
          loopNotMatch();
        else {
          setLineNumber();
          script += '$_buf += \'</td>\';\n'
                  + '}\n'
                  + '$_buf += \'</tr>\\n\';\n'
                  + '}\n'
                  + '})($_merge(locals));';
          outLoop();
        }
        break;
      // endcapture
      case 'endcapture':
        if (loopName !== 'capture')
          loopNotMatch();
        else {
          setLineNumber();
          script += '} catch (err) {\n'
                  + '  $_rethrow(err);\n'
                  + '}\n'
                  + 'return $_buf;\n'
                  + '})();';
          outLoop();
        }
        break;
      // 出错
      default:
        unknowTag();
    }
  }
  // 复杂标记(一般为标记开头)
  else {
    var line_left = line.substr(0, space_start);
    var line_right = line.substr(space_start).trim();
    switch (line_left) {
      // if / unless 判断
      case 'if':
        enterLoop(line_left);
        setLineNumber();
        script += 'if ' + utils.condition(line_right, context) + ' {';
        break;
      case 'unless':
        enterLoop(line_left);
        setLineNumber();
        script += 'if (!' + utils.condition(line_right, context) + ') {';
        break;
      // elsif / elseif
      case 'elsif':
      case 'elseif':
        if (loopName !== 'if')
          loopNotMatch();
        else {
          setLineNumber();
          script += '} else if ' + utils.condition(line_right, context) + ' {';
        }
        break;
      // case 判断
      case 'case':
        enterLoop(line_left);
        setLineNumber();
        script += 'switch (' + utils.localsWrap(line_right, null, context.saveLocalsName) + ') {';
        break;
      case 'when':
        if (context.hasWhen)
          script += 'break;\n';
        if (loopName !== 'case')
          loopNotMatch();
        else {
          script += 'case ' + utils.localsWrap(line_right, null, context.saveLocalsName) + ':';
          setLineNumber();
          context.hasWhen = true;
        }
        break;  
      // for 循环
      case 'for':
        enterLoop(line_left);
        var s = utils.forloops(line_right, context);
        if (s === null)
          syntaxError();
        else {
          setLineNumber();
          script += s;
        }
        break;
      // tablerow 循环
      case 'tablerow':
        enterLoop(line_left);
        var s = utils.tablerow(line_right, context);
        if (s === null)
          syntaxError();
        else {
          setLineNumber();
          script += s;
        }
        break;
      // assign 定义变量
      case 'assign':
        var eq_op = line_right.indexOf('=');
        if (eq_op === -1) {
          syntaxError();
        }
        else {
          var assign_name = utils.localsWrap(line_right.substr(0, eq_op).trim(), null, context.saveLocalsName);
          context.assignNames[assign_name] = true;
          var assign_expr = utils.assign(line_right.substr(eq_op + 1).trim(), context);
          setLineNumber();
          script += 'global.' + assign_name + ' = ' + assign_expr + ';';
        }
        break;
      // capture 定义变量块
      case 'capture':
        enterLoop(line_left);
        var n = utils.localsWrap(line_right, null, context.saveLocalsName);
        setLineNumber();
        script += 'global.' + n + ' = ' + n + ' = (function () {\n'
                + 'var $_buf = \'\';\n'
                + 'try {\n'
                + '/* captures */\n';
        break;
      // include 标记
      case 'include':
        var inc_blocks = utils.split(line_right);
        var inc_tag = {};
        var inc_ok = false;
        if (inc_blocks.length === 1) {
          inc_tag.name = utils.stripQuotes(inc_blocks[0]);
          inc_ok = true;
        }
        else if (inc_blocks.length === 3) {
          inc_tag.name = utils.stripQuotes(inc_blocks[0]);
          inc_tag.with = utils.stripQuotes(inc_blocks[2]);
          inc_ok = true;
        }
        else {
          syntaxError();
        }
        if (inc_ok) {
          // 添加到依赖的资源文件
          context.addIncludes(inc_tag.name);
          // 如果提供了该资源文件，则插入代码
          if (context.files[inc_tag.name]) {
            setLineNumber();
            script += '/* === include "' + inc_tag.name + '"' + (inc_tag.with ? ' with "' + inc_tag.with + '"' : '') + ' === */\n'
                    + 'try {\n'
                    + '$_buf+=((function (locals) {\n'
                    + context.files[inc_tag.name] + '\n'
                    + 'return $_buf;\n'
                    + '})(' + (inc_tag.with ? utils.localsWrap(inc_tag.with) : 'locals') + '));\n'
                    + '} catch (err) {\n'
                    + '  $_rethrow(err);\n'
                    + '}\n'
                    + '/* === end include "' + inc_tag.name + '" === */';
          }
        }
        break;
      // cycle 循环字符串
      case 'cycle':
        var s = utils.cycle(line_right, context);
        if (s === null)
          syntaxError();
        else {
          setLineNumber();
          script += s;
        }
        break;
      // 其他
      default:
        unknowTag();
    }
  }
  
  return {start: start, end: end, script: script}
};
    return exports;
  })(m, m.exports);
  modules.parser = m.exports;
  /*-----------------------------------------------*/
  
  /*-------------- ./lib/template.js --------------*/
  var m = {exports: {}};
  (function (module, exports) {
    'use strict';

/**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */


var parser = modules.parser;
var utils = modules.utils;
var filters = modules.filters;



/**
 * 编译代码(仅解析模板)
 *
 * @param {string} text
 * @param {object} options  files:子模版文件代码,用parse编译
 * @return {object}
 */
exports.parse = function (text, options) {
  options = options || {};
  
  var line_number = 1; // 行号
  var html_start = 0;  // HTML代码开始
  var scripts = [];    // 编译后的代码
  var context = {}     // 编译时传递的环境变量
  
  scripts.add = function (s) {
    scripts.push(s);
  };
  
  // 初始化编译环境
  context.loop = 0;           // { 嵌套层数
  context.loopName = [];      // 当前嵌套标记名称
  context.isRaw = false;      // 是否为raw标记
  context.assignNames = {};   // 使用assign标记定义的变量名称
  context.varNames = {};      // 变量的名称及引用的次数
  context.saveLocalsName = function (name) {  // 使用变量名称
    // 忽略tablerowloop和forloop
    if (name.substr(0, 13) === 'tablerowloop.' || name.substr(0, 8) === 'forloop.')
      return;
    if (!context.varNames[name])
      context.varNames[name] = 1;
    else
      context.varNames[name]++;
  };
  context.includes = {};                  // 包含的子模版
  context.files = options.files || {};    // 提供的资源文件
  context.addIncludes = function (name) { // 包含子模版
    if (!context.includes[name])
      context.includes[name] = 1;
    else
      context.includes[name]++;
  };
  context.cycles = {};        // cycle标记中的变量列表
  context.addCycle = function (key, list) {  // 添加cycle
    context.cycles[key] = list;
  };
  
  // 捕捉严重的错误
  var catchError = function (data) {
    if (!context.error && data) {
      context.error = {
        start:      data.start,
        end:        data.end,
        line:       data.line,
        message:    'SyntaxError: Unexpected end of input'
      }
    }
    
    // 生成出错信息描述
    var html_top = utils.outputHtml(text.slice(0, context.error.start));
    var html_bottom = utils.outputHtml(text.slice(context.error.end));
    var html_error = 'Line:' + line_number + '\n'
                   + '    ' + context.error.line + '\n\n'
                   + context.error.message + '\n';
    // 嵌套栈
    var loop;
    while (loop = context.loopName.pop()) {
      html_error += '    at ' + loop.line + ' (line: ' + loop.line_num + ')\n';
    }
    
    // 输出出错信息
    html_error = utils.outputHtml(html_error);
    scripts.splice(0, scripts.length);
    scripts.add('$_buf+=(\'' + html_top + '\');');
    scripts.add('$_buf+=($_err(\'' + html_error + '\'));');
    scripts.add('$_buf+=(\'' + html_bottom + '\');');
    
    html_start = text.length;
  };
  
  for (var i = 0, len; len = text.length, i < len; i++) {
    var block = text.substr(i, 2);
    if (text[i] === '\n')
      line_number++;
    context.line_num = line_number;
    
    //console.log('Block: ' + block);
    switch (block) {
      // 变量
      case '{{':
        var ret = parser.output(text, i, context);
        break;     
      // 语句
      case '{%':
        var ret = parser.tags(text, i, context);
        break;  
      // HTML代码
      default:
        var ret = null;
    }
    
    // 检查是否出错
    if (context.error) {
      catchError();
      break;
    }
    
    if (ret !== null) {
      //console.log(ret);
      var html = text.slice(html_start, ret.start);
      if (html.length > 0) {
        html = utils.outputHtml(html);
        scripts.add('$_buf+=(\'' + html + '\');');
      }
      // 代码
      scripts.add(ret.script);
      
      i = ret.end - 1;
      html_start = ret.end;
    }
  }
  
  // 最后一部分的HTML
  var html = text.slice(html_start, len);
  if (html.length > 0) {
    html = utils.outputHtml(html);
    scripts.add('$_buf+=(\'' + html + '\');');
  }
  
  // 检查是否出错(嵌套是否匹配)
  if (context.loopName.length > 0) {
    catchError(context.loopName.pop());
  }
  
  // 生成cycle定义
  var define_cycle = '/* == define cycles == */\n';
  for (var i in context.cycles) {
    var c = context.cycles[i];
    var n = '$_cycle_' + i;
    var s = 'var ' + n + ' = {i: 0, length: ' + c.length + ', items: [' + c.join(',') + ']}\n';
    define_cycle += s;
  }
  define_cycle += 'var $_cycle_next = function (n) {\n'
                + 'n.i++;\n'
                + 'if (n.i >= n.length) n.i = 0;\n'
                + '}\n';
  
  // 包装
  var wrap_top =    '/* == Template Begin == */\n'
               +    'var $_buf = \'\';\n'
               +    'var $_line_num = 0;\n'
               +    define_cycle;
  var wrap_bottom = '\n/* == Template End == */\n';
  var code = wrap_top + scripts.join('\n') + wrap_bottom;
  
  // console.log('names', context.varNames);
  // console.log('includes', context.includes);
  
  return {code: code, names: context.varNames, includes: context.includes};
};

/**
 * 编译代码(可运行的函数代码)
 *
 * @param {string} text 模板内容
 * @param {object} options 选项  files:子模版文件代码, original:是否返回原始代码
 * @return {function}
 */
exports.compile = function (text, options) {
  options = options || {};
  
  // 编译代码
  var tpl = exports.parse(text, options);
  
  if (options.original)
    var utilsFun = 'var $_html = ' + utils.outputHtml.toString() + ';\n'
                 + 'var $_err = ' + utils.errorMessage.toString() + ';\n'
                 + 'var $_rethrow = ' + utils.rethrowError.toString() + ';\n'
                 + 'var $_merge = ' + utils.merge.toString() + ';\n'
                 + 'var $_range = ' + utils.range.toString() + ';\n'
                 + 'var $_array = ' + utils.toArray.toString() + ';\n'
                 //+ 'var $_table = ' + utils.tableSplit.toString() + ';\n'
  else
    var utilsFun = '';
  
  var script = '(function (locals, filters, $_html, $_err, $_rethrow, $_merge, $_range, $_array) { \n'
             + '\'use strict\';\n'
             + 'locals = locals || {};\n'
             + 'filters = filters || {};\n'
             + 'var global = {locals: locals, filters: filters};\n'
             + utilsFun
             + 'try { \n'
             + tpl.code + '\n'
             + '} catch (err) {\n'
             + '  $_rethrow(err);\n'
             + '}\n'
             + 'return $_buf;\n'
             + '})';
  //console.log(script);
  try {
    var fn = eval(script);
    
    // 设置依赖的资源
    fn.names = tpl.names;         // 变量
    fn.includes = tpl.includes;   // 子模版
    
    // 如果设置了original=true选项，则直接返回原始代码，否则自动封装filters
    if (options.original)
      return fn;
      
    // 封装filters
    var fnWrap = function (d, f) {
      return fn(d, f || filters, utils.outputHtml, utils.errorMessage, utils.rethrowError,
                utils.merge, utils.range, utils.toArray);
    };
    fnWrap.names = fn.names;
    fnWrap.includes = fn.includes;
    return fnWrap;
  }
  catch (err) {
    throw Error('Compile error: ' + err);
  }
};

/**
 * 渲染
 *
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @param {object} f 自定义函数
 * @return {text}
 */
exports.render = function (text, data, f) {
  var fn = exports.compile(text);
  return fn(data, f);
};

    return exports;
  })(m, m.exports);
  modules.template = m.exports;
  /*-----------------------------------------------*/
  
  /*------------ ./lib/advtemplate.js -------------*/
  var m = {exports: {}};
  (function (module, exports) {
    'use strict';

/**
 * 编译整套模板
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var template = modules.template;
var utils = modules.utils;
var AsyncDataList = utils.AsyncDataList;


/**
 * 编译所有模板
 *
 * @param {object} files 模板文件内容，如: {abc: '...', efc: '...'}
 * @param {object} options 选项  original:是否返回原始代码
 * @return {object}
 */
exports.compileAll = function (files, options) {
  options = options || {};
  
  // 第一遍编译
  var pCodes = {};
  var pFiles = {};
  for (var i in files) {
    var tpl = template.parse(files[i]);
    pCodes[i] = tpl;
    pFiles[i] = tpl.code;
  }
  
  // 合并模板文件依赖的变量
  var mergeRequire = function (f, field) {
    // console.log('merge', f, field);
    var ns = {};      // 名称
    var _f = {};      // 已分析过的模板名称
    
    var addName = function (n, c) {
      // console.log('add', f, field, n, c);
      if (!ns[n])
        ns[n] = c;
      else
        ns[n] += c;
    };
    
    // 初始化ns
    var t = pCodes[f];
    for (var i in t[field])
      addName(i, t[field][i]);
    
    // 合并子模版中的名称
    var m = function (f) {
      // console.log('m', f, _f);
      if (f in _f)
        return false;
      else
        _f[f] = true;
      
      var t = pCodes[f];
      if (!t)
        throw Error('Cannot find include file "' + f + '".');
      
      // 合并名称
      for (var i in t[field])
        addName(i, t[field][i]);
        
      // 合并子模版
      for (var i in t.includes)
        m(i);
        
      return true;
    };
    m(f);
    
    return ns;
  };
  
  // 计算深度的依赖关系
  for (var i in files) {
    pCodes[i].names = mergeRequire(i, 'names');
    pCodes[i].includes = mergeRequire(i, 'includes');
    // 如果出现闭环，则抛出异常
    if (i in pCodes[i].includes)
      throw Error('Cannot include file "' + i + '" in file "' + i + '".');
  }
  
  // 根据依赖关系安排模板文件的编译顺序
  // 计算得分
  var scores = {};
  for (var i in pCodes) {
    scores[i] = 0;
  }
  for (var i in pCodes) {
    scores[i]++;
    for (var j in pCodes[i].includes) {
      scores[j]++;
    }
  }
  // 按照得分排序
  var _scores = [];
  for (var i in scores) {
    _scores.push({n: i, s: scores[i]});
  }
  scores = _scores.sort(function (a, b) {
    return a.s < b.s;
  });
  // console.log(scores);
  
  // 第二遍编译
  var opt = utils.merge(options, {files: pFiles});
  for (var i in scores) {
    var n = scores[i].n;
    var tpl = template.parse(files[n], opt);
    pFiles[n] = tpl.code;
  }
  
  // 最后编译
  var cFn = {};
  var opt = utils.merge(options, {files: pFiles});
  for (var i in files) {
    var tpl = template.compile(files[i], opt);
    cFn[i] = tpl;
    cFn[i].names = pCodes[i].names;
    cFn[i].includes = pCodes[i].includes;
  }
  
  return cFn;
};


/**
 * 高级渲染
 *
 * @param {function} render   通过compile()编译出的模板渲染函数
 * @param {object} models     获取数据的函数 {'name': function (env, callback) {}}
 * @param {object} options    选项： parallel: true 并行方式获取，默认为false
 *                                   filters: 自定义函数
 *                                   env: 环境变量，即models函数中的第一个参数
 * @param {function} callback 回调 function (err, text)
 */
exports.advRender = function (render, models, options, callback) {
  // 获取模板需要的变量数据
  var names = Object.keys(render.names);
  var dataList = AsyncDataList(models, names, options.env);
  
  var cb = function (err, data) {
    if (err)
      return callback(err);
    try {
      var text = render(data, options.filters);
      return callback(null, text);
    }
    catch (err) {
      return callback(err);
    }
  };
  
  if (options.parallel)
    dataList.startParallel(cb);
  else
    dataList.start(cb);
};


    return exports;
  })(m, m.exports);
  modules.advtemplate = m.exports;
  /*-----------------------------------------------*/
  
  /*------------------ ./index.js -----------------*/
  'use strict';

/**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 

var template = modules.template;
var advtemplate = modules.advtemplate;
var filters = modules.filters; 
 

// 兼容Liquid中数组和字符串的size属性
try {
  Object.defineProperty(Array.prototype, 'size', {get: function () { return this.length; }});
}
catch (err) {}
try {
  Object.defineProperty(String.prototype, 'size', {get: function () { return this.length; }});
}
catch (err) {}

// 版本
exports.version = '0.0.5';
 
// 解析代码
exports.parse = wrap('parse', template.parse);

// 编译函数
exports.compile = wrap('compile', template.compile);

// 渲染函数
exports.render = wrap('render', template.render);

// 编译整套模板
exports.compileAll = wrap('compileAll', advtemplate.compileAll);

// 高级渲染
exports.advRender = wrap('advRender', advtemplate.advRender);

// 内置函数
exports.filters = filters;

// 支持在express内渲染
exports.__express = wrap('__express', modules.express);


// 用于测试函数被调用次数及来源
function wrap (name, fn) {
  if (typeof process !== 'undefined' && process.env && /true/.test(process.env.TINYLIQUID_TEST)) {
    var i = 0;
    return function () {
      i++;
      var source = new Error().stack.split('\n').slice(2).join('\n');
      console.log('call tinyliquid.' + name + '() ' + i + ' times \n' + source);
      return fn.apply(null, arguments);
    };
  }
  else {
    return fn;
  }
};
 
  return exports;
  /*-----------------------------------------------*/
})({});

// 如果是在Node.js环境，则输出module.exports
if (typeof module !== 'undefined' && module.exports)
  module.exports = TinyLiquid;
