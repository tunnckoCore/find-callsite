/*!
 * find-callsite <https://github.com/tunnckoCore/find-callsite>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
var findCallsite = require('./index')

var assertions = require('./fixtures/main/assertions')
var nativeNested = require('./fixtures/main/native-errors')
var nativeErrors = require('./fixtures/xyz/natives')
var rimrafLike = require('./fixtures/main/rimraf-like')

function factory (fn, str) {
  try {
    fn()
  } catch (err) {
    var callsiteLine = findCallsite(str ? err.stack : err)
    test.strictEqual(/at/.test(callsiteLine), true)
    test.strictEqual(/factory/.test(callsiteLine), true)
    test.strictEqual(/test\.js:22:5/.test(callsiteLine), true)
    test.strictEqual(/fixtures/.test(callsiteLine), false)
  }
}

test('should work for Assertion errors', function (done) {
  factory(assertions, true)
  done()
})

test('should work for native errors', function (done) {
  factory(nativeErrors)
  done()
})

test('should very nested thrown native errors', function (done) {
  factory(nativeNested())
  done()
})

test('should work for errors thrown like what rimraf.sync throws', function (done) {
  factory(rimrafLike)
  done()
})

test('should throw TypeError if `error` not an object or string', function (done) {
  function fixture () {
    findCallsite(123)
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `error` to be an object or string/)
  done()
})

test('should throw TypeError if `error.stack` is not a string or empty string', function (done) {
  function fixture () {
    findCallsite({ stack: 123 })
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `error.stack` to be non empty string/)
  test.throws(function () {
    findCallsite({ stack: '' })
  }, /expect `error.stack` to be non empty string/)
  done()
})

test('should work for very short stack trace', function fooQuxieTest (done) {
  var callsite = findCallsite([
    'Error: foo quxie',
    '    at Fucntion.fooQuxieTest (/home/charlike/apps/stacktrace-start/test.js:16:20)'
  ].join('\n'))

  test.strictEqual(/at/.test(callsite), true)
  test.strictEqual(/Fucntion\.fooQuxieTest/.test(callsite), true)
  test.strictEqual(/test\.js:16:20/.test(callsite), true)
  done()
})

test('allow making path relative through opts.cwd and opts.relativePaths', function (done) {
  var callsite = findCallsite([
    'Error: testing relative paths',
    '    at Fucntion.zazz (/home/charlike/apps/find-callsite/test.js:77:14)'
  ].join('\n'), {
    relativePaths: true
  })

  test.strictEqual(callsite, 'at Fucntion.zazz (test.js:77:14)')
  done()
})
