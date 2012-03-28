/**
 * 模板引擎
 *
 * @author 老雷<leizongmin@gmail.com>
 */


var parser = require('./parser');
var utils = require('./utils');
var filters = require('./filters');



/**
 * 编译代码(仅解析模板)
 *
 * @param {string} text
 * @return {string}
 */
exports.parse = function (text) {
  var line_number = 1; // 行号
  var html_start = 0;  // HTML代码开始
  var scripts = [];    // 编译后的代码
  var context = {}     // 编译时传递的环境变量
  
  scripts.add = function (s) {
    scripts.push(s);
  }
  
  // 初始化编译环境
  context.loop = 0;           // { 嵌套层数
  context.loopName = [];      // 当前嵌套标记名称
  context.isRaw = false;      // 是否为raw标记
  
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
    scripts.add('$_buf.push(\'' + html_top + '\');');
    scripts.add('$_buf.push($_err(\'' + html_error + '\'));');
    scripts.add('$_buf.push(\'' + html_bottom + '\');');
    
    html_start = text.length;
  }
  
  for (var i = 0, len; len = text.length, i < len; i++) {
    var block = text.substr(i, 3);
    if (text[i] === '\n')
      line_number++;
    context.line_num = line_number;
    
    //console.log('Block: ' + block);
    switch (block) {
      // 变量
      case '{{ ':
        var ret = parser.output(text, i, context);
        break;     
      // 语句
      case '{% ':
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
        scripts.add('$_buf.push(\'' + html + '\');');
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
    scripts.add('$_buf.push(\'' + html + '\');');
  }
  
  // 检查是否出错(嵌套是否匹配)
  if (context.loopName.length > 0) {
    catchError(context.loopName.pop());
  }
  
  // 包装
  var wrap_top =    '/* == Template Begin == */\n'
               +    'var $_buf = [];\n'
               +    'var $_line_num = 0;\n';
  var wrap_bottom = '\n/* == Template End == */\n';
  
  return wrap_top + scripts.join('\n') + wrap_bottom;
}

/**
 * 编译代码(可运行的函数代码)
 *
 * @param {string} text
 * @return {function}
 */
exports.compile = function (text) {
  var script = '(function (locals, filters) { \n'
             + 'locals = locals || {};\n'
             + 'filters = filters || {};\n'
             + 'var global = {locals: locals, filters: filters};\n'
             + 'var $_html = ' + utils.outputHtml.toString() + ';\n'
             + 'var $_err = ' + utils.errorMessage.toString() + ';\n'
             + 'var $_rethrow = ' + utils.rethrowError.toString() + ';\n'
             + 'var $_merge = ' + utils.merge.toString() + ';\n'
             + 'var $_range = ' + utils.range.toString() + ';\n'
             + 'var $_array = ' + utils.toArray.toString() + ';\n'
             //+ 'var $_table = ' + utils.tableSplit.toString() + ';\n'
             + 'try { \n'
             + exports.parse(text) + '\n'
             + '} catch (err) {\n'
             + '  $_rethrow(err);\n'
             + '}\n'
             + 'return $_buf.join(\'\');\n'
             + '})';
  //console.log(script);
  try {
    var fn = eval(script);
    return fn;
  }
  catch (err) {
    throw Error('Compile error: ' + err);
  }
}
