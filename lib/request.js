
'use strict';

/**
 * Module dependencies.
 * @private
 */

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _accepts2 = require('accepts');

var _accepts3 = _interopRequireDefault(_accepts2);

var _net = require('net');

var _typeIs = require('type-is');

var _typeIs2 = _interopRequireDefault(_typeIs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _fresh = require('fresh');

var _fresh2 = _interopRequireDefault(_fresh);

var _rangeParser = require('range-parser');

var _rangeParser2 = _interopRequireDefault(_rangeParser);

var _parseurl = require('parseurl');

var _parseurl2 = _interopRequireDefault(_parseurl);

var _proxyAddr = require('proxy-addr');

var _proxyAddr2 = _interopRequireDefault(_proxyAddr);

/**
 * Request class.
 */

var Request = (function (_http$IncomingMessage) {
    _inherits(Request, _http$IncomingMessage);

    function Request() {
        _classCallCheck(this, Request);

        _get(Object.getPrototypeOf(Request.prototype), 'constructor', this).call(this);
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

    _createClass(Request, [{
        key: 'get',
        value: function get(name) {
            var lc_name = name.toLowerCase();

            if (lc_name === "referer" || lc_name === "referrer") {
                return this.headers.referrer || this.headers.referer;
            }
            return this.headers[lc_name];
        }
    }, {
        key: 'header',
        value: function header(name) {
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
    }, {
        key: 'accepts',
        value: function accepts() {
            var accept = (0, _accepts3['default'])(this);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return accept.types.apply(accept, args);
        }

        /**
         * Check if the given `encoding`s are accepted.
         *
         * @param {String} ...encoding
         * @return {String|Array}
         * @public
         */
    }, {
        key: 'acceptsEncodings',
        value: function acceptsEncodings() {
            var accept = (0, _accepts3['default'])(this);

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return accept.encodings.apply(accept, args);
        }

        /**
         * Check if the given `charset`s are acceptable,
         * otherwise you should respond with 406 "Not Acceptable".
         *
         * @param {String} ...charset
         * @return {String|Array}
         * @public
         */
    }, {
        key: 'acceptsCharsets',
        value: function acceptsCharsets() {
            var accept = (0, _accepts3['default'])(this);

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

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
    }, {
        key: 'acceptsLanguages',
        value: function acceptsLanguages() {
            var accept = (0, _accepts3['default'])(this);

            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

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
    }, {
        key: 'range',
        value: function range(size) {
            var range = this.get('Range');
            if (!range) return;
            return (0, _rangeParser2['default'])(size, range);
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
    }, {
        key: 'is',
        value: function is(types) {
            var arr = types;

            // support flattened arguments
            if (!Array.isArray(types)) {
                arr = new Array(arguments.length);
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = arguments[i];
                }
            }

            return (0, _typeIs2['default'])(this, arr);
        }
    }, {
        key: 'protocol',
        get: function get() {
            var proto = this.connection.encrypted ? 'https' : 'http';
            var trust = this.app.get('trust proxy fn');

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
    }, {
        key: 'secure',
        get: function get() {
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
    }, {
        key: 'ip',
        get: function get() {
            var trust = this.app.get('trust proxy fn');
            return (0, _proxyAddr2['default'])(this, trust);
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
    }, {
        key: 'ips',
        get: function get() {
            var trust = this.app.get('trust proxy fn');
            var addrs = _proxyAddr2['default'].all(this, trust);
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
    }, {
        key: 'subdomains',
        get: function get() {
            var hostname = this.hostname;

            if (!hostname) return [];

            var offset = this.app.get('subdomain offset');
            var _subdomains = !(0, _net.isIP)(hostname) ? hostname.split('.').reverse() : [hostname];

            return _subdomains.slice(offset);
        }

        /**
         * Short-hand for `url.parse(req.url).pathname`.
         *
         * @return {String}
         * @public
         */
    }, {
        key: 'path',
        get: function get() {
            return (0, _parseurl2['default'])(this).pathname;
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
    }, {
        key: 'hostname',
        get: function get() {
            var trust = this.app.get('trust proxy fn');
            var host = this.get('X-Forwarded-Host');

            if (!host || !trust(this.connection.remoteAddress, 0)) {
                host = this.get('Host');
            }

            if (!host) return;

            // IPv6 literal support
            var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
            var index = host.indexOf(':', offset);

            return index !== -1 ? host.substring(0, index) : host;
        }

        /**
         * Check if the request is fresh, aka
         * Last-Modified and/or the ETag
         * still match.
         *
         * @return {Boolean}
         * @public
         */
    }, {
        key: 'fresh',
        get: function get() {
            var method = this.method;
            var s = this.res.statusCode;

            // GET or HEAD for weak freshness validation only
            if ('GET' != method && 'HEAD' != method) return false;

            // 2xx or 304 as per rfc2616 14.26
            if (s >= 200 && s < 300 || 304 == s) {
                return (0, _fresh2['default'])(this.headers, this.res._headers || {});
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
    }, {
        key: 'stale',
        get: function get() {
            return !this.fresh;
        }

        /**
         * Check if the request was an _XMLHttpRequest_.
         *
         * @return {Boolean}
         * @public
         */
    }, {
        key: 'xhr',
        get: function get() {
            var val = this.get('X-Requested-With') || '';
            return val.toLowerCase() === 'xmlhttprequest';
        }
    }]);

    return Request;
})(_http2['default'].IncomingMessage);

var req = new Request();
exports['default'] = req;
module.exports = exports['default'];