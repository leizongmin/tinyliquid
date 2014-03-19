var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function () {

  it('#getChildValue', function () {
    var data = {
      a: 123,
      b: {
        c: 456,
        d: 789
      },
      e: null,
      f: false,
      g: undefined
    };
    assert.deepEqual(utils.getChildValue(data, ['a']), [true, 123]);
    assert.deepEqual(utils.getChildValue(data, ['b', 'c']), [true, 456]);
    assert.deepEqual(utils.getChildValue(data, ['c']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['e']), [true, null]);
    assert.deepEqual(utils.getChildValue(data, ['e', 'f']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['e', 'f', 'g']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['f']), [true, false]);
    assert.deepEqual(utils.getChildValue(data, ['f', 'g']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['f', 'g', 'h']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['g']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['g', 'h']), [false, null]);
    assert.deepEqual(utils.getChildValue(data, ['g', 'h', 'j']), [false, null]);

    assert.deepEqual(utils.getChildValue(null, ['a']), [false, null]);
    assert.deepEqual(utils.getChildValue(undefined, ['a']), [false, null]);
  });

});