/**
 * 定义opcode常量
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var OPCODE = {

  // 基本指令，由编译代码时产生
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
  LOOPITEM:           24,
  LT:                 25,
  NE:                 26,
  NOT:                27,
  OBJECT:             28,
  OR:                 29,
  RANGE:              30,
  PRINT:              31,
  PRINTLOCALS:        32,
  PRINTSTRING:        33,
  TABLEROW:           34,
  TABLEROWITEM:       35,
  TABLEROWLOOPLOCALS: 36,
  WHEN:               37,

  // 内部优化指令，由运行时优化产生，用于替换原来的指令
  

};

module.exports = exports = OPCODE;

// 用于测试
// for (var i in OPCODE) OPCODE[i] = i;
