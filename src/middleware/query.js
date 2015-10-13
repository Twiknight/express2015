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

import parseUrl from 'parseurl';
import {parse} from 'qs';

/**
 * @param {Object} options
 * @return {Function}
 * @api public
 */

export default function query(options) {
  let opts = Object.create(options || null);
  let queryparse = parse;

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

  return function query(req, res, next){
     new Promise(function(resolve, reject) {
        if (!req.query) {
            resolve();
        }else {
            reject();
        }
    }).then(function () {
          let val = parseUrl(req).query;
          req.query = queryparse(val, opts);
          next();
    },next);
  };
};
