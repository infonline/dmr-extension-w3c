/* eslint-disable import/no-extraneous-dependencies,no-console */
const args = require('./lib/args');
const chalk = require('chalk');
const pack = require('./lib/pack');
const webpack = require('webpack');
const webpackConfig = require('./webpack');
const pkg = require('../package.json');

const { log } = console;
const { version } = pkg;

// Create webpack compiler instance
const compiler = webpack(webpackConfig);

webpack.logLevel = args.verbose ? 'INFO' : 'NONE';

try {
  // Check if watch is
  if (args.watch) {
    // Watch for whole project for changes and run compiler on change
    compiler.watch({}, (buildError) => {
      if (buildError) {
        throw buildError;
      }
    });
  } else {
    log(chalk.white.bgBlue(' INFO '), chalk.blue(`Start building extension for ${args.vendor}.`));
    // Run compilation of all extension assets
    compiler.run(async (buildError, stats) => {
      if (buildError) {
        // Log error
        log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed!`));
        throw buildError;
      }
      // When built with no watch switch log build summary when verbose option is on
      if (args.verbose) {
        log(stats.toString());
      }
      log(chalk.black.bgGreen(' DONE '), chalk.green(`Building extension for ${args.vendor} successful.`));
      if (args.pack) {
        log(chalk.white.bgBlue(' INFO '), chalk.blue(`Start packaging extension for ${args.vendor}.`));
        await pack({
          vendor: args.vendor,
          filename: `IMAREX-${version}.zip`,
          format: 'zip',
        });
        log(chalk.black.bgGreen(' DONE '), chalk.green(`Packaging extension for ${args.vendor} successful.`));
      }
    });
  }
} catch (err) {
  // Log error
  log(chalk.red(err));
}
