const args = require('../lib/args');

module.exports = {
  env: 'production',
  sourcemaps: args.sourcemaps,
  gzip: false,
  report: args.report,
  showEslintErrorsInOverlay: false,
  cacheBusting: true,
};
