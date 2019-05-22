/* eslint-disable import/no-extraneous-dependencies,no-console */
const chalk = require('chalk');
const { execFile } = require('child_process');
const fse = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const pack = require('./lib/pack');
const pkg = require('../package.json');
const args = require('./lib/args');
const webpackConfig = require('./webpack');
const safariWebpackConfig = require('./webpack/safari');

const { log } = console;
const { version } = pkg;

// Create webpack compiler instance
let compiler = webpack(webpackConfig);
const PACKAGE_CONFIG = {
  vendor: args.vendor,
  filename: `DMR-${version}.zip`,
  format: 'zip',
};

webpack.logLevel = args.verbose ? 'INFO' : 'NONE';
// Build browser extension for safari
if (args.vendor === 'safari') {
  // Check if xcode cli tools are installed
  fse.exists('/usr/bin/xcodebuild', async (state) => {
    if (state) {
      log(chalk.white.bgBlue(' INFO '), chalk.blue(`Start building extension for ${args.vendor}.`));
      const source = path.join(__dirname, '../src/safari');
      const target = path.join(__dirname, '../.temp/safari');
      try {
        await fse.ensureDir(target);
        await fse.copy(source, target);
        compiler = webpack(safariWebpackConfig);
        // Run webpack compiler
        compiler.run(async (buildError, stats) => {
          if (buildError) {
            // Log error
            log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed!`));
            log(chalk.red(buildError));
          } else {
            // Create command arguments for the xcode build tools
            const xcodeArgs = [
              '-project',
              path.join(path.join(target, 'IAM/IAM.xcodeproj')),
              '-scheme',
              'IMAREX',
            ];
            // Run xcode build tools
            execFile('xcodebuild', xcodeArgs, async (err) => {
              // Check if there is an error occurred
              if (err) {
                log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed.`));
                log(chalk.white.bgRed(' ERROR '), chalk.red(err));
              } else {
                // Remove .temp directory
                await fse.remove(path.join(__dirname, '../.temp'));
                // When built with no watch switch log build summary when verbose option is on
                if (args.verbose) {
                  log(stats.toString());
                }
                log(chalk.black.bgGreen(' DONE '), chalk.green(`Building extension for ${args.vendor} successful.`));
              }
            });
          }
        });
      } catch (err) {
        log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed.`));
      }
    } else {
      log(chalk.white.bgRed(' ERROR '), chalk.red(`Building extension for ${args.vendor} failed. No xcode cli tools installed.`));
    }
  });
} else if (args.vendor !== 'safari') {
  // Build browser extension for other browsers than safari (W3C compliant browser)
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
            return fse.copy(path.join(__dirname, '../packages', args.vendor, PACKAGE_CONFIG.filename),
              path.join(__dirname, '../packages', args.vendor, 'DMR-latest.zip'));
          })
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
}
