
'use strict';

/**
 * Module dependencies.
 * @api private
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _contentDisposition = require('content-disposition');

var _contentDisposition2 = _interopRequireDefault(_contentDisposition);

var _contentType = require('content-type');

var _contentType2 = _interopRequireDefault(_contentType);

var _arrayFlatten = require('array-flatten');

var _arrayFlatten2 = _interopRequireDefault(_arrayFlatten);

var _send = require('send');

var _path = require('path');

var _etag2 = require('etag');

var _etag3 = _interopRequireDefault(_etag2);

var _proxyAddr = require('proxy-addr');

var _proxyAddr2 = _interopRequireDefault(_proxyAddr);

var _qs = require('qs');

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

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
  var parts = str.split(/ *; */);
  var ret = { value: parts[0], quality: 1, params: {}, originalIndex: index };

  for (var i = 1; i < parts.length; i++) {
    var pms = parts[i].split(/ *= */);
    if ('q' === pms[0]) {
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

function etag(body, encoding) {
  var buf = !Buffer.isBuffer(body) ? new Buffer(body, encoding) : body;

  return (0, _etag3['default'])(buf, { weak: false });
};

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

function wetag(body, encoding) {
  var buf = !Buffer.isBuffer(body) ? new Buffer(body, encoding) : body;

  return (0, _etag3['default'])(buf, { weak: true });
};

/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

function isAbsolute(path) {
  if ('/' == path[0]) {
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

function normalizeType(type) {
  return type.indexOf('/') > -1 ? acceptParams(type) : { value: _send.mime.lookup(type), params: {} };
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

function normalizeTypes(types) {
  var ret = [];

  for (var i = 0; i < types.length; i++) {
    ret.push(normalizeType(types[i]));
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
  var fn = undefined;

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
  var fn = undefined;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
      fn = _querystring2['default'].parse;
      break;
    case false:
      fn = function () {
        return new Object();
      };
      break;
    case 'extended':
      fn = function (str) {
        return (0, _qs.parse)(str, {
          allowDots: false,
          allowPrototypes: true
        });
      };
      break;
    case 'simple':
      fn = _querystring2['default'].parse;
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
    return function () {
      return true;
    };
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return function (a, i) {
      return i < val;
    };
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    val = val.split(/ *, */);
  }

  return _proxyAddr2['default'].compile(val || []);
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
  var parsed = _contentType2['default'].parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return _contentType2['default'].format(parsed);
};

exports.etag = etag;
exports.wetag = wetag;
exports.isAbsolute = isAbsolute;
exports.flatten = _arrayFlatten2['default'];
exports.normalizeType = normalizeType;
exports.normalizeTypes = normalizeTypes;
exports.contentDisposition = _contentDisposition2['default'];
exports.compileETag = compileETag;
exports.compileQueryParser = compileQueryParser;
exports.compileTrust = compileTrust;
exports.setCharset = setCharset;