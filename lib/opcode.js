/**
 * 定义opcode常量
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var OPCODE = {
  AND:                1,
  ASSIGN:             2,
  CAPTURE:            3,
  CASE:               4,
  COMMENT:            5,
  COMPILER:           6,
  CONTAINS:           7,
  CYCLE:              8,
  DEBUG:              9,
  ED:                 10,
  EQ:                 11,
  EXISTS:             12,
  FILTER:             13,
  FOR:                14,
  FORLOOPLOCALS:      15,
  GE:                 16,
  GT:                 17,
  HASKEY:             18,
  HASVALUE:           19,
  IF:                 20,
  INCLUDE:            21,
  LE:                 22,
  LOCALS:             23,
  LT:                 24,
  NE:                 25,
  NOT:                26,
  OBJECT:             27,
  OR:                 28,
  RANGE:              29,
  PRINT:              30,
  PRINTLOCALS:        31,
  PRINTSTRING:        32,
  TABLEROW:           33,
  TABLEROWLOOPLOCALS: 34,
  WHEN:               35,
};

module.exports = exports = OPCODE;
