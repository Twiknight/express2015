
'use strict';

/**
 * Module dependencies.
 * @private
 */

import accepts from 'accepts';
import {isIP} from 'net';
import typeis from 'type-is';
import http from 'http';
import fresh from 'fresh';
import parseRange from 'range-parser';
import parse from 'parseurl';
import proxyaddr from 'proxy-addr';

/**
 * Request class.
 */

class Request extends http.IncomingMessage {
    constructor() {
        super();
    }

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     req.get('Content-Type');
     *     // => "text/plain"
     *
     *     req.get('content-type');
     *     // => "text/plain"
     *
     *     req.get('Something');
     *     // => undefined
     *
     * Aliased as `req.header()`.
     *
     * @param {String} name
     * @return {String}
     * @public
     */
    get(name){
        let lc_name = name.toLowerCase();

        if(lc_name==="referer" || lc_name==="referrer"){
            return this.headers.referrer
              || this.headers.referer;
        }
        return this.headers[lc_name];
    }
    header(name){
        return this.get(name);
    }

    /**
     * To do: update docs.
     *
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `undefined`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single MIME type string
     * such as "application/json", an extension name
     * such as "json", a comma-delimited list such as "json, html, text/plain",
     * an argument list such as `"json", "html", "text/plain"`,
     * or an array `["json", "html", "text/plain"]`. When a list
     * or array is given, the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     req.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('html');
     *     // => "html"
     *     req.accepts('text/html');
     *     // => "text/html"
     *     req.accepts('json, text');
     *     // => "json"
     *     req.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('image/png');
     *     req.accepts('png');
     *     // => undefined
     *
     *     // Accept: text/*;q=.5, application/json
     *     req.accepts(['html', 'json']);
     *     req.accepts('html', 'json');
     *     req.accepts('html, json');
     *     // => "json"
     *
     * @param {String|Array} type(s)
     * @return {String|Array|Boolean}
     * @public
     */
    accepts(...args){
        let accept = accepts(this);
        return accept.types.apply(accept, args);
    }

    /**
     * Check if the given `encoding`s are accepted.
     *
     * @param {String} ...encoding
     * @return {String|Array}
     * @public
     */
     acceptsEncodings(...args){
         let accept = accepts(this);
         return accept.encodings.apply(accept,args);
     }

     /**
      * Check if the given `charset`s are acceptable,
      * otherwise you should respond with 406 "Not Acceptable".
      *
      * @param {String} ...charset
      * @return {String|Array}
      * @public
      */
      acceptsCharsets(...args){
          let accept = accepts(this);
          return accept.charsets.apply(accept, args);
      }

      /**
       * Check if the given `lang`s are acceptable,
       * otherwise you should respond with 406 "Not Acceptable".
       *
       * @param {String} ...lang
       * @return {String|Array}
       * @public
       */
       acceptsLanguages(...args){
           let accept = accepts(this);
           return accept.languages.apply(accept, args);
       }

       /**
        * Parse Range header field,
        * capping to the given `size`.
        *
        * Unspecified ranges such as "0-" require
        * knowledge of your resource length. In
        * the case of a byte range this is of course
        * the total number of bytes. If the Range
        * header field is not given `null` is returned,
        * `-1` when unsatisfiable, `-2` when syntactically invalid.
        *
        * NOTE: remember that ranges are inclusive, so
        * for example "Range: users=0-3" should respond
        * with 4 users when available, not 3.
        *
        * @param {Number} size
        * @return {Array}
        * @public
        */
        range(size){
            let range = this.get('Range');
            if (!range) return;
            return parseRange(size, range);
        }

        /**
         * Check if the incoming request contains the "Content-Type"
         * header field, and it contains the give mime `type`.
         *
         * Examples:
         *
         *      // With Content-Type: text/html; charset=utf-8
         *      req.is('html');
         *      req.is('text/html');
         *      req.is('text/*');
         *      // => true
         *
         *      // When Content-Type is application/json
         *      req.is('json');
         *      req.is('application/json');
         *      req.is('application/*');
         *      // => true
         *
         *      req.is('html');
         *      // => false
         *
         * @param {String|Array} types...
         * @return {String|false|null}
         * @public
         */
        is(types) {
          let arr = types;

          // support flattened arguments
          if (!Array.isArray(types)) {
            arr = new Array(arguments.length);
            for (let i = 0; i < arr.length; i++) {
              arr[i] = arguments[i];
            }
          }

          return typeis(this, arr);
        }

