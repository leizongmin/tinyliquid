'use strict';

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
  
  var methods = {
    enterLoop:    enterLoop,
    outLoop:      outLoop,
    loopNotMatch: loopNotMatch,
    syntaxError:  syntaxError,
    unknowTag:    unknowTag,
    filtered:     utils.filtered,
    localsWrap:   utils.localsWrap
  };
  
  // 当前嵌套名称
  if (context.loopName.length > 0)
    var loopName = context.loopName[context.loopName.length - 1].name;
  else
    var loopName = '';
  
  context.ignoreOutput = false;
  
  // 简单标记(一般为标记结尾)
  if (space_start === -1) {
    // 是否为自定义标记
    if (typeof context.customTags[line] === 'function') {
      setLineNumber();
      var s = context.customTags[line]([], line, context, methods);
      if (s === null)
        syntaxError();
      else if (typeof s === 'string')
        script += s + '\n';
    }
    else {
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
  }
  // 复杂标记(一般为标记开头)
  else {
    var line_left = line.substr(0, space_start);
    var line_right = line.substr(space_start).trim();
    // 是否为自定义标记
    if (typeof context.customTags[line_left] === 'function') {
      setLineNumber();
      var s = context.customTags[line_left](line_right.split(/\s+/), line_right, context, methods);
      if (s === null)
        syntaxError();
      else if (typeof s === 'string')
        script += s + '\n';
    }
    else {
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
          if (context.hasWhen) {
            script += 'break;\n';
            context.ignoreOutput = false;
          }
          else
            context.ignoreOutput = true;
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
  }
  
  return {start: start, end: end, script: script}
};