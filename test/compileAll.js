var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  var compileAll = function (files, options) {
    options = options || {};
    options.original = true;
    var ret = liquid.compileAll(files, options);
    //console.log(ret);
    return ret;
  }
  
  it('#compileAll()', function () {
    //return;
    var files = {
      index:  '{% include "header" %}{% for num in (1..20) %}{% include "item" %}{% endfor %}{% include "bottom" %}',
      header: '<header>{{ title }}</header>',
      bottom: '<footer>{{ copyright }}{{ num }}</footer>',
      item:   '{% include "header" %}<span>{{ num }}</span>{% include "bottom" %}'
    };
    
    var fns = compileAll(files);
    
    should.exist(fns.index);
    should.exist(fns.header);
    should.exist(fns.bottom);
    should.exist(fns.item);
    
    should.exist(fns.index.names.num);
    should.exist(fns.index.names.title);
    should.exist(fns.index.names.copyright);
    should.exist(fns.header.names.title);
    should.not.exist(fns.header.names.num);
    should.not.exist(fns.header.names.copyright);
    should.exist(fns.bottom.names.copyright);
    should.exist(fns.bottom.names.num);
    should.not.exist(fns.bottom.names.title);
    should.exist(fns.item.names.num);
    should.exist(fns.item.names.title);
    should.exist(fns.item.names.copyright);
    
    should.exist(fns.index.includes.header);
    should.exist(fns.index.includes.bottom);
    should.exist(fns.index.includes.item);
    should.not.exist(fns.header.includes.index);
    should.not.exist(fns.header.includes.bottom);
    should.not.exist(fns.header.includes.item);
    should.not.exist(fns.bottom.includes.header);
    should.not.exist(fns.bottom.includes.item);
    should.not.exist(fns.header.includes.index);
    should.exist(fns.item.includes.header);
    should.exist(fns.item.includes.bottom);
    should.not.exist(fns.item.includes.index);
  });
  
  // Éî²ã´ÎÇ¶Ì×
  it('#compileAll()  deep', function () {
    //return;
    var files = {
      one:    '{% include "two" %}',
      two:    '{% include "three" %}',
      three:  '{% include "four" %}',
      four:   '{% include "five" %}',
      five:   '{% include "six" %}',
      six:    '{{ title }}'
    };
    
    var fns = compileAll(files);
    
    should.exist(fns.one.names.title);
    should.exist(fns.one.includes.two);
    should.exist(fns.one.includes.three);
    should.exist(fns.one.includes.four);
    should.exist(fns.one.includes.five);
    should.exist(fns.one.includes.six);
    
    should.exist(fns.two.names.title);
    should.not.exist(fns.two.includes.one);
    should.exist(fns.two.includes.three);
    should.exist(fns.two.includes.four);
    should.exist(fns.two.includes.five);
    should.exist(fns.two.includes.six);
    
    should.exist(fns.three.names.title);
    should.not.exist(fns.three.includes.one);
    should.not.exist(fns.three.includes.two);
    should.exist(fns.three.includes.four);
    should.exist(fns.three.includes.five);
    should.exist(fns.three.includes.six);
    
    //console.log(fns.one.toString());
    fns.one({title: 'hello'}).should.equal('hello');
    fns.two({title: 'hello'}).should.equal('hello');
    fns.three({title: 'hello'}).should.equal('hello');
    fns.four({title: 'hello'}).should.equal('hello');
    fns.five({title: 'hello'}).should.equal('hello');
    fns.six({title: 'hello'}).should.equal('hello');
  });
  
  // ±Õ»·Ç¶Ì×
  it('#compileAll()  loop', function () {
    
    var files = {
      one:    '{% include "two" %}',
      two:    '{% include "three" %}',
      three:  '{% include "one" %}',
    };
    
    try {
      var fns = compileAll(files);
      var isOk = false;
    }
    catch (err) {
      var isOk = true;
    }
    should.exist(isOk);
  });
  
  // ±àÒë
  it('#compileAll() example', function () {
  
    var files = {
      title:    '<title>{{ value }}</title>',
      header:   '<head>{% include "title" with header %}</head>',
      bottom:   '<footer>{% include "title" with bottom %}</footer>',
      item:     '<li>{% include "title" with item %}</li>',
      index:    '{% include "header" %}<ul>{% for item in items %}{% include "item" %}{% endfor %}</ul>{% include "bottom" %}'
    };
  
    var fns = liquid.compileAll(files);
    
    fns.title({value: 'hello'}).should.equal('<title>hello</title>');
    fns.header({header: {value: 'fine.'}}).should.equal('<head><title>fine.</title></head>');
    fns.bottom({bottom: {value: 'fine.'}}).should.equal('<footer><title>fine.</title></footer>');
    fns.item({item: {value: 'yeah!'}}).should.equal('<li><title>yeah!</title></li>');
    fns.index({
      header: {value: 'this is header'},
      bottom: {value: 'this is bottom'},
      items:  [{value: 'one'}, {value: 'two'}, {value: 'three'}]
    }).should.equal('<head><title>this is header</title></head>'
                  + '<ul>'
                  + '<li><title>one</title></li>'
                  + '<li><title>two</title></li>'
                  + '<li><title>three</title></li>'
                  + '</ul>'
                  + '<footer><title>this is bottom</title></footer>'
                  );
  
  });
  
});