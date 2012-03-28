/**
 * 代码分析器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var utils = require('./utils');
var template = require('./template');


exports.output = function (text, start, context) {
  if (context.isRaw)
    return null;
    
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
  
  // 支持筛选器
  var script = '$_buf.push(' + utils.filtered(line) + ');';
  
  return {start: start, end: end, script: script};
}

 
exports.tags = function (text, start, context) {
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
  // console.log('Line: ' + line);
  
  // 解析语句
  var space_start = line.indexOf(' ');
  var script = '';
  
  // 当前在raw标记内，则只有遇到 enddraw 标记时才能终止
  if (context.isRaw) {
    if (line === 'endraw') {
      context.isRaw = false;
      return {start: start, end: end, script: '/* endraw */'}
    }
    else {
      return null;
    }
  }
  
  // 嵌套开始
  var enterLoop = function (name) {
    context.loop++;
    context.loopName.push(name);
  }
  
  // 退出嵌套
  var outLoop = function () {
    context.loop--;
    context.loopName.pop();
  }
  
  // 当前嵌套名称
  var loopName = context.loopName[context.loopName.length - 1];
  
  // 简单标记(一般为标记结尾)
  if (space_start === -1) {
    switch (line) {
      // raw 标记
      case 'raw':
        context.isRaw = true;
        script = '/* raw */';
        break;
      // endif
      case 'endif':
        if (loopName !== 'if')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '}';
        outLoop();
        break;
      // endunless
      case 'endunless':
        if (loopName !== 'unless')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '}';
        outLoop();
        break;
      // else
      case 'else':
        if (loopName === 'if' || loopName === 'unless')
          script = '} else {';
        else if (loopName === 'case')
          script = 'break;\ndefault:';
        else
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        break;
      // endcase
      case 'endcase':
        if (loopName !== 'case')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '}';
        outLoop();
        break;
      // endfor
      case 'endfor':
        if (loopName !== 'for')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '}\n'
                 + '})($_merge(locals));';
        outLoop();
        break;
      // endtablerow
      case 'endtablerow':
        if (loopName !== 'tablerow')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '}\n'
                 + '}\n'
                 + '})($_merge(locals));';
        outLoop();
        break;
      // endcapture
      case 'endcapture':
        if (loopName !== 'capture')
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = '} catch (err) {\n'
                 + '  $_buf.push($_err(err));\n'
                 + '}\n'
                 + 'return $_buf.join(\'\');\n'
                 + '})([]);';
        outLoop();
        break;
      // 出错
      default:
        script = '$_buf.push($_err(\'' + line + '\'))';
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
        script = 'if ' + utils.condition(line_right) + ' {';
        break;
      case 'unless':
        enterLoop(line_left);
        script = 'if (!' + utils.condition(line_right) + ') {';
        break;
      // case 判断
      case 'case':
        enterLoop(line_left);
        script = 'switch (' + utils.localsWrap(line_right) + ') {';
        break;
      case 'when':
        if (context.hasWhen)
          script = 'break;\n';
        if (loopName !== 'case')
          script += '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else {
          script += 'case ' + utils.localsWrap(line_right) + ':'
          context.hasWhen = true;
        }
        break;  
      // for 循环
      case 'for':
        enterLoop(line_left);
        var s = utils.forloops(line_right, context.loop);
        if (s === null)
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = s;
        break;
      // tablerow 循环
      case 'tablerow':
        enterLoop(line_left);
        var s = utils.tablerow(line_right, context.loop);
        if (s === null)
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        else
          script = s;
        break;
      // assign 定义变量
      case 'assign':
        var b = utils.split(line_right);
        if (b.length === 3 && b[1] === '=') {
          b[0] = utils.localsWrap(b[0]);
          b[2] = utils.localsWrap(b[2]);
          script = 'global.' + b[0] + ' = ' + b[0] + ' = ' + b[2] + ';';
        }
        else {
          script = '$_buf.push($_err(\'Unexpected token: ' + line + '\'))';
        }
        break;
      // capture 定义变量块
      case 'capture':
        enterLoop(line_left);
        var n = utils.localsWrap(line_right);
        script = 'global.' + n + ' = ' + n + ' = (function ($_buf) {\n'
               + 'try {\n'
               + '/* captures */\n';
        break;
      // 其他
      default:
        script = '$_buf.push($_err(\'' + line + '\'))';
    }
  }
  
  return {start: start, end: end, script: script}
}