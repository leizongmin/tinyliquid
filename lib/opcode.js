/**
 * 定义opcode常量
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var OPCODE = {
  COMPILER:     1,
  DEBUG:        2,
  OBJECT:       3,
  PRINT:        4,
  IF:           5,
  FOR:          6,
  TABLEROW:     7,
  ASSIGN:       8,
  CAPTURE:      9,
  CYCLE:        10,
  INCLUDE:      11,
  COMMENT:      12,
  FILTER:       13,
  AND:          14,
  OR:           15,
  NOT:          16,
  EXISTS:       17,
  LT:           18,
  GT:           19,
  EQ:           20,
  ED:           21,
  NE:           22,
  GE:           23,
  LE:           24,
  CONTAINS:     25,
  HASVALUE:     26,
  HASKEY:       27,
  RANGE:        28,
  CASE:         29,
  WHEN:         30,
  LOCALS:       31
};
/*
var OPCODE = {
  COMPILER:     'COMPILER',
  DEBUG:        'DEBUG',
  OBJECT:       'OBJECT',
  PRINT:        'PRINT',
  IF:           'IF',
  FOR:          'FOR',
  TABLEROW:     'TABLEROW',
  ASSIGN:       'ASSIGN',
  CAPTURE:      'CAPTURE',
  CYCLE:        'CYCLE',
  INCLUDE:      'INCLUDE',
  COMMENT:      'COMMENT',
  FILTER:       'FILTER',
  AND:          'AND',
  OR:           'OR',
  NOT:          'NOT',
  EXISTS:       'EXISTS',
  LT:           'LT',
  GT:           'GT',
  EQ:           'EQ',
  ED:           'ED',
  NE:           'NE',
  GE:           'GE',
  LE:           'LE',
  CONTAINS:     'CONTAINS',
  HASVALUE:     'HASVALUE',
  HASKEY:       'HASKEY',
  RANGE:        'RANGE',
  CASE:         'CASE',
  WHEN:         'WHEN',
  LOCALS:       'LOCALS'
};
*/
module.exports = exports = OPCODE;
