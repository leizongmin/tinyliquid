var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#parse() require names', function () {
    /*
    liquid.parse('{{ a }} {{ b }} - {{ b }} {{ c }}')
      .names.should.eql({a: 1, b: 2, c: 1});
      
    liquid.parse('{{ a | add: b | plus: c }} {{ b }} - {{ b }} {{ c }}')
      .names.should.eql({a: 1, b: 3, c: 2});
    
    liquid.parse('{% for item in items %}{{ item.a }}{{ item.b }}{% endfor %}')
      .names.should.eql({items: 1, item: 1, 'item.a': 1, 'item.b': 1});
    
    liquid.parse('{% tablerow item in items cols:2 %}{{ item.a }}{{ item.b }}{% endtablerow %}')
      .names.should.eql({items: 1, item: 1, 'item.a': 1, 'item.b': 1});
    
    liquid.parse('{% for item in items %}{% if item.a %}{{ item.b }}{% else %}{{ item.c }}{% endif %}{% endfor %}')
      .names.should.eql({items: 1, item: 1, 'item.a': 1, 'item.b': 1, 'item.c': 1});
    
    liquid.parse('{% raw %}{{ a }}{{ b }}{{ c }}{{ d }}{% endraw %}{{ e }}')
      .names.should.eql({e: 1});
      
    liquid.parse('{% if abc %}123{% endif %}')
      .names.should.eql({abc: 1});
      */
    liquid.parse('{% if abc.[efg] %}123{% endif %}')
      .names.should.eql({abc: 1, efg: 1});
      
    liquid.parse('{% if abc.[efg].h.i > 0 %}{% endif %}')
      .names.should.eql({abc: 1, efg: 1});
    
  });
  
});