var should = require('should');
var liquid = require('../');

describe('Custom tag', function () {
  
  it('#custom tag', function () {
  
    var render = function (text, data, options) {
      //console.log(liquid.parse(text, options).code);
      var fn = liquid.compile(text, options);
      var html = fn(data, options.filters);
      return html;
    };
    
    render('{{b}}-{% alias a as b %}{{b.a}}-{{b.b}}-{{b.c}}', {a: {a:12, b:3, c:456}, b: false},
    {tags: {
      alias: function (words, line, context, methods) {
        if (words.length !== 3)
          return methods.syntaxError();
        return methods.localsWrap(words[2]) + ' = ' + methods.localsWrap(words[0]) + ';';
    }}})
      .should.equal('false-12-3-456');
      
    render('{{a}}-{{b}}|{% delete a b %}{{a}}-{{b}}', {a: 54321, b:110}, {tags: {
      delete: function (words, line, context, methods) {
        var script = '';
        for (var i = 0; i < words.length; i++) {
          var n = methods.localsWrap(words[i]);
          script += 'delete ' + n + ';\n';
        }
        return script;
    }}})
      .should.equal('54321-110|undefined-undefined');
      
  });
});