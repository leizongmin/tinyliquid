/**
 * 简单模板引擎
 */
 



var $_escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var outputHtml = function (html) {
  return html.replace(/\\/img, '\\')
             .replace(/'/img, '\\\'')
             .replace(/"/img, '\\\"')
             .replace(/\r/img, '\\r')
             .replace(/\n/img, '\\n');
}
 
/**
 * 编译代码
 *
 * @param {string} text
 * @return {string}
 */
exports.parse = function (text) {
  var line_number = 0; // 行号
  var html_start = 0;  // HTML代码开始
  var scripts = [];    // 编译后的代码
  var context = {}     // 编译时传递的环境变量
  
  // 初始化编译环境
  context.loop = 0;    // { 嵌套层数
  
  for (var i = 0, len; len = text.length, i < len; i++) {
    var block = text.substr(i, 3);
    if (text[i] = '\n')
      line_number++;
    
    switch (block) {     
      // 变量
      case '{{ ':
        var ret = parseValue(text, i, context);
        break;     
      // 语句
      case '{% ':
        var ret = parseSentence(text, i, context);
        break;  
      // 其他
      default:
        var ret = null;
    }
    
    if (ret !== null) {
      //console.log(ret);
      var html = text.slice(html_start, ret.start);
      html = outputHtml(html);
      scripts.push('$_buf.push(\'' + html + '\');');
      scripts.push(ret.script);
      i = ret.end;
      html_start = ret.end;
    }
  }
  
  // 最后一部分的HTML
  var html = text.slice(html_start, len);
  html = outputHtml(html);
  scripts.push('$_buf.push(\'' + html + '\');');
  
  var wrap_top =    '/* easytpl */\n'
               +    'var $_buf = [];\n'
               +    'var $_escape = ' + $_escape.toString() + '\n';
  var wrap_bottom = '\n/* easytpl */';
  
  return wrap_top + scripts.join('\n') + wrap_bottom;
}

var parseValue = function (text, start, context) {
  // 查找结束标记
  var end = text.indexOf(' }}', start);
  if (end === -1)
    return null;
  
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
  
  var line = text.slice(start + 3, end).trim();
  end += 3;
  
  // :varname 为不执行escape()转换
  if (line[0] === ':') {
    var script = '$_buf.push(' + line.substr(1) + ');';
  }
  else {
    var script = '$_buf.push($_escape(' + line + '));';
  }
  return {start: start, end: end, script: script};
}

var parseSentence = function (text, start, context) {
  // 查找结束标记
  var end = text.indexOf(' %}', start);
  if (end === -1)
    return null;
    
  // 检查结束标记是否为同一行的
  var lineend = text.indexOf('\n', start);
  if (lineend > -1 && lineend < end)
    return null;
 
  var line = text.slice(start + 3, end).trim();
  end += 3;
  
  // 解析程序语句
  var space_start = line.indexOf(' ');
  var script = '';
  
  // 简单语句
  if (space_start === -1) {
    switch (line) {
      // 循环/条件判断结束
      case 'end':
      case 'endfor':
      case 'endif':
      case 'endwhile':
        script = '}';
        context.loop--;
        break;
      case 'else':
        script = '} else {';
        break;
      // 出错
      default:
        script = sentenceError(line);
    }
  }
  // 复杂
  else {
    var line_left = line.substr(0, space_start);
    var line_right = line.substr(space_start).trim();
    switch (line_left) {
      // if/while 判断
      case 'if':  
      case 'while':
        context.loop++;
        script = line_left + ' (' + line_right + ') {';
        break;
      // for 循环
      case 'for':
        context.loop++;
        var blocks = line_right.split(/\s+/);
        // {% for arrays %}
        if (blocks.length === 1) {
          var vn = '$_loop_' + context.loop;
          script = 'for (var ' + vn + ' in ' + blocks[0] + ') {\n'
                 + 'var item = ' + blocks[0] + '[' + vn + '];';
        }
        // {% for item in arrays %}
        else if (blocks.length === 3) {
          var vn = '$_loop_' + context.loop;
          script = 'for (var ' + vn + ' in ' + blocks[2] + ') {\n'
                 + 'var ' + blocks[0] + ' = ' + blocks[2] + '[' + vn + '];';
        }
        // 出错
        else {
          script = sentenceError(line);
        }
        break;
      // else if 判断
      case 'else':
        if (line_right.substr(0, 3) === 'if ') {
          script = '} else if (' + line_right.substr(3).trim() + ') {';
        }
        else {
          script = sentenceError(line);
        }
        break;
      // 筛选器  first: arrays
      default:
        if (line_left.substr(-1) === ':') {
          var name = 'filters.' + line_left.substr(0, line_left.length - 1);
          script = name + '(' + line_right + ');';
        }
        else {
          script = sentenceError(line);
        }
    }
  }
  
  return {start: start, end: end, script: script}
}


/**
 * 编译代码
 *
 * @param {string} text
 * @return {function}
 */
exports.compile = function (text) {
  var script = '(function (locals) { \n'
             + 'with (locals) {\n'
             + '  try { \n'
             + exports.parse(text) + '\n'
             + '    return $_buf.join(\'\');\n'
             + '  } catch (err) {\n'
             + '    throw Error(err);\n'
             + '  }\n'
             + '}\n'
             + '})';
  console.log(script);
  return eval(script);
}

var sentenceError = function (msg) {
  msg = outputHtml('<div style="font-weight:bold; font-size:14px; color:red">'
                  + 'Compile error: ' + msg + '<div>');
  var script = '$_buf.push(\'' + msg + '\');';
  return script;
}