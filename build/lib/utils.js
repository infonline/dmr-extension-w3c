/* eslint-disable import/no-extraneous-dependencies */
/**
 * This module contains all build related shared functions and logic
 */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const config = require('../config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const edge = require('./edge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyJSPlugin = require('babel-minify-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const utils = require('../lib/utils');
const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');

const VENDOR_BROWSER_FULL_NAMES = {
  chrome: 'Google Chrome',
  edge: 'Microsoft Edge',
  firefox: 'Firefox',
  opera: 'Opera',
};

/**
 * Convenient method for resolving absolute paths relative to CWD
 *
 * @param {String} directory - Directory path
 * @returns {*|string} Resolved directory path
 */
const resolve = directory => path.join(__dirname, '../..', directory);
/**
 * A convenient method for joining the assets sub directory path with a given path
 *
 * @param {String} [pathToJoin] - The path to join with the assets sub directory
 * @returns {String} The joined path
 */
const extensionPath = (pathToJoin = '') => path.resolve(__dirname, config.extensionRoot, pathToJoin);
/**
 * Create loaders convenient method. Will generate a dictionary of loaders with extract
 *
 * @param {Object} options - Loader options
 * @returns {Object} Dictionary of loaders
 */
const createLoaders = (options) => {
  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: options.env === 'production',
      sourceMap: options.sourcemaps,
    },
  };

  /**
   * Generates the loader configuration with css as fallback loader
   *
   * @param {String} [loader] - Optional loader key. When empty it will return css loader
   * @param {Object} [loaderOptions] - Optional loader options
   * @returns {*} - Loader options
   */
  function generateLoaders(loader, loaderOptions) {
    const loaders = [cssLoader];
    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap,
        }),
      });
    }
    return ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: loaders,
    });
  }

  return {
    css: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus'),
  };
};
/**
 * Creates a style loader configuration collection for webpack. This method makes it possible
 * to support a wide variety of style pre-processors and languages like sass, stylus and less
 *
 * @param {Object} options - Style loader options
 * @returns {Array} Collection of style loader
 */
const createStyleLoaders = (options) => {
  const output = [];
  const loaders = createLoaders(options);
  const extensions = Object.keys(loaders);
  for (let i = 0, iLen = extensions.length; i < iLen; i += 1) {
    const extension = extensions[i];
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader,
    });
  }
  return output;
};
/**
 *
 * @param content
 * @param contentPath
 */
const transformEdgeAssets = (content, contentPath) => {
  if (contentPath.includes('AppxManifest.xml')) {
    return edge.replaceEdgeManifestValues(content);
  }
  if (contentPath.includes('messages.json')) {
    return edge.convertExtensionLocalesToResourceObjects(content);
  }
  return content;
};
/**
 * Creates a collection of webpack plugins for the build process depending on the current
 * active build configuration
 *
 * @param {Object} options - Plugin options
 * @param {JSON} options.apiMetaData - The API meta data for browser polyfill
 * @param {String} options.vendor - Target browser vendor
 * @param {String} options.vendorFullName - The full name of the browser vendor
 * @param {String} options.iamScriptUrl - Script URL for the INFOnline iam.js
 * @param {String} options.namespace - Target browser namespace
 * @param {Boolean} options.pack - Specifies if the extension should be packed
 * @param {String} options.version - The version of the extension
 * @returns {*}
 */
const createWebpackPlugins = (options) => {
  let basePlugins = [
    // clean the build folder
    new CleanWebpackPlugin(utils.extensionPath(), { allowExternal: true }),
    new webpack.DefinePlugin({
      API_META_DATA: options.apiMetaData,
      ENV: JSON.stringify(config.env),
      IAM_SCRIPT_URL: JSON.stringify(options.iamScriptUrl),
      NAMESPACE: JSON.stringify(options.namespace),
      VENDOR: JSON.stringify(options.vendor),
      VENDOR_FULL_NAME: JSON.stringify(options.vendorFullName),
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: 'styles/[name].css',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([{
      from: 'src/manifest.json',
    }, {
      from: 'src/_locales',
      to: '_locales',
    }, {
      from: 'src/images',
      to: 'images',
    }]),
    // Process popup html
    new HtmlWebpackPlugin({
      template: 'src/pages/popup.html',
      env: config.env,
      filename: 'pages/popup.html',
      chunks: ['popup', 'manifest'],
    }),
    new FriendlyErrorsWebpackPlugin(),
  ];
  // Extend base plugins with production build relevant
  // plugins
  if (config.env === 'production') {
    basePlugins = basePlugins.concat([
      // Compress js assets
      new MinifyJSPlugin(),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
    ]);
  }
  // Add additional plugins when vendor is edge
  if (options.vendor === 'edge') {
    const edgeAssetPath = path.resolve(__dirname, '../', 'assets/edge');
    // Push a copy plugin instance to the base plugins for transforming the static edge build assets
    basePlugins.push(new CopyWebpackPlugin([{
      from: edgeAssetPath,
      to: config.extensionRoot,
      transform: transformEdgeAssets,
    }]));
    // Push a copy plugin instance to the base plugins for transforming all locale messages in the
    // _locales folder to resources.resjson files
    basePlugins.push(new CopyWebpackPlugin([{
      from: 'src/_locales/**/messages.json',
      to: `${config.extensionRoot}/Resources/[folder]/resources.resjson`,
      transform: transformEdgeAssets,
    }]));
  }
  // Zip all assets when pack option is true
  if (options.pack) {
    basePlugins.push(new ZipPlugin({
      path: `packages/${options.vendor}`,
      filename: `IMAREX-${options.vendor}-${options.version}.zip`,
    }));
  }
  // Compress all assets when gzip is on
  if (config.gzip) {
    basePlugins.push(new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(`\\.(${config.gzipExtensions.join('|')})$`),
      threshold: 10240,
      minRatio: 0.8,
    }));
  }
  // Create a bundle analyzer report when build finishes
  if (config.report) {
    basePlugins.push(new BundleAnalyzerPlugin());
  }
  return basePlugins;
};
/**
 * Gets the full name of browser vendors
 *
 * @param {String} vendor - The vendor key
 * @returns {*}
 */
const multiVendorBrowserFull = vendor => VENDOR_BROWSER_FULL_NAMES[vendor];
/**
 * Gets the sourcemap type depending on target environment and active state of sourcemaps in
 * build configuration
 *
 * @returns {String|Boolean}
 */
const getSourcemapType = () => {
  if (config.sourcemaps) {
    if (config.env === 'production') {
      return '#source-map';
    }
    return '#inline-source-map';
  }
  return false;
};

// Public export
exports.createStyleLoaders = createStyleLoaders;
exports.extensionPath = extensionPath;
exports.resolve = resolve;
exports.createWebpackPlugins = createWebpackPlugins;
exports.multiVendorBrowserFull = multiVendorBrowserFull;
exports.getSourcemapType = getSourcemapType;
exports.transformEdgeAssets = transformEdgeAssets;
