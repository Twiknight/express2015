'use strict';

/**
 * Module dependencies.
 * @private
 */
import * as path from 'path';
import {statSync as statSync} from 'fs'
import * as utils from './utils'

/**
 * Module variables.
 * @private
 */

let debug = require("debug")("express:view")
let dirname = path.dirname;
let basename = path.basename;
let extname = path.extname;
let join = path.join;
let  resolve = path.resolve;


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

class View {
    constructor(name, options) {
        let opts = options || {};
        let self = this;

        this.defaultEngine = opts.defaultEngine;
        this.ext = extname(name)
        this.name = name;
        this.root = opts.root;

        let fileName = name;
        if(!this.ext){
            this.ext = load_ext_from_defaultEngine();
            fileName += this.ext;
        }

         // load engine
        if (!opts.engines[this.ext]) {
            opts.engines[this.ext] = load_engine(this.ext.substr(1))
        }

        // store loaded engine
        this.engine = opts.engines[this.ext];
        // lookup path
        this.path = this.lookup(fileName);

        // get extension from default engine name
        function load_ext_from_defaultEngine() {
            if(!self.defaultEngine){
                throw new Error('No default engine was specified and no extension was provided.');
            }
            return self.defaultEngine[0] !== '.'
                        ? '.' + self.defaultEngine
                        : self.defaultEngine;
        }

        // load engine with name
        function load_engine(module_name) {
            return require(module_name).__express;
        }
    }

    /**
     * Lookup view by the given `name`
     *
     * @param {string} name
     * @private
     */
    lookup(name){
        let path;
        let roots = [].concat(this.root);

        debug(`lookup ${name}`);
        for(let i=0; i<roots.length && !path; i++){
            let root = roots[i];

            //resolve the path
            let loc = resolve(root, name);
            let dir = dirname(loc);
            let file = basename(loc);

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
    render(options, callback){
        debug(`render ${this.path}`);
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
    resolve(dir, file){
        let ext = this.ext;
        let path = join(dir, file);

        //<path>.<ext>
        if(is_file(path)){
            return path;
        }

        // <path>/index.<ext>
        path = join(dir, basename(file, ext), 'index'+ext);
        if(is_file(path)){
            return path;
        }
    }
}

/**
 * check if a path represents a file
 *
 * @param {string} path
 * @return {bool} check result
 * @private
 */
function is_file(path){
    debug(`stat ${path}`);

    let stat;
    try{
        stat = statSync(path);
    }catch(e){
        return false;
    }

    if(stat){
        return stat.isFile();
    }
    return false;
}

/**
 * Module exports.
 * @public
 */
export default View
