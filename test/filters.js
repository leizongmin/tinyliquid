var should = require('should');
var filters = require('../lib/filters');

describe('filters', function () {
  
  //----------------------------- HTML Filters ---------------------------------
  it('#img_tag', function () {
    filters.img_tag('xxxxx.png').should.equal('<img src="xxxxx.png" alt="">');
    filters.img_tag('xxxxx.png', 'yyy').should.equal('<img src="xxxxx.png" alt="yyy">');
  });
  
  it('#script_tag', function () {
    filters.script_tag('sssssssss.js').should.equal('<script src="sssssssss.js"></script>');
  });
  
  it('#stylesheet_tag', function () {
    filters.stylesheet_tag('xxxx.css').should.equal('<link href="xxxx.css" rel="stylesheet" type="text/css" media="all" />');
    filters.stylesheet_tag('xxxx.css', 'screen').should.equal('<link href="xxxx.css" rel="stylesheet" type="text/css" media="screen" />');
  });
  
  it('#link_to', function () {
    filters.link_to('link').should.equal('<a href="" title="">link</a>');
    filters.link_to('link', 'url').should.equal('<a href="url" title="">link</a>');
    filters.link_to('link', 'url', 'title').should.equal('<a href="url" title="title">link</a>');
  });
  
  //----------------------------------- Math Filters ---------------------------
  it('#plus', function () {
    filters.plus(1, 2).should.equal(1 + 2);
    filters.plus(1.5, 2.2).should.equal(1.5 + 2.2);
    filters.plus(1.666).should.equal(1.666);
  });
  
  it('#minus', function () {
    filters.minus(1, 2).should.equal(1 - 2);
    filters.minus(1.5, 2.2).should.equal(1.5 - 2.2);
    filters.minus(1.666).should.equal(1.666);
  });
  
  it('#times', function () {
    filters.times(1, 2).should.equal(1 * 2);
    filters.times(1.5, 2.2).should.equal(1.5 * 2.2);
    filters.times(1.666).should.equal(0);
  });
  
  it('#divided_by', function () {
    filters.divided_by(1, 2).should.equal(1 / 2);
    filters.divided_by(1.5, 2.2).should.equal(1.5 / 2.2);
    filters.divided_by(1.666).should.equal(1.666 / 0);
  });
  
  it('#round', function () {
    filters.round(1).should.equal(1);
    filters.round(1.2).should.equal(1);
    filters.round(1.5).should.equal(2);
    filters.round(1.21, 1).should.equal(1.2);
    filters.round(1.25, 1).should.equal(1.3);
    filters.round(1.224, 2).should.equal(1.22);
    filters.round(1.225, 2).should.equal(1.23);
  });
  
  it('#integer', function () {
    filters.integer(1).should.equal(1);
    filters.integer(1.2).should.equal(1);
    filters.integer(5.5).should.equal(5);
    filters.integer(-6.5).should.equal(-6);
  });
  
  it('#random', function () {
    var a = filters.random();
    should.equal(a >= 0 && a < 1, true);
    var a = filters.random(10);
    should.equal(a >= 0 && a < 10, true);
    var a = filters.random(8, 9);
    should.equal(a >= 8 && a < 9, true);
  });
  
  //------------------------------- Manipulation Filters -----------------------
  it('#append', function () {
    filters.append('abc').should.equal('abc');
    filters.append('abc', 'eee').should.equal('abceee');
  });
  
  it('#prepend', function () {
    filters.prepend('abc').should.equal('abc');
    filters.prepend('abc', 'eee').should.equal('eeeabc');
  });
  
  it('#camelize', function () {
    filters.camelize('what is this').should.equal('whatIsThis');
    filters.camelize('come-from China').should.equal('comeFromChina');
    filters.camelize('a fast/powerful template+engine').should.equal('aFastPowerfulTemplateEngine');
  });
  
  it('#capitalize', function () {
    filters.capitalize('haha sa').should.equal('Haha sa');
  });
  
  it('#timestamp', function () {
    var a = filters.timestamp();
    var b = new Date().getTime();
    // 相差不超过1毫秒
    should.equal(a <= b && a >= b - 1, true);
    var c = 12345;
    var a = filters.timestamp(c);
    var b = new Date().getTime();
    should.equal(a <= b + c && a >= b + c - 1, true);
  });
  
  it('#date', function () {
    var now = new Date();
    var num = function (n) {
      return (n < 10 ? '0' : '') + n;
    };
    filters.date('now').should.equal(now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + num(now.getDate())
                          + ' ' + num(now.getHours()) + ':' + num(now.getMinutes()) + ':' + num(now.getSeconds()));
    var now = new Date('1992-12-31 15:30:40');
    filters.date(now.getTime() + '').should.equal('1992-12-31 15:30:40');
    filters.date('1992-12-31 15:30:40').should.equal('1992-12-31 15:30:40');
    filters.date(now.getTime()).should.equal('1992-12-31 15:30:40');
    filters.date(now.getTime(), '%Y-%m-%j').should.equal('1992-12-31');
    filters.date(now.getTime(), '%H:%M:%S').should.equal('15:30:40');
  });
  
  it('#downcase', function () {
    filters.downcase('aDbbFFDd').should.equal('adbbffdd');
  });
  
  it('#upcase', function () {
    filters.upcase('aDbbFFDd').should.equal('ADBBFFDD');
  });
  
  it('#escape', function () {
    filters.escape('<a a="a">&', '&lt;a a=&quot;a&quot;&gt;&amp;');
  });
  
  it('#keys', function () {
    filters.keys(null).should.eql([]);
    filters.keys(123).should.eql([]);
    filters.keys({a: 123, b: 456}).should.eql(['a', 'b']);
    filters.keys([1,2,3]).should.eql(['0', '1', '2']);
  });
  
  it('#first', function () {
    filters.first([5,7,8]).should.equal(5);
    filters.first({a: 77, b: 88}).should.equal(77);
  });
  
  it('#last', function () {
    filters.last([5,7,8]).should.equal(8);
    filters.last({a: 77, b: 88}).should.equal(88);
  });
  
  it('#handleize', function () {
    filters.handleize('a bbd =ds+das').should.equal('a-bbd-dsdas');
    filters.handleize('This\'s is a book').should.equal('thiss-is-a-book');
    filters.handleize('QuickWeb for Node.js').should.equal('quickweb-for-nodejs');
  });
  
  it('#join', function () {
    filters.join([1,2,3,4,5]).should.equal('1 2 3 4 5')
    filters.join([1,2,3,4,5], '-').should.equal('1-2-3-4-5')
    filters.join([1,2,3,4,5], '').should.equal('1 2 3 4 5')
    filters.join(555).should.equal('')
  });
  
  it('#replace', function () {
    filters.replace('abcabc', 'a', 'x').should.equal('xbcxbc');
    filters.replace('abcabc', 'c', 'x').should.equal('abxabx');
  });
  
  it('#replace_first', function () {
    filters.replace_first('abcabc', 'a', 'x').should.equal('xbcabc');
    filters.replace_first('abcabc', 'c', 'x').should.equal('abxabc');
  });
  
  it('#remove', function () {
    filters.remove('abcabc', 'a').should.equal('bcbc');
    filters.remove('abcabc', 'b').should.equal('acac');
  });
  
  it('#remove_first', function () {
    filters.remove_first('abcabc', 'a').should.equal('bcabc');
    filters.remove_first('abcabc', 'c').should.equal('ababc');
  });
  
  it('#newline_to_br', function () {
    filters.newline_to_br('abc\ndef\nghi').should.equal('abc<br>def<br>ghi');
  });
  
  it('#pluralize', function () {
    filters.pluralize(0, 'item', 'items').should.equal('item');
    filters.pluralize(1, 'item', 'items').should.equal('item');
    filters.pluralize(2, 'item', 'items').should.equal('items');
    filters.pluralize(3, 'item', 'items').should.equal('items');
  });
  
  it('#size', function () {
    filters.size(null).should.equal(0);
    filters.size().should.equal(0);
    filters.size(5).should.equal(0);
    filters.size(null).should.equal(0);
    filters.size({}).should.equal(0);
    filters.size('abcde').should.equal(5);
    filters.size([1,2,3]).should.equal(3);
  });
  
  it('#split', function () {
    filters.split('abcdefg').should.eql(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    filters.split('abc-def-ghi', '-').should.eql(['abc', 'def', 'ghi']);
    filters.split('abc-aef-aghi', 'a').should.eql(['', 'bc-', 'ef-', 'ghi']);
  });
  
  it('#strip_html', function () {
    filters.strip_html('<div id="container" class="clearfix">abc:<span>def</span></div>').should.equal('abc:def');
  });
  
  it('#strip_newlines', function () {
    filters.strip_newlines('abc\ndef\nghi').should.equal('abcdefghi');
  });
  
  it('#truncate', function () {
    filters.truncate('abcdefghi').should.equal('abcdefghi');
    filters.truncate('abcdefghi', 2).should.equal('ab');
  });
  
  it('#truncatewords', function () {
    filters.truncatewords('this is a book').should.equal('this is a book');
    filters.truncatewords('this is a book', 2).should.equal('this is');
    filters.truncatewords(' this is a book', 2).should.equal('this is');
  });
  
  it('#json', function () {
    filters.json().should.equal('{}');
    filters.json(null).should.equal(JSON.stringify(null));
    filters.json(12345).should.equal(JSON.stringify(12345));
    filters.json('What is this?').should.equal(JSON.stringify('What is this?'));
    filters.json({a:123, b: 456}).should.equal(JSON.stringify({a:123, b: 456}));
  });

  it('#substr', function () {
    filters.substr('abcd', 1).should.equal('bcd');
    filters.substr('abcd', 2, 1).should.equal('c');
    filters.substr('abcd', -2).should.equal('cd');
  });
  
  it('#get', function () {
    should.equal(filters.get(null, 'abc'), undefined);
    should.equal(filters.get(undefined, 'abc'), undefined);
    should.equal(filters.get(123554, 'abc'), undefined);
    should.equal(filters.get(false, 'abc'), undefined);
    should.equal(filters.get(true, 'abc'), undefined);
    filters.get('abcde', 'length').should.equal(5);
    filters.get({a: 123, b:456}, 'b').should.equal(456);
  });
  
  it('#reverse', function () {
    filters.reverse('abcde').should.equal('edcba');
    filters.reverse([1,2,3,4,5]).should.eql([5,4,3,2,1]);
  });
  
  it('#map', function () {
    filters.map().should.eql([]);
    filters.map(123).should.eql([]);
    filters.map([1,2,3]).should.eql([undefined, undefined, undefined]);
    filters.map([1,2,3], 'a').should.eql([undefined, undefined, undefined]);
    filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}])
      .should.eql([undefined, undefined, undefined]);
    filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}], 'a')
      .should.eql([12345, 54321, 44454]);
    filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}], 'b')
      .should.eql([45678, 78955, 2212]);
  });
  
  it('#sort', function () {
    filters.sort().should.eql([]);
    filters.sort([1,2,3,4,5]).should.eql([1,2,3,4,5]);
    filters.sort([1,2,3,4,5], 'asc').should.eql([1,2,3,4,5]);
    filters.sort([1,2,3,4,5], 'abb').should.eql([1,2,3,4,5]);
    filters.sort([1,2,3,4,5], 'desc').should.eql([5,4,3,2,1]);
    filters.sort([1,2,3,4,5], 'DEsc').should.eql([5,4,3,2,1]);
  });
  
  it('#sort_by', function () {
    filters.sort().should.eql([]);
    filters.sort_by([1,2,3,4,5]).should.eql([1,2,3,4,5]);
    var data = [{a:1, b:5}, {a:2, b:4}, {a:3, b:3}, {a:4, b:2}, {a:5, b:1}];
    var data2 = [{a:5, b:1}, {a:4, b:2}, {a:3, b:3}, {a:2, b:4}, {a:1, b:5}];
    filters.sort_by(data).should.eql(data);
    filters.sort_by(data, 'a').should.eql(data);
    filters.sort_by(data, 'a', 'desc').should.eql(data2);
    filters.sort_by(data, 'a', 'xxx').should.eql(data);
    filters.sort_by(data, 'b').should.eql(data2);
    filters.sort_by(data, 'b', 'dsds').should.eql(data2);
    filters.sort_by(data, 'b', 'desc').should.eql(data);
  });
  
  it('#pagination', function () {
    filters.pagination().should.eql({current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    filters.pagination(50).should.eql({current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    filters.pagination(50, 20).should.eql({current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    filters.pagination(50, 20, 2).should.eql({current: 2, next: 3, previous: 1, list: [1, 2, 3]});
    filters.pagination(50, 20, 3).should.eql({current: 3, next: 3, previous: 2, list: [1, 2, 3]});
  });
  
});