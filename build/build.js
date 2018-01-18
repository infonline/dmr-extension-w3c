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
const PACKAGE_CONFIG = {
  vendor: args.vendor,
  filename: `IMAREX-${version}.zip`,
  format: 'zip',
};

webpack.logLevel = args.verbose ? 'INFO' : 'NONE';

if (args.watch) {
  // Watch for whole project for changes and run compiler on change
  compiler.watch({}, (buildError) => {
    if (buildError) {
      log(chalk.red(buildError));
    }
  });
} else {
  log(chalk.white.bgBlue(' INFO '), chalk.blue(`Start building extension for ${args.vendor}.`));
  // Run compilation of all extension assets
  compiler.run(async (buildError, stats) => {
    if (buildError) {
      // Log error
      log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed!`));
      log(chalk.red(buildError));
    }
    // When built with no watch switch log build summary when verbose option is on
    if (args.verbose) {
      log(stats.toString());
    }
    log(chalk.black.bgGreen(' DONE '), chalk.green(`Building extension for ${args.vendor} successful.`));
    if (args.pack) {
      log(chalk.white.bgBlue(' INFO '), chalk.blue(`Start packaging extension for ${args.vendor}.`));
      pack(PACKAGE_CONFIG)
        .then(() => {
          log(chalk.black.bgGreen(' DONE '), chalk.green(`Packaging extension for ${args.vendor} successful.`));
        })
        .catch((err) => {
          if (err) {
            log(chalk.red(err));
          } else {
            log(chalk.black.bgGreen(' DONE '), chalk.green(`Packaging extension for ${args.vendor} successful.`));
          }
        });
    }
  });
}
