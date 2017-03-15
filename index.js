/*!
 * find-callsite <https://github.com/tunnckoCore/find-callsite>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

var path = require('path')
var extend = require('extend-shallow')
var relativePaths = require('clean-stacktrace-relative-paths')

/**
 * > Find correct callsite where error is started. All that stuff
 * is because you not always need the first line of the stack
 * to understand where and what happened.
 *
 * In below example we use `rimraf.sync` to throw some error. That's
 * the case when we need to be informed where is the `rimraf.sync` call
 * not where it throws. In that case it is on line 6, column 12.
 *
 * **Example**
 *
 * ```js
 * var findCallsite = require('find-callsite')
 * var rimraf = require('rimraf')
 *
 * function fixture () {
 *   try {
 *     rimraf.sync(5555)
 *   } catch (err) {
 *     var callsiteLine = findCallsite(err)
 *     console.log(callsiteLine)
 *     // => 'at fixture (/home/charlike/apps/find-callsite/example.js:6:12)'
 *
 *     var relativeCallsiteLine = findCallsite(err, {
 *       relativePaths: true
 *     })
 *     console.log(relativeCallsiteLine)
 *     // => 'at fixture (example.js:6:12)'
 *   }
 * }
 *
 * fixture()
 * ```
 *
 * @param  {Error|Object|String} `error` plain or Error object with stack property, or string stack
 * @param  {Object} `opts` optional options object
 * @param  {String} `opts.cwd` give current working directory, default to `process.cwd()`
 * @param  {Boolean} `opts.relativePaths` make path relative to `opts.cwd`, default `false`
 * @return {String} single callsite from whole stack trace, e.g. `at foo (/home/bar/baz.js:33:4)`
 * @api public
 */

module.exports = function findCallsite (error, opts) {
  if (isString(error)) {
    error = { stack: error }
  }
  if (!isObject(error)) {
    throw new TypeError('find-callsite: expect `error` to be an object or string')
  }
  if (!isString(error.stack)) {
    throw new TypeError('find-callsite: expect `error.stack` to be non empty string')
  }
  opts = extend({ cwd: process.cwd(), relativePaths: false }, opts)

  // filepath of very parent
  var filepath = cameFrom(module.parent)

  // allow making path relative + ensurance
  filepath = opts.relativePaths
    ? path.relative(opts.cwd, filepath)
    : filepath

  // get the index where it's found in stack
  var foundIndex = error.stack.indexOf(String(filepath))

  // get whole stack from the begining to that index
  var toFoundPlace = error.stack.slice(0, foundIndex)

  // get the index of the last new line from that part of the stack
  var lastNewLine = toFoundPlace.lastIndexOf('\n')

  // get the rest of the stack, from the found index
  // to the very end of the stack
  var pathPlusRest = error.stack.slice(foundIndex)

  // get the index of first new line in that rest part of the stack
  var restFirstNewLine = pathPlusRest.indexOf('\n')

  // if stack is too short, we will get -1
  // so we should use as index the length of the stack
  restFirstNewLine = restFirstNewLine === -1
    ? error.stack.length
    : restFirstNewLine

  // if both indices are equal,
  // then we should use index of the first new line
  // otherwise we should use index of the end of the stack
  restFirstNewLine = restFirstNewLine === error.stack.length
    ? restFirstNewLine
    : restFirstNewLine + toFoundPlace.length

  // we cut exactly the callsite that we need and we trim it
  var callsiteLine = error.stack.slice(lastNewLine, restFirstNewLine).trim()
  return opts.relativePaths
    ? relativePaths(opts.cwd)(callsiteLine)
    : callsiteLine
}

function isObject (val) {
  return val && typeof val === 'object' && !Array.isArray(val)
}

function isString (val) {
  return val && typeof val === 'string' && val.length > 0
}

function cameFrom (mod) {
  /* istanbul ignore next */
  if (mod && mod.parent) {
    return cameFrom(mod.parent)
  }
  return (mod && mod.filename)
}