        get protocol(){
            let proto = this.connection.encrypted
              ? 'https'
              : 'http';
            let trust = this.app.get('trust proxy fn');

            if (!trust(this.connection.remoteAddress, 0)) {
              return proto;
            }

            // Note: X-Forwarded-Proto is normally only ever a
            //       single value, but this is to be safe.
            proto = this.get('X-Forwarded-Proto') || proto;
            return proto.split(/\s*,\s*/)[0];
        }

        /**
         * Short-hand for:
         *
         *    req.protocol == 'https'
         *
         * @return {Boolean}
         * @public
         */
        get secure(){
          return this.protocol === 'https';
        }

        /**
         * Return the remote address from the trusted proxy.
         *
         * The is the remote address on the socket unless
         * "trust proxy" is set.
         *
         * @return {String}
         * @public
         */
         get ip(){
             let trust = this.app.get('trust proxy fn');
             return proxyaddr(this, trust);
         }

        /**
         * When "trust proxy" is set, trusted proxy addresses + client.
         *
         * For example if the value were "client, proxy1, proxy2"
         * you would receive the array `["client", "proxy1", "proxy2"]`
         * where "proxy2" is the furthest down-stream and "proxy1" and
         * "proxy2" were trusted.
         *
         * @return {Array}
         * @public
         */
         get ips() {
           let trust = this.app.get('trust proxy fn');
           let addrs = proxyaddr.all(this, trust);
           return addrs.slice(1).reverse();
         }

        /**
         * Return subdomains as an array.
         *
         * Subdomains are the dot-separated parts of the host before the main domain of
         * the app. By default, the domain of the app is assumed to be the last two
         * parts of the host. This can be changed by setting "subdomain offset".
         *
         * For example, if the domain is "tobi.ferrets.example.com":
         * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
         * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
         *
         * @return {Array}
         * @public
         */
        get subdomains() {
          let hostname = this.hostname;

          if (!hostname) return [];

          let offset = this.app.get('subdomain offset');
          let _subdomains = !isIP(hostname)
            ? hostname.split('.').reverse()
            : [hostname];

          return _subdomains.slice(offset);
        }

        /**
         * Short-hand for `url.parse(req.url).pathname`.
         *
         * @return {String}
         * @public
         */
         get path(){
             return parse(this).pathname;
         }

         /**
          * Parse the "Host" header field to a hostname.
          *
          * When the "trust proxy" setting trusts the socket
          * address, the "X-Forwarded-Host" header field will
          * be trusted.
          *
          * @return {String}
          * @public
          */
          get hostname(){
              let trust = this.app.get('trust proxy fn');
              let host = this.get('X-Forwarded-Host');

              if (!host || !trust(this.connection.remoteAddress, 0)) {
                host = this.get('Host');
              }

              if (!host) return;

              // IPv6 literal support
              let offset = host[0] === '['
                ? host.indexOf(']') + 1
                : 0;
              let index = host.indexOf(':', offset);

              return index !== -1
                ? host.substring(0, index)
                : host;
          }

        /**
         * Check if the request is fresh, aka
         * Last-Modified and/or the ETag
         * still match.
         *
         * @return {Boolean}
         * @public
         */
         get fresh(){
             let method = this.method;
             let s = this.res.statusCode;

             // GET or HEAD for weak freshness validation only
             if ('GET' != method && 'HEAD' != method) return false;

             // 2xx or 304 as per rfc2616 14.26
             if ((s >= 200 && s < 300) || 304 == s) {
               return fresh(this.headers, (this.res._headers || {}));
             }

             return false;
         }

        /**
         * Check if the request is stale, aka
         * "Last-Modified" and / or the "ETag" for the
         * resource has changed.
         *
         * @return {Boolean}
         * @public
         */
         get stale(){
             return !this.fresh;
         }

        /**
         * Check if the request was an _XMLHttpRequest_.
         *
         * @return {Boolean}
         * @public
         */
         get xhr(){
             let val = this.get('X-Requested-With') || '';
             return val.toLowerCase() === 'xmlhttprequest';
         }
}

let req = new Request();
export default req;
