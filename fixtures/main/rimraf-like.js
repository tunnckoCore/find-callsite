'use strict'

var rimraf = require('rimraf')

module.exports = function rimrafLike () {
  rimraf.sync(4444444)
}
