/**
 * 定义opcode常量
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var OPCODE = {
  AND:          1,
  ASSIGN:       2,
  CAPTURE:      3,
  CASE:         4,
  COMMENT:      5,
  COMPILER:     6,
  CONTAINS:     7,
  CYCLE:        8,
  DEBUG:        9,
  ED:           10,
  EQ:           11,
  EXISTS:       12,
  FILTER:       13,
  FOR:          14,
  GE:           15,
  GT:           16,
  HASKEY:       17,
  HASVALUE:     18,
  IF:           19,
  INCLUDE:      20,
  LE:           21,
  LOCALS:       22,
  LT:           23,
  NE:           24,
  NOT:          25,
  OBJECT:       26,
  OR:           27,
  RANGE:        28,
  PRINT:        29,
  PRINTLOCALS:  30,
  PRINTSTRING:  31,
  TABLEROW:     32,
  WHEN:         33,
};

module.exports = exports = OPCODE;
