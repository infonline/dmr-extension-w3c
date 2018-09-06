const args = require('../lib/args');
/**
 * Development configuration
 *
 * @type {Object}
 */
module.exports = {
  env: 'development',
  sourcemaps: true,
  gzip: false,
  report: args.report,
  showEslintErrorsInOverlay: true,
  cacheBusting: true,
};
