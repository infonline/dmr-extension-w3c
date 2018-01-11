const args = require('../lib/args');
const base = require('./base');
const dev = require('./dev');
const prod = require('./prod');
const test = require('./test');

let config = {};

if (args.env === 'production') {
  config = Object.assign({}, base, prod);
} else if (args.env === 'testing') {
  config = Object.assign({}, base, test);
} else {
  config = Object.assign({}, base, dev);
}
/**
 * Build configuration
 *
 * @type {Object}
 * @property {String} assetsRoot - Root directory for all assets
 * @property {String} assetsSubDirectory - Default sub directory for assets
 * @property {String} assetsPublicPath - Default public path for assets
 * @property {String} env - The target environment
 * @property {String} extensionRoot - The root folder path of the extension
 * @property {Boolean} sourcemaps - Specifies if sourcemaps should be printed
 * @property {Boolean} gzip - Specifies if all assets should be gzipped
 * @property {Boolean} gzipExtensions - Specifies the extension to compress via gzip
 * @property {Boolean} report - Specifies if a bundle report should be printed after build finished
 */
module.exports = config;
