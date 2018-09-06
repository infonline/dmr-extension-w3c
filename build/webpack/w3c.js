/* eslint-disable import/no-extraneous-dependencies */
const args = require('../lib/args');
const config = require('../config');
const utils = require('../lib/utils');
const vueLoaderConfig = require('./vue');


/**
 * Webpack base configuration
 *
 * @type {Object}
 */
module.exports = {
  mode: args.env,
  entry: {
    background: './src/w3c/scripts/background.js',
    content: './src/w3c/scripts/content.js',
    popup: './src/w3c/popup/popup.js',
  },
  output: {
    path: config.output,
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/popup.chunk.[id].js',
    publicPath: config.assetsPublicPath,
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [utils.resolve('src'), utils.resolve('test'), utils.resolve('node_modules/webpack-dev-server/client')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [/fonts/],
        options: {
          limit: 10000,
          name: 'images/[name].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [/images/],
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]',
        },
      },
    ],
  },
  stats: args.verbose ? 'normal' : 'none',
};
