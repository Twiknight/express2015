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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _events = require('events');

var _mergeDescriptors = require('merge-descriptors');

var _mergeDescriptors2 = _interopRequireDefault(_mergeDescriptors);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _routerRoute = require('./router/route');

var _routerRoute2 = _interopRequireDefault(_routerRoute);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _response = require('./response');

var _response2 = _interopRequireDefault(_response);

var _middlewareQuery = require('./middleware/query');

var _middlewareQuery2 = _interopRequireDefault(_middlewareQuery);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

/**
 * Expose `createApplication()`.
 */

// exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function _module() {
  var app = function app(req, res, next) {
    app.handle(req, res, next);
  };

  (0, _mergeDescriptors2['default'])(app, _events.EventEmitter.prototype, false);
  (0, _mergeDescriptors2['default'])(app, _application2['default'], false);

  app.request = { __proto__: _request2['default'], app: app };
  app.response = { __proto__: _response2['default'], app: app };
  app.init();
  return app;
}

_module.application = _application2['default'];
_module.request = _request2['default'];
_module.response = _response2['default'];
_module.Route = _routerRoute2['default'];
_module.Router = _router2['default'];
_module.query = _middlewareQuery2['default'];
_module['static'] = _serveStatic2['default'];
/**
  *exports
  */
exports['default'] = _module;
module.exports = exports['default'];