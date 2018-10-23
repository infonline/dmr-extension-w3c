/* eslint-disable import/no-extraneous-dependencies */
const esLintFriendlyFormatter = require('eslint-friendly-formatter');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpack = require('webpack');
const args = require('../lib/args');
const config = require('../config');
const utils = require('../lib/utils');

const basePlugins = [
  new webpack.DefinePlugin({
    ENV: JSON.stringify(config.env),
    IAM_SCRIPT_URL: JSON.stringify(args.scriptUri),
    IAM_PANEL_EXCHANGE_URL: JSON.stringify(args.panelExchangeUri),
  }),
  new FriendlyErrorsWebpackPlugin(),
];

/**
 * Webpack base configuration
 *
 * @type {Object}
 */
module.exports = {
  entry: {
    content: './.temp/safari/IMAREX/content.js',
  },
  output: {
    path: config.output,
    filename: '[name].js',
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
  optimization: {
    minimize: args.env === 'production',
  },
  stats: args.verbose ? 'normal' : 'none',
  plugins: basePlugins,
};
