'use strict';

/**
 * Module dependencies.
 * @private
 */
Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

/**
 * Module variables.
 * @private
 */

var debug = require("debug")("express:view");
var dirname = path.dirname;
var basename = path.basename;
var extname = path.extname;
var join = path.join;
var resolve = path.resolve;

/**
 * Initialize a new `View` with the given `name`.
 *
 * Options:
 *
 *   - `defaultEngine` the default template engine name
 *   - `engines` template engine require() cache
 *   - `root` root path for view lookup
 *
 * @param {string} name
 * @param {object} options
 * @public
 */

var View = (function () {
    function View(name, options) {
        _classCallCheck(this, View);

        var opts = options || {};
        var self = this;

        this.defaultEngine = opts.defaultEngine;
        this.ext = extname(name);
        this.name = name;
        this.root = opts.root;

        var fileName = name;
        if (!this.ext) {
            this.ext = load_ext_from_defaultEngine();
            fileName += this.ext;
        }

        // load engine
        if (!opts.engines[this.ext]) {
            opts.engines[this.ext] = load_engine(this.ext.substr(1));
        }

        // store loaded engine
        this.engine = opts.engines[this.ext];
        // lookup path
        this.path = this.lookup(fileName);

        // get extension from default engine name
        function load_ext_from_defaultEngine() {
            if (!self.defaultEngine) {
                throw new Error('No default engine was specified and no extension was provided.');
            }
            return self.defaultEngine[0] !== '.' ? '.' + self.defaultEngine : self.defaultEngine;
        }

        // load engine with name
        function load_engine(module_name) {
            return require(module_name).__express;
        }
    }

    /**
     * check if a path represents a file
     *
     * @param {string} path
     * @return {bool} check result
     * @private
     */

    /**
     * Lookup view by the given `name`
     *
     * @param {string} name
     * @private
     */

    _createClass(View, [{
        key: 'lookup',
        value: function lookup(name) {
            var path = undefined;
            var roots = [].concat(this.root);

            debug('lookup ' + name);
            for (var i = 0; i < roots.length && !path; i++) {
                var root = roots[i];

                //resolve the path
                var loc = resolve(root, name);
                var dir = dirname(loc);
                var file = basename(loc);

                //resolve the file
                path = this.resolve(dir, file);
            }
            return path;
        }

        /**
         * Render with the given options.
         *
         * @param {object} options
         * @param {function} callback
         * @private
         */
    }, {
        key: 'render',
        value: function render(options, callback) {
            debug('render ' + this.path);
            // TODO: move to promise
            this.engine(this.path, options, callback);
        }

        /**
         * Resolve the file within the given directory.
         *
         * @param {string} dir
         * @param {string} file
         * @return {string} path
         * @private
         */
    }, {
        key: 'resolve',
        value: function resolve(dir, file) {
            var ext = this.ext;
            var path = join(dir, file);

            //<path>.<ext>
            if (is_file(path)) {
                return path;
            }

            // <path>/index.<ext>
            path = join(dir, basename(file, ext), 'index' + ext);
            if (is_file(path)) {
                return path;
            }
        }
    }]);

    return View;
})();

function is_file(path) {
    debug('stat ' + path);

    var stat = undefined;
    try {
        stat = (0, _fs.statSync)(path);
    } catch (e) {
        return false;
    }

    if (stat) {
        return stat.isFile();
    }
    return false;
}

/**
 * Module exports.
 * @public
 */
exports['default'] = View;
module.exports = exports['default'];