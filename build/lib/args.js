// eslint-disable-next-line import/no-extraneous-dependencies
const yargs = require('yargs');

const args = yargs
  .option('env', {
    string: true,
    default: 'development',
    describe: 'Specifies the target environment',
    choices: ['development', 'testing', 'production'],
  })
  .option('watch', {
    boolean: true,
    default: false,
    describe: 'Watch all files and start a live reload server',
  })
  .option('verbose', {
    boolean: true,
    default: false,
    describe: 'Log additional data',
  })
  .option('vendor', {
    string: true,
    default: 'chrome',
    describe: 'Compile the extension for different vendors',
    choices: ['chrome', 'edge', 'firefox', 'opera'],
  })
  .option('script-uri', {
    string: true,
    default: 'https://script.ioam.de/iam.js',
    describe: 'Compile the extension with different INFOnline measurement script URI',
  })
  .option('sourcemaps', {
    describe: 'Force the creation of source maps',
  })
  .option('report', {
    boolean: true,
    default: false,
    describe: 'Show bundle analyzer report after build',
  })
  .argv;

// Use production flag for source maps as a fallback
if (typeof args.sourcemaps === 'undefined') {
  args.sourcemaps = !args.production;
}

/**
 * Export parsed CLI arguments
 *
 * @type {Object} - Arguments parsed from process.argv
 * @property {String} env - The target environment
 * @property {Boolean} watch - Specifies if development assets should be watched
 * @property {Boolean} verbose - Specifies if additional information should be logged to console
 * @property {String} vendor - Specifies the target vendor (Chrome, Firefox, Edge or Opera)
 * @property {String} scriptUri - Specifies the URL of the INFOnline iam.js
 * @property {Boolean} sourcemaps - Specifies if css and js sources should be created with
 *           sourcemaps
 * @property {Boolean} report - Specifies if an bundle report should be printed after build process
 */
module.exports = args;
