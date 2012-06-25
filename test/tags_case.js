var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#case', function () {
  
    var render = function (text, data, filters) {
      //console.log(liquid.parse(text).code);
      var fn = liquid.compile(text);
      var html = fn(data, filters);
      return html;
    }
    
    render('{% case template %}{% when \'index\' %}Welcome{% when \'product\' %}{{ product.vendor | link_to_vendor }} / {{ product.title }}{% else %}{{ page_title }}{% endcase %}',
      {template: 'index', product: {vendor: 'FW', title: 'Cat'}},
      {link_to_vendor: function (vendor) {
        return '<a>' + vendor + '</a>';
      }}).should.equal('Welcome');
     
    render('{% case template %}{% when \'index\' %}Welcome{% when \'product\' %}{{ product.vendor | link_to_vendor }} / {{ product.title }}{% else %}{{ page_title }}{% endcase %}',
      {template: 'product', product: {vendor: 'FW', title: 'Cat'}},
      {link_to_vendor: function (vendor) {
        return '<a>' + vendor + '</a>';
      }}).should.equal('<a>FW</a> / Cat');
      
    render('{% case template %}{% when \'index\' %}Welcome{% when \'product\' %}{{ product.vendor | link_to_vendor }} / {{ product.title }}{% else %}{{ page_title }}{% endcase %}',
      {page_title: 'OKOK'},
      {link_to_vendor: function (vendor) {
        return '<a>' + vendor + '</a>';
      }}).should.equal('OKOK');
      
    render('{% case template %}\n{% when \'index\' %}Welcome{% when \'product\' %}{{ product.vendor | link_to_vendor }} / {{ product.title }}{% else %}{{ page_title }}{% endcase %}',
      {page_title: 'OKOK'},
      {link_to_vendor: function (vendor) {
        return '<a>' + vendor + '</a>';
      }}).should.equal('OKOK');
      
    render('{% case a %}\n'
         + '{% when 1 %}{% if b == 1 %}c{%else%}d{%endif%}\n'
         + '{% when 2 %}a\n'
         + '{% endcase %}', {a: 1, b:1})
      .should.equal('c\n');
        
  });
  
});