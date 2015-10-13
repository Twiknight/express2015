/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = query;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parseurl = require('parseurl');

var _parseurl2 = _interopRequireDefault(_parseurl);

var _qs = require('qs');

/**
 * @param {Object} options
 * @return {Function}
 * @api public
 */

function query(options) {
  var opts = Object.create(options || null);
  var queryparse = _qs.parse;

  if (typeof options === 'function') {
    queryparse = options;
    opts = undefined;
  }

  if (opts !== undefined) {
    if (opts.allowDots === undefined) {
      opts.allowDots = false;
    }

    if (opts.allowPrototypes === undefined) {
      opts.allowPrototypes = true;
    }
  }

  return function query(req, res, next) {
    new Promise(function (resolve, reject) {
      if (!req.query) {
        resolve();
      } else {
        reject();
      }
    }).then(function () {
      var val = (0, _parseurl2['default'])(req).query;
      req.query = queryparse(val, opts);
      next();
    }, next);
  };
}

;
module.exports = exports['default'];