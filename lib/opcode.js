/**
 * Define OPCODE
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var OPCODE = {

  // unknown opcode
  UNKNOWN:            0,

  // base opcode
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
  LIST:               24,
  LOCALS:             25,
  LT:                 26,
  NE:                 27,
  NOT:                28,
  OBJECT:             29,
  OR:                 30,
  RANGE:              31,
  PRINT:              32,
  PRINTLOCALS:        33,
  PRINTSTRING:        34,
  TABLEROW:           35,
  TABLEROWITEM:       36,
  TABLEROWLOOPLOCALS: 37,
  UNKNOWN_TAG:        38,
  WHEN:               39,

  // forloop/tablerow attribute
  LOOPLOCALS_LENGTH:      50,
  LOOPLOCALS_NAME:        51,
  LOOPLOCALS_INDEX0:      52,
  LOOPLOCALS_INDEX:       53,
  LOOPLOCALS_RINDEX0:     54,
  LOOPLOCALS_RINDEX:      55,
  LOOPLOCALS_FIRST:       56,
  LOOPLOCALS_LAST:        57,
  LOOPLOCALS_COL0:        58,
  LOOPLOCALS_COL:         59,
  LOOPLOCALS_COL_FIRST:   60,
  LOOPLOCALS_COL_LAST:    61,
  LOOPLOCALS_UNKNOWN:     62,

  // extension instruction
  TEMPLATE_FILENAME_PUSH: 80,
  TEMPLATE_FILENAME_POP:  81,

  // this "assign" will only affected current context
  WEAK_ASSIGN: 82,

  // extends and block
  EXTENDS: 83,
  BLOCK: 84

};

module.exports = exports = OPCODE;

// just for test
// for (var i in OPCODE) OPCODE[i] = i;
