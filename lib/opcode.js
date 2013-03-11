/**
 * 定义opcode常量
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var OPCODE = {

  UNKNOWN:            0,

  // 基本指令，由编译代码时产生
  AND:                1,
  ASSIGN:             2,
  CAPTURE:            3,
  CASE:               4,
  COMMENT:            5,
  COMPILER_VERSION:   6,
  CONTAINS:           7,
  CYCLE:              8,
  DEBUG:              9,
  ED:                 10,
  EQ:                 11,
  EXISTS:             12,
  FILTER:             13,
  FOR:                14,
  FORLOOPITEM:        15,
  FORLOOPLOCALS:      16,
  GE:                 17,
  GT:                 18,
  HASKEY:             19,
  HASVALUE:           20,
  IF:                 21,
  INCLUDE:            22,
  LE:                 23,
  LOCALS:             24,
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
