
'use strict';

/**
 * Module dependencies.
 * @private
 */

import pathRegexp from 'path-to-regexp';
import _debug from 'debug'

const debug = _debug('express:router:layer');

/**
 * Module variables.
 * @private
 */

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Module exports.
 * @public
 */

class Layer {
  constructor(path, options, fn) {
    if (!(this instanceof Layer)) {
      return new Layer(path, options, fn);
    }

    debug('new %s', path);
    let opts = options || {};

    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.regexp = pathRegexp(path, this.keys = [], opts);

    //properties default to undefined.
    this.params;
    this.path;

    if (path === '/' && opts.end === false) {
      this.regexp.fast_slash = true;
    }
  }

  /**

   * Handle the error for the layer.
   *
   * @param {Error} error
   * @param {Request} req
   * @param {Response} res
   * @param {function} next
   * @api private
   */
  handle_error(error, req, res, next) {
    let fn = this.handle;

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
  handle_request(req, res, next) {
    let fn = this.handle;

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
  match(path) {
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

    let m = this.regexp.exec(path);

    if (!m) {
      this.params = undefined;
      this.path = undefined;
      return false;
    }

    // store values
    this.params = {};
    this.path = m[0];

    let keys = this.keys;
    let params = this.params;

    for (let i = 1; i < m.length; i++) {
      let key = keys[i - 1];
      let prop = key.name;
      let val = decode_param(m[i]);

      if (val !== undefined || !(hasOwnProperty.call(params, prop))) {
        params[prop] = val;
      }
    }

    return true;
  }
}


/**
 * Decode param value.
 *
 * @param {string} val
 * @return {string}
 * @private
 */

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

export default Layer;
