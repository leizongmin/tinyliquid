var assert = require('assert');
var common = require('./common');
var filters = require('./common').me.filters;

describe('filters', function () {

  //----------------------------- HTML Filters ---------------------------------
  it('#img_tag', function () {
    assert.equal(filters.img_tag('xxxxx.png'), '<img src="xxxxx.png" alt="">');
    assert.equal(filters.img_tag('xxxxx.png', 'yyy'), '<img src="xxxxx.png" alt="yyy">');
  });

  it('#script_tag', function () {
    assert.equal(filters.script_tag('sssssssss.js'), '<script src="sssssssss.js"></script>');
  });

  it('#stylesheet_tag', function () {
    assert.equal(filters.stylesheet_tag('xxxx.css'), '<link href="xxxx.css" rel="stylesheet" type="text/css" media="all" />');
    assert.equal(filters.stylesheet_tag('xxxx.css', 'screen'), '<link href="xxxx.css" rel="stylesheet" type="text/css" media="screen" />');
  });

  it('#link_to', function () {
    assert.equal(filters.link_to('link'), '<a href="" title="">link</a>');
    assert.equal(filters.link_to('link', 'url'), '<a href="url" title="">link</a>');
    assert.equal(filters.link_to('link', 'url', 'title'), '<a href="url" title="title">link</a>');
  });

  //----------------------------------- Math Filters ---------------------------
  it('#plus', function () {
    assert.equal(filters.plus(1, 2), 1 + 2);
    assert.equal(filters.plus(1.5, 2.2), 1.5 + 2.2);
    assert.equal(filters.plus(1.666), 1.666);
  });

  it('#minus', function () {
    assert.equal(filters.minus(1, 2), 1 - 2);
    assert.equal(filters.minus(1.5, 2.2), 1.5 - 2.2);
    assert.equal(filters.minus(1.666), 1.666);
  });

  it('#times', function () {
    assert.equal(filters.times(1, 2), 1 * 2);
    assert.equal(filters.times(1.5, 2.2), 1.5 * 2.2);
    assert.equal(filters.times(1.666), 0);
  });

  it('#divided_by', function () {
    assert.equal(filters.divided_by(1, 2), 1 / 2);
    assert.equal(filters.divided_by(1.5, 2.2), 1.5 / 2.2);
    assert.equal(filters.divided_by(1.666), 1.666 / 0);
  });

  it('#round', function () {
    assert.equal(filters.round(1), 1);
    assert.equal(filters.round(1.2), 1);
    assert.equal(filters.round(1.5), 2);
    assert.equal(filters.round(1.21, 1), 1.2);
    assert.equal(filters.round(1.25, 1), 1.3);
    assert.equal(filters.round(1.224, 2), 1.22);
    assert.equal(filters.round(1.225, 2), 1.23);
  });

  it('#integer', function () {
    assert.equal(filters.integer(1), 1);
    assert.equal(filters.integer(1.2), 1);
    assert.equal(filters.integer(5.5), 5);
    assert.equal(filters.integer(-6.5), -6);
  });

  it('#random', function () {
    var a = filters.random();
    assert.equal(a >= 0 && a < 1, true);
    var a = filters.random(10);
    assert.equal(a >= 0 && a < 10, true);
    var a = filters.random(8, 9);
    assert.equal(a >= 8 && a < 9, true);
  });

  //------------------------------- Manipulation Filters -----------------------
  it('#append', function () {
    assert.equal(filters.append('abc'), 'abc');
    assert.equal(filters.append('abc', 'eee'), 'abceee');
  });

  it('#prepend', function () {
    assert.equal(filters.prepend('abc'), 'abc');
    assert.equal(filters.prepend('abc', 'eee'), 'eeeabc');
  });

  it('#camelize', function () {
    assert.equal(filters.camelize('what is this'), 'whatIsThis');
    assert.equal(filters.camelize('come-from China'), 'comeFromChina');
    assert.equal(filters.camelize('a fast/powerful template+engine'), 'aFastPowerfulTemplateEngine');
  });

  it('#capitalize', function () {
    assert.equal(filters.capitalize('haha sa'), 'Haha sa');
  });

  it('#timestamp', function () {
    var a = filters.timestamp();
    var b = new Date().getTime();
    // 相差不超过1毫秒
    assert.equal(a <= b && a >= b - 1, true);
    var c = 12345;
    var a = filters.timestamp(c);
    var b = new Date().getTime();
    assert.equal(a <= b + c && a >= b + c - 1, true);
  });

  it('#date', function () {
    var now = new Date();
    var num = function (n) {
      return (n < 10 ? '0' : '') + n;
    };
    assert.equal(filters.date('now'), now.getFullYear() + '-' + num(now.getMonth() + 1) + '-' + num(now.getDate())
                          + ' ' + num(now.getHours()) + ':' + num(now.getMinutes()) + ':' + num(now.getSeconds()));
    var now = new Date('1992-12-31 15:30:40');
    assert.equal(filters.date(now.getTime() + ''), '1992-12-31 15:30:40');
    assert.equal(filters.date('1992-12-31 15:30:40'), '1992-12-31 15:30:40');
    assert.equal(filters.date(now.getTime()), '1992-12-31 15:30:40');
    assert.equal(filters.date(now.getTime(), '%Y-%m-%j'), '1992-12-31');
    assert.equal(filters.date(now.getTime(), '%H:%M:%S'), '15:30:40');
  });

  it('#downcase', function () {
    assert.equal(filters.downcase('aDbbFFDd'), 'adbbffdd');
  });

  it('#upcase', function () {
    assert.equal(filters.upcase('aDbbFFDd'), 'ADBBFFDD');
  });

  it('#escape', function () {
    assert.equal(filters.escape('<a a="a">&'), '&lt;a a=&quot;a&quot;&gt;&amp;');
  });

  it('#unescape', function () {
    assert.equal(filters.unescape('&lt;a a=&quot;a&quot;&gt;&amp;'), '<a a="a">&');
    var s = '<a href="b"><b>xxx</b></a><div>abc</div>';
    assert.equal(filters.unescape(filters.escape(s)), s);
  });

  it('#keys', function () {
    assert.deepEqual(filters.keys(null), []);
    assert.deepEqual(filters.keys(123), []);
    assert.deepEqual(filters.keys({a: 123, b: 456}), ['a', 'b']);
    assert.deepEqual(filters.keys([1,2,3]), ['0', '1', '2']);
    assert.deepEqual(filters.keys(), []);
    assert.deepEqual(filters.keys(null), []);
    assert.deepEqual(filters.keys(false), []);
    assert.deepEqual(filters.keys(true), []);
    assert.deepEqual(filters.keys(123), []);
    assert.deepEqual(filters.keys('aa456'), []);
  });

  it('#first', function () {
    assert.equal(filters.first([5,7,8]), 5);
    assert.equal(filters.first({a: 77, b: 88}), 77);
    assert.deepEqual(filters.first(null), null);
  });

  it('#last', function () {
    assert.equal(filters.last([5,7,8]), 8);
    assert.equal(filters.last({a: 77, b: 88}), 88);
    assert.deepEqual(filters.first(null), null);
  });

  it('#handleize', function () {
    assert.equal(filters.handleize('a bbd =ds+das'), 'a-bbd-dsdas');
    assert.equal(filters.handleize('This\'s is a book'), 'thiss-is-a-book');
    assert.equal(filters.handleize('QuickWeb for Node.js'), 'quickweb-for-nodejs');
  });

  it('#join', function () {
    assert.equal(filters.join([1,2,3,4,5]), '1 2 3 4 5')
    assert.equal(filters.join([1,2,3,4,5], '-'), '1-2-3-4-5')
    assert.equal(filters.join([1,2,3,4,5], ''), '1 2 3 4 5')
    assert.equal(filters.join(555), '')
  });

  it('#replace', function () {
    assert.equal(filters.replace('abcabc', 'a', 'x'), 'xbcxbc');
    assert.equal(filters.replace('abcabc', 'c', 'x'), 'abxabx');
  });

  it('#replace_first', function () {
    assert.equal(filters.replace_first('abcabc', 'a', 'x'), 'xbcabc');
    assert.equal(filters.replace_first('abcabc', 'c', 'x'), 'abxabc');
  });

  it('#remove', function () {
    assert.equal(filters.remove('abcabc', 'a'), 'bcbc');
    assert.equal(filters.remove('abcabc', 'b'), 'acac');
  });

  it('#remove_first', function () {
    assert.equal(filters.remove_first('abcabc', 'a'), 'bcabc');
    assert.equal(filters.remove_first('abcabc', 'c'), 'ababc');
  });

  it('#newline_to_br', function () {
    assert.equal(filters.newline_to_br('abc\ndef\nghi'), 'abc<br>def<br>ghi');
  });

  it('#pluralize', function () {
    assert.equal(filters.pluralize(0, 'item', 'items'), 'item');
    assert.equal(filters.pluralize(1, 'item', 'items'), 'item');
    assert.equal(filters.pluralize(2, 'item', 'items'), 'items');
    assert.equal(filters.pluralize(3, 'item', 'items'), 'items');
  });

  it('#size', function () {
    assert.equal(filters.size(null), 0);
    assert.equal(filters.size(), 0);
    assert.equal(filters.size(5), 0);
    assert.equal(filters.size(null), 0);
    assert.equal(filters.size({}), 0);
    assert.equal(filters.size('abcde'), 5);
    assert.equal(filters.size([1,2,3]), 3);
  });

  it('#split', function () {
    assert.deepEqual(filters.split('abcdefg'), ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    assert.deepEqual(filters.split('abc-def-ghi', '-'), ['abc', 'def', 'ghi']);
    assert.deepEqual(filters.split('abc-aef-aghi', 'a'), ['', 'bc-', 'ef-', 'ghi']);
  });

  it('#strip_html', function () {
    assert.equal(filters.strip_html('<div id="container" class="clearfix">abc:<span>def</span></div>'), 'abc:def');
  });

  it('#strip_newlines', function () {
    assert.equal(filters.strip_newlines('abc\ndef\nghi'), 'abcdefghi');
  });

  it('#truncate', function () {
    assert.equal(filters.truncate('abcdefghi'), 'abcdefghi');
    assert.equal(filters.truncate('abcdefghi', 2), 'ab');
  });

  it('#truncatewords', function () {
    assert.equal(filters.truncatewords('this is a book'), 'this is a book');
    assert.equal(filters.truncatewords('this is a book', 2), 'this is');
    assert.equal(filters.truncatewords(' this is a book', 2), 'this is');
  });

  it('#json', function () {
    assert.equal(filters.json(), '{}');
    assert.equal(filters.json(null), JSON.stringify(null));
    assert.equal(filters.json(12345), JSON.stringify(12345));
    assert.equal(filters.json('What is this?'), JSON.stringify('What is this?'));
    assert.equal(filters.json({a:123, b: 456}), JSON.stringify({a:123, b: 456}));
  });

  it('#substr', function () {
    assert.equal(filters.substr('abcd', 1), 'bcd');
    assert.equal(filters.substr('abcd', 2, 1), 'c');
    assert.equal(filters.substr('abcd', -2), 'cd');
  });

  it('#get', function () {
    assert.equal(filters.get(null, 'abc'), undefined);
    assert.equal(filters.get(undefined, 'abc'), undefined);
    assert.equal(filters.get(123554, 'abc'), undefined);
    assert.equal(filters.get(false, 'abc'), undefined);
    assert.equal(filters.get(true, 'abc'), undefined);
    assert.equal(filters.get('abcde', 'length'), 5);
    assert.equal(filters.get({a: 123, b:456}, 'b'), 456);
  });

  it('#reverse', function () {
    assert.equal(filters.reverse('abcde'), 'edcba');
    assert.deepEqual(filters.reverse([1,2,3,4,5]), [5,4,3,2,1]);
  });

  it('#indexOf', function () {
    assert.equal(filters.indexOf('abcdeac', 'c'), 2);
    assert.equal(filters.indexOf('abcdeac', 'c', 3), 6);
    assert.equal(filters.indexOf('abcdeac', 'f'), -1);
    assert.equal(filters.indexOf([1,2,3,4,5], 5), 4);
  });

  it('#map', function () {
    assert.deepEqual(filters.map(), []);
    assert.deepEqual(filters.map(123), []);
    assert.deepEqual(filters.map([1,2,3]), [undefined, undefined, undefined]);
    assert.deepEqual(filters.map([1,2,3], 'a'), [undefined, undefined, undefined]);
    assert.deepEqual(filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}])
      , [undefined, undefined, undefined]);
    assert.deepEqual(filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}], 'a')
      , [12345, 54321, 44454]);
    assert.deepEqual(filters.map([{a: 12345, b:45678}, {a: 54321, b:78955}, {a:44454, b: 2212}], 'b')
      , [45678, 78955, 2212]);
  });

  it('#sort', function () {
    assert.deepEqual(filters.sort(), []);
    assert.deepEqual(filters.sort([1,2,3,4,5]), [1,2,3,4,5]);
    assert.deepEqual(filters.sort([1,2,3,4,5], 'asc'), [1,2,3,4,5]);
    assert.deepEqual(filters.sort([1,2,3,4,5], 'abb'), [1,2,3,4,5]);
    assert.deepEqual(filters.sort([1,2,3,4,5], 'desc'), [5,4,3,2,1]);
    assert.deepEqual(filters.sort([1,2,3,4,5], 'DEsc'), [5,4,3,2,1]);
  });

  it('#sort_by', function () {
    assert.deepEqual(filters.sort(), []);
    assert.deepEqual(filters.sort_by([1,2,3,4,5]), [1,2,3,4,5]);
    var data = [{a:1, b:5}, {a:2, b:4}, {a:3, b:3}, {a:4, b:2}, {a:5, b:1}];
    var data2 = [{a:5, b:1}, {a:4, b:2}, {a:3, b:3}, {a:2, b:4}, {a:1, b:5}];
    assert.deepEqual(filters.sort_by(data), data);
    assert.deepEqual(filters.sort_by(data, 'a'), data);
    assert.deepEqual(filters.sort_by(data, 'a', 'desc'), data2);
    assert.deepEqual(filters.sort_by(data, 'a', 'xxx'), data);
    assert.deepEqual(filters.sort_by(data, 'b'), data2);
    assert.deepEqual(filters.sort_by(data, 'b', 'dsds'), data2);
    assert.deepEqual(filters.sort_by(data, 'b', 'desc'), data);
  });

  it('#pagination', function () {
    assert.deepEqual(filters.pagination(), {current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    assert.deepEqual(filters.pagination(50), {current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    assert.deepEqual(filters.pagination(50, 20), {current: 1, next: 2, previous: 1, list: [1, 2, 3]});
    assert.deepEqual(filters.pagination(50, 20, 2), {current: 2, next: 3, previous: 1, list: [1, 2, 3]});
    assert.deepEqual(filters.pagination(50, 20, 3), {current: 3, next: 3, previous: 2, list: [1, 2, 3]});
  });

  it('#default', function () {
    assert.equal(filters.default(null, 'aaa'), 'aaa');
    assert.equal(filters.default(undefined, 'aaa'), 'aaa');
    assert.equal(filters.default(false, 'aaa'), 'aaa');
    assert.deepEqual(filters.default([], 'aaa'), 'aaa');
    assert.deepEqual(filters.default('', 'aaa'), 'aaa');
    assert.equal(filters.default('bbb', 'aaa'), 'bbb');
    assert.deepEqual(filters.default([1,2], 'aaa'), [1,2].toString());
  });

  // ----------------------------------------

  var context = common.newContext();
  it('#multi parameter', function (done) {
    common.taskList()
      .add(function (done) {
        common.render(context, '{{"abcdefg"|replace:"a","1"|replace:"d",2}}', function (err, buf) {
          assert.equal(err, null);
          assert.equal(buf, '1bc2efg');
          context.clearBuffer();
          done();
        });
      })
      .end(done);
  });

});