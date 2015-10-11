
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

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _arrayFlatten = require('array-flatten');

var _arrayFlatten2 = _interopRequireDefault(_arrayFlatten);

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

var _http = require('http');

/**
 * Module variables.
 * @private
 */
var debug = (0, _debug3['default'])('express:router:route');
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;
var verbs_lc = _http.METHODS.map(function (m) {
  return m.toLowerCase();
});

/**
 * Initialize `Route` with the given `path`,
 *
 * @param {String} path
 * @public
 */

var Route = (function () {
  function Route(path) {
    _classCallCheck(this, Route);

    this.path = path;
    this.stack = [];

    debug('new %s', path);

    // route handlers for various http methods
    this.methods = {};

    verbs_lc.forEach(function (method) {
      Route.prototype[method] = function () {
        var handles = (0, _arrayFlatten2['default'])(slice.call(arguments));

        for (var i = 0; i < handles.length; i++) {
          var handle = handles[i];

          if (typeof handle !== 'function') {
            var type = toString.call(handle);
            var msg = 'Route.' + method + '() requires callback functions but got a ' + type;
            throw new Error(msg);
          }

          debug('%s %s', method, this.path);

          var layer = new _layer2['default']('/', {}, handle);
          layer.method = method;

          this.methods[method] = true;
          this.stack.push(layer);
        }

        return this;
      };
    });
  }

  /**
   * Module exports.
   * @public
   */

  /**
   * Determine if the route handles a given method.
   * @private
   */

  _createClass(Route, [{
    key: '_handles_method',
    value: function _handles_method(method) {
      if (this.methods._all) {
        return true;
      }

      var name = method.toLowerCase();

      if (name === 'head' && !this.methods['head']) {
        name = 'get';
      }

      return Boolean(this.methods[name]);
    }

    /**
     * @return {Array} supported HTTP methods
     * @private
     */
  }, {
    key: '_options',
    value: function _options() {
      var methods = Object.keys(this.methods);

      // append automatic head
      if (this.methods.get && !this.methods.head) {
        methods.push('head');
      }

      for (var i = 0; i < methods.length; i++) {
        // make upper case
        methods[i] = methods[i].toUpperCase();
      }

      return methods;
    }

    /**
     * dispatch req, res into this route
     * @private
     */
  }, {
    key: 'dispatch',
    value: function dispatch(req, res, done) {
      var idx = 0;
      var stack = this.stack;
      if (stack.length === 0) {
        return done();
      }

      var method = req.method.toLowerCase();
      if (method === 'head' && !this.methods['head']) {
        method = 'get';
      }

      req.route = this;

      next();

      function next(_x) {
        var _again = true;

        _function: while (_again) {
          var err = _x;
          layer = undefined;
          _again = false;

          if (err && err === 'route') {
            return done();
          }

          var layer = stack[idx++];
          if (!layer) {
            return done(err);
          }

          if (layer.method && layer.method !== method) {
            _x = err;
            _again = true;
            continue _function;
          }

          if (err) {
            layer.handle_error(err, req, res, next);
          } else {
            layer.handle_request(req, res, next);
          }
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
  }, {
    key: 'all',
    value: function all() {
      var handles = (0, _arrayFlatten2['default'])(slice.call(arguments));

      for (var i = 0; i < handles.length; i++) {
        var handle = handles[i];

        if (typeof handle !== 'function') {
          var type = toString.call(handle);
          var msg = 'Route.all() requires callback functions but got a ' + type;
          throw new TypeError(msg);
        }

        var layer = new _layer2['default']('/', {}, handle);
        layer.method = undefined;

        this.methods._all = true;
        this.stack.push(layer);
      }

      return this;
    }
  }]);

  return Route;
})();

exports['default'] = Route;
module.exports = exports['default'];