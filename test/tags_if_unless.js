var should = require('should');
var liquid = require('../');

describe('Liquid.js', function () {
  
  it('#tags If / Else / Unless', function () {
    var text = '{% if user %}Hi{{ user.name }}{% endif %}';
    var ret = liquid.parse(text);
    //console.log(ret);
    
    var fn = liquid.compile(text);
    //console.log(fn.toString());
    var html = fn({user: {name: 'QQ'}});
    
    //console.log(html);
    html.should.equal('HiQQ'); 
  });
  
  it('#tags If / Else / Unless #2', function () {
  
    var render = function (text, data) {
      //console.log(liquid.parse(text));
      var fn = liquid.compile(text);
      var html = fn(data);
      return html;
    }
    
    render('{% if user %}Hi {{ user.name }}{% endif %}', {user: {name: 'QW'}})
        .should.equal('Hi QW');
        
        
    render('{% if user.name == \'tobi\' %}hi tobi{% endif %}', {user: {name: 'a'}})
        .should.equal(''); 
    render('{% if user.name == \'tobi\' %}hi tobi{% endif %}', {user: {name: 'tobi'}})
        .should.equal('hi tobi');
        
        
    render('{% if user.name != \'tobi\' %}hi non-tobi{% endif %}', {user: {name: 's'}})
        .should.equal('hi non-tobi');
    render('{% if user.name != \'tobi\' %}hi non-tobi{% endif %}', {user: {name: 'tobi'}})
        .should.equal('');
        
        
    render('{% unless user.name == \'tobi\' %}hi non-tobi{% endunless %}', {user: {name: 'tobi'}})
        .should.equal('');
    render('{% unless user.name == \'tobi\' %}hi non-tobi{% endunless %}', {user: {name: 'to'}})
        .should.equal('hi non-tobi');
       
       
    render('{% if user.name == \'tobi\' or user.name == \'marc\' %}hi marc or tobi{% endif %}',
          {user: {name: 'tobi'}}).should.equal('hi marc or tobi');
    render('{% if user.name == \'tobi\' or user.name == \'marc\' %}hi marc or tobi{% endif %}',
          {user: {name: 'marc'}}).should.equal('hi marc or tobi');
    render('{% if user.name == \'tobi\' or user.name == \'marc\' %}hi marc or tobi{% endif %}',
          {user: {name: 't'}}).should.equal('');
          
          
    render('{% if user.name == \'tobi\' and user.last_name == \'scottish\' %}hi tobi scottish{% endif %}',
          {user: {name: 'tobi', last_name: 'scottish'}}).should.equal('hi tobi scottish');
    render('{% if user.name == \'tobi\' and user.last_name == \'scottish\' %}hi tobi scottish{% endif %}',
          {user: {name: 'tobi', last_name: 's'}}).should.equal('');
    render('{% if user.name == \'tobi\' and user.last_name == \'scottish\' %}hi tobi scottish{% endif %}',
          {user: {name: 'dd', last_name: 'scottish'}}).should.equal('');
     
     
    render('{% if user.name contains \'tobi\' %}hi tobias{% endif %}',
          {user: {name: 'tobi'}}).should.equal('hi tobias');
    render('{% if user.name contains \'tobi\' %}hi tobias{% endif %}',
          {user: {name: 'TOBI'}}).should.equal('hi tobias');
    render('{% if user.name contains \'tobi\' %}hi tobias{% endif %}',
          {user: {name: 'tobi jim'}}).should.equal('hi tobias');
    render('{% if user.name contains \'tobi\' %}hi tobias{% endif %}',
          {user: {name: 'Hey, tobi'}}).should.equal('hi tobias');
    render('{% if user.name contains \'tobi\' %}hi tobias{% endif %}',
          {user: {name: 'tsssbi'}}).should.equal('');
          
    
    render('{% if user.age > 18 %}Login here{% else %}Sorry, you are too young{% endif %}',
          {user: {age: 18}}).should.equal('Sorry, you are too young');
    render('{% if user.age > 18 %}Login here{% else %}Sorry, you are too young{% endif %}',
          {user: {age: 50}}).should.equal('Login here');
    render('{% if user.age > 18 %}Login here{% else %}Sorry, you are too young{% endif %}',
          {user: {age: 16}}).should.equal('Sorry, you are too young');
          
     
    render('{% unless user.age > 18 %}Sorry, you are too young{% else %}Login here{% endunless %}',
          {user: {age: 18}}).should.equal('Sorry, you are too young');
    render('{% unless user.age > 18 %}Sorry, you are too young{% else %}Login here{% endunless %}',
          {user: {age: 50}}).should.equal('Login here');
    render('{% unless user.age > 18 %}Sorry, you are too young{% else %}Login here{% endunless %}',
          {user: {age: 18}}).should.equal('Sorry, you are too young');
          
          
    render('{% if user.creditcard == nil %}poor sob{% endif %}',
          {user: {creditcard: 'tsssbi'}}).should.equal('');
    render('{% if user.creditcard == nil %}poor sob{% endif %}',
          {user: {}}).should.equal('poor sob');
          
       
    render('{% if user.payments == empty %}you haven\'t paid yet!{% endif %}',
          {user: {payments: ''}}).should.equal('you haven\'t paid yet!');
    render('{% if user.payments == empty %}you haven\'t paid yet!{% endif %}',
          {user: {payments: 'dddsds'}}).should.equal('');
          
    render('{% if 0 == 0 %}0{% elsif 1 == 1%}1{% else %}2{% endif %}').should.equal('0');
    render('{% if 0 != 0 %}0{% elsif 1 == 1%}1{% else %}2{% endif %}').should.equal('1');
    render('{% if 0 != 0 %}0{% elsif 1 != 1%}1{% else %}2{% endif %}').should.equal('2');
  });
  
});