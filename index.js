/*!
 * find-callsite <https://github.com/tunnckoCore/find-callsite>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

module.exports = function findCallsite (error) {
  if (isString(error)) {
    error = { stack: error }
  }
  if (!isObject(error)) {
    throw new TypeError('find-callsite: expect `error` to be an object or string')
  }
  if (!isString(error.stack)) {
    throw new TypeError('find-callsite: expect `error.stack` to be non empty string')
  }

  // filepath of very parent
  var filepath = cameFrom(module.parent)

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
  return callsiteLine
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
