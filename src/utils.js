
'use strict';

/**
 * Module dependencies.
 * @api private
 */

import contentDisposition from 'content-disposition';
import contentType from 'content-type';
import flatten from 'array-flatten';
import {mime} from 'send';
import {basename} from 'path';
import _etag from 'etag';
import proxyaddr from 'proxy-addr';
import {parse} from 'qs';
import querystring from 'querystring';

/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 * also includes `.originalIndex` for stable sorting
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function acceptParams(str, index) {
  const parts = str.split(/ *; */);
  let ret = { value: parts[0], quality: 1, params: {}, originalIndex: index };

  for (let i = 1; i < parts.length; ++i) {
    let pms = parts[i].split(/ *= */);
    if ('q' == pms[0]) {
      ret.quality = parseFloat(pms[1]);
    } else {
      ret.params[pms[0]] = pms[1];
    }
  }

  return ret;
}

/**
 * Return strong ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

function etag (body, encoding) {
  let buf = !Buffer.isBuffer(body)
    ? new Buffer(body, encoding)
    : body;

  return _etag(buf, {weak: false});
};

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

function wetag(body, encoding){
  let buf = !Buffer.isBuffer(body)
    ? new Buffer(body, encoding)
    : body;

  return _etag(buf, {weak: true});
};

/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

function isAbsolute(path){
  if ('/' == path[0]){
     return true;
   }
  if (':' == path[1] && '\\' == path[2]) {
    return true;
  }
  if ('\\\\' == path.substring(0, 2)) {
    return true;
  } // Microsoft Azure absolute path
};

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {Object}
 * @api private
 */

function normalizeType(type){
  return type.indexOf('/')>-1
    ? acceptParams(type)
    : { value: mime.lookup(type), params: {} };
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

function normalizeTypes(types){
  let ret = [];

  for (var i = 0; i < types.length; ++i) {
    ret.push(exports.normalizeType(types[i]));
  }

  return ret;
};


/**
 * Compile "etag" value to function.
 *
 * @param  {Boolean|String|Function} val
 * @return {Function}
 * @api private
 */

function compileETag(val) {
  let fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
      fn = wetag;
      break;
    case false:
      break;
    case 'strong':
      fn = etag;
      break;
    case 'weak':
      fn = wetag;
      break;
    default:
      throw new TypeError('unknown value for etag function: ' + val);
  }

  return fn;
}

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Function} val
 * @return {Function}
 * @api private
 */

function compileQueryParser(val) {
  let fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
      fn = querystring.parse;
      break;
    case false:
      fn = ()=>new Object();
      break;
    case 'extended':
      fn = (str)=>parse(str, {
        allowDots: false,
        allowPrototypes: true
      });
      break;
    case 'simple':
      fn = querystring.parse;
      break;
    default:
      throw new TypeError('unknown value for query parser function: ' + val);
  }

  return fn;
}

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} val
 * @return {Function}
 * @api private
 */

function compileTrust(val) {
  if (typeof val === 'function') {
    return val;
  }

  if (val === true) {
    // Support plain true/false
    return ()=>true;
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return (a, i)=>i < val ;
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    val = val.split(/ *, */);
  }

  return proxyaddr.compile(val || []);
}

/**
 * Set the charset in a given Content-Type string.
 *
 * @param {String} type
 * @param {String} charset
 * @return {String}
 * @api private
 */

function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  var parsed = contentType.parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return contentType.format(parsed);
};

export {
  etag,
  wetag,
  isAbsolute,
  flatten,
  normalizeType,
  normalizeTypes,
  contentDisposition,
  compileETag,
  compileQueryParser,
  compileTrust,
  setCharset
 }
