'use strict'

var natives = require('../xyz/natives')

module.exports = function nativeErrs () {
  return function native__ () {
    natives()
  }
}
