import yargs from 'yargs';

const args = yargs
  .option('production', {
    boolean: true,
    default: false,
    describe: 'Minify all scripts and assets',
  })
  .option('watch', {
    boolean: true,
    default: false,
    describe: 'Watch all files and start a live eload server',
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
  .argv;

// Use production flag for source maps as a fallback
if (typeof args.sourcemaps === 'undefined') {
  args.sourcemaps = !args.production;
}

export default args;
