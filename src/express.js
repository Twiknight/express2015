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

import {EventEmitter} from 'events';
import mixin from 'merge-descriptors';
import application from './application';
import Router from './router';
import Route from './router/route';
import request from './request';
import response from './response';
import query from './middleware/query';
import _static from 'serve-static';
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

 function module() {
   var app = function(req, res, next) {
     app.handle(req, res, next);
   };

   mixin(app, EventEmitter.prototype, false);
   mixin(app, application, false);

   app.request = { __proto__: request, app: app };
   app.response = { __proto__: response, app: app };
   app.init();
   return app;
 }

 module.application = application;
 module.request = request;
 module.response = response;
 module.Route = Route;
 module.Router = Router;
 module.query = query;
 module['static'] = _static;
 /**
   *exports
   */
export default module;
