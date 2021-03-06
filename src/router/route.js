
'use strict';

/**
 * Module dependencies.
 * @private
 */

import _debug from 'debug';
import flatten from 'array-flatten';
import Layer from './layer';
import {METHODS} from 'http';

/**
 * Module variables.
 * @private
 */
const debug = _debug('express:router:route');
const slice = Array.prototype.slice;
const toString = Object.prototype.toString;
const methods = METHODS.map((m)=>m.toLowerCase());


/**
 * Initialize `Route` with the given `path`,
 *
 * @param {String} path
 * @public
 */
class Route {
    constructor(path) {
        this.path = path;
        this.stack = [];

        debug('new %s', path);

        // route handlers for various http methods
        this.methods = {};

        methods.forEach(function(method){
          Route.prototype[method] = function(){
            let handles = flatten(slice.call(arguments));

            for (let i = 0; i < handles.length; i++) {
              let handle = handles[i];

              if (typeof handle !== 'function') {
                let type = toString.call(handle);
                let msg = 'Route.' + method + '() requires callback functions but got a ' + type;
                throw new Error(msg);
              }

              debug('%s %s', method, this.path);

              let layer = new Layer('/', {}, handle);
              layer.method = method;

              this.methods[method] = true;
              this.stack.push(layer);
            }

            return this;
          };
        });
    }

    /**
     * Determine if the route handles a given method.
     * @private
     */
    _handles_method(method) {
      if (this.methods._all) {
        return true;
      }

      let name = method.toLowerCase();

      if (name === 'head' && !this.methods['head']) {
        name = 'get';
      }

      return Boolean(this.methods[name]);
    }

    /**
     * @return {Array} supported HTTP methods
     * @private
     */
     _options() {
      let methods = Object.keys(this.methods);

      // append automatic head
      if (this.methods.get && !this.methods.head) {
        methods.push('head');
      }

      for (let i = 0; i < methods.length; i++) {
        // make upper case
        methods[i] = methods[i].toUpperCase();
      }

      return methods;
    }

    /**
     * dispatch req, res into this route
     * @private
     */
     dispatch(req, res, done) {
      let idx = 0;
      let stack = this.stack;
      if (stack.length === 0) {
        return done();
      }

      let method = req.method.toLowerCase();
      if (method === 'head' && !this.methods['head']) {
        method = 'get';
      }

      req.route = this;

      next();

      function next(err) {
        if (err && err === 'route') {
          return done();
        }

        let layer = stack[idx++];
        if (!layer) {
          return done(err);
        }

        if (layer.method && layer.method !== method) {
          return next(err);
        }

        if (err) {
          layer.handle_error(err, req, res, next);
        } else {
          layer.handle_request(req, res, next);
        }
      }
    }

    /**
     * Add a handler for all HTTP verbs to this route.
     *
     * Behaves just like middleware and can respond or call `next`
     * to continue processing.
     *
     * You can use multiple `.all` call to add multiple handlers.
     *
     *   function check_something(req, res, next){
     *     next();
     *   };
     *
     *   function validate_user(req, res, next){
     *     next();
     *   };
     *
     *   route
     *   .all(validate_user)
     *   .all(check_something)
     *   .get(function(req, res, next){
     *     res.send('hello world');
     *   });
     *
     * @param {function} handler
     * @return {Route} for chaining
     * @api public
     */
     all() {
      let handles = flatten(slice.call(arguments));

      for (let i = 0; i < handles.length; i++) {
        let handle = handles[i];

        if (typeof handle !== 'function') {
          let type = toString.call(handle);
          let msg = 'Route.all() requires callback functions but got a ' + type;
          throw new TypeError(msg);
        }

        let layer = new Layer('/', {}, handle);
        layer.method = undefined;

        this.methods._all = true;
        this.stack.push(layer);
      }

      return this;
    }
}



/**
 * Module exports.
 * @public
 */

export default Route;
