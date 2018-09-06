const args = require('../lib/args');

module.exports = {
  env: 'production',
  sourceMap: false,
  gzip: false,
  report: args.report,
  showEslintErrorsInOverlay: false,
  cacheBusting: true,
};
