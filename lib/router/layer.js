
'use strict';

/**
 * Module dependencies.
 * @private
 */

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var debug = (0, _debug3['default'])('express:router:layer');

/**
 * Module variables.
 * @private
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Module exports.
 * @public
 */

var Layer = (function () {
  function Layer(path, options, fn) {
    _classCallCheck(this, Layer);

    if (!(this instanceof Layer)) {
      return new Layer(path, options, fn);
    }

    debug('new %s', path);
    var opts = options || {};

    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.regexp = (0, _pathToRegexp2['default'])(path, this.keys = [], opts);

    //properties default to undefined.
    this.params;
    this.path;

    if (path === '/' && opts.end === false) {
      this.regexp.fast_slash = true;
    }
  }

  /**
   * Decode param value.
   *
   * @param {string} val
   * @return {string}
   * @private
   */

  /**
    * Handle the error for the layer.
   *
   * @param {Error} error
   * @param {Request} req
   * @param {Response} res
   * @param {function} next
   * @api private
   */

  _createClass(Layer, [{
    key: 'handle_error',
    value: function handle_error(error, req, res, next) {
      var fn = this.handle;

      if (fn.length !== 4) {
        // not a standard error handler
        return next(error);
      }

      try {
        fn(error, req, res, next);
      } catch (err) {
        next(err);
      }
    }

    /**
     * Handle the request for the layer.
     *
     * @param {Request} req
     * @param {Response} res
     * @param {function} next
     * @api private
     */
  }, {
    key: 'handle_request',
    value: function handle_request(req, res, next) {
      var fn = this.handle;

      if (fn.length > 3) {
        // not a standard request handler
        return next();
      }

      try {
        fn(req, res, next);
      } catch (err) {
        next(err);
      }
    }

    /**
     * Check if this route matches `path`, if so
     * populate `.params`.
     *
     * @param {String} path
     * @return {Boolean}
     * @api private
     */
  }, {
    key: 'match',
    value: function match(path) {
      if (path == null) {
        // no path, nothing matches
        this.params = undefined;
        this.path = undefined;
        return false;
      }

      if (this.regexp.fast_slash) {
        // fast path non-ending match for / (everything matches)
        this.params = {};
        this.path = '';
        return true;
      }

      var m = this.regexp.exec(path);

      if (!m) {
        this.params = undefined;
        this.path = undefined;
        return false;
      }

      // store values
      this.params = {};
      this.path = m[0];

      var keys = this.keys;
      var params = this.params;

      for (var i = 1; i < m.length; i++) {
        var key = keys[i - 1];
        var prop = key.name;
        var val = decode_param(m[i]);

        if (val !== undefined || !hasOwnProperty.call(params, prop)) {
          params[prop] = val;
        }
      }

      return true;
    }
  }]);

  return Layer;
})();

function decode_param(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = 'Failed to decode param \'' + val + '\'';
      err.status = err.statusCode = 400;
    }

    throw err;
  }
}

exports['default'] = function (path, options, fn) {
  return new Layer(path, options, fn);
};

;
module.exports = exports['default'];