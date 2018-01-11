/* eslint-disable import/no-extraneous-dependencies,no-console */
const args = require('./lib/args');
const webpack = require('webpack');
const webpackConfig = require('./webpack');

// Create webpack compiler instance
const compiler = webpack(webpackConfig);

// Check if watch is
if (args.watch) {
  // Watch for whole project for changes and run compiler on change
  compiler.watch({}, (err) => {
    if (err) {
      console.log(err);
    }
  });
} else {
  // Run compilation of all extension assets
  compiler.run((err, stats) => {
    if (err) {
      // Log error
      console.error(err);
    }
    // When built with no watch switch log build summary
    console.log(stats.toString());
  });
}
