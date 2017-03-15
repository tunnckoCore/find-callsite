/*!
 * find-callsite <https://github.com/tunnckoCore/find-callsite>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
var isCI = require('is-ci')
var cleanStack = require('clean-stacktrace')
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
    test.strictEqual(/test\.js:24:5/.test(callsiteLine), true)
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
    '    at Function.zazz (/home/charlike/apps/find-callsite/test.js:77:14)'
  ].join('\n'), {
    relativePaths: true
  })

  if (isCI) {
    test.strictEqual(/at Function\.zazz/.test(callsite), true)
    test.strictEqual(/\.\./.test(callsite), true)
    test.strictEqual(/test\.js:77:14/.test(callsite), true)
  } else {
    test.strictEqual(callsite, 'at Function.zazz (test.js:77:14)')
  }
  done()
})

test('should work correctly if stack has filepath in first and last lines', function ensure (done) {
  var err = new Error('ensure correct')
  var stack = cleanStack(err.stack)
  var callsite = findCallsite(stack, {
    relativePaths: true
  })

  // console.log(stack) // notice first and last in stack, first is correct
  // Error: ensure correct
  //   at Function.ensure (/home/charlike/apps/find-callsite/test.js:107:13)
  //   at Function.tryCatch (/home/charlike/apps/find-callsite/node_modules/try-catch-callback/index.js:73:14)
  //   at Function.tryCatchCallback (/home/charlike/apps/find-callsite/node_modules/try-catch-callback/index.js:56:21)
  //   at Function.tryCatch (/home/charlike/apps/find-callsite/node_modules/try-catch-core/index.js:82:26)
  //   at Function.tryCatchCore (/home/charlike/apps/find-callsite/node_modules/try-catch-core/index.js:64:12)
  //   at Function.alwaysDone (/home/charlike/apps/find-callsite/node_modules/always-done/index.js:61:24)
  //   at mukla (/home/charlike/apps/find-callsite/node_modules/mukla/index.js:55:9)
  //   at Object.<anonymous> (/home/charlike/apps/find-callsite/test.js:106:1)

  // ensure that it is not Object.<anonymous>
  // which is the last callsite in stack
  test.strictEqual(/at Function.ensure/.test(callsite), true)
  done()
})
