/**
 * 支持express渲染
 *
 * @param 老雷<leizongmin@gmail.com>
 */
 
var tinyliquid = require('../');

module.exports = function () {
  return tinyliquid;
  /*
  var express = require('express');
  var version = parseFloat(express.version);
  if (version < 3)
    return tinyliquid;
  */
};
