'use strict'

var assert = require('assert-kindof')

module.exports = function assertObject (val) {
  assert.object(val)
}
