/* eslint-disable import/no-extraneous-dependencies */
const config = require('../config');
const utils = require('../lib/utils');
const esLintFriendlyFormatter = require('eslint-friendly-formatter');

/**
 * Webpack base configuration
 *
 * @type {Object}
 */
module.exports = {
  entry: {
    background: './src/scripts/background.js',
    popup: './src/scripts/popup.js',
    content: './src/scripts/content.js',
  },
  output: {
    path: config.output,
    filename: 'scripts/[name].js',
    publicPath: config.assetsPublicPath,
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [utils.resolve('src'), utils.resolve('test')],
      options: {
        formatter: esLintFriendlyFormatter,
      },
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [utils.resolve('src'), utils.resolve('test')],
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      exclude: [/fonts/],
      options: {
        limit: 10000,
        name: 'images/[name].[ext]',
      },
    }, {
      test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
      loader: 'url-loader',
      exclude: [/images/],
      options: {
        limit: 10000,
        name: 'fonts/[name].[ext]',
      },
    }, {
      test: /\.html$/,
      loader: 'html-loader',
    }],
  },
};
