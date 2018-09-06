const args = require('../lib/args');

module.exports = {
  env: 'testing',
  sourceMap: true,
  gzip: false,
  report: args.report,
  showEslintErrorsInOverlay: true,
  cacheBusting: true,
};
