var findCallsite = require('./index')
var rimraf = require('rimraf')

function fixture () {
  try {
    rimraf.sync(5555)
  } catch (err) {
    var callsiteLine = findCallsite(err)
    console.log(callsiteLine)
    // => 'at fixture (/home/charlike/apps/find-callsite/example.js:6:12)'
  }
}

fixture()
