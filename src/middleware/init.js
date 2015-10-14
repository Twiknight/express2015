
'use strict';

/**
 * Initialization middleware, exposing the
 * request and response to each other, as well
 * as defaulting the X-Powered-By header field.
 *
 * @param {Function} app
 * @return {Function}
 * @api private
 */

const init = function(app){
  return function expressInit(req, res, next){
    new Promise(function(resolve, reject) {

      if (app.enabled('x-powered-by')) {
        res.setHeader('X-Powered-By', 'Express');
      }
      req.res = res;
      res.req = req;
      req.next = next;

      req.__proto__ = app.request;
      res.__proto__ = app.response;

      res.locals = res.locals || Object.create(null);

      resolve();
    }).then(next);
  };
};

export default {init};
