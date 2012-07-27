var should = require('should');
var utils = require('../lib/utils');
var fs = require('fs');
var path = require('path');

describe('utils.outputHtml()', function () {
  
  it('#outputHtml', function () {
    utils.outputHtml('"').should.equal('\\"');
    utils.outputHtml('\'').should.equal('\\\'');
    utils.outputHtml('\\').should.equal('\\\\');
    utils.outputHtml('\r').should.equal('\\r');
    utils.outputHtml('\n').should.equal('\\n');

    utils.outputHtml(fs.readFileSync(path.resolve(__dirname, 'utils_outputHtml_text.txt'), 'utf8'))
      .should.equal('\\\\\\"');
  });
  
});