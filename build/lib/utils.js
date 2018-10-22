/* eslint-disable import/no-extraneous-dependencies */
/**
 * This module contains all build related shared functions and logic
 */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fsPromise = require('fs').promises;
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const safeParser = require('postcss-safe-parser');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');
const args = require('./args');
const edge = require('./edge');
const config = require('../config');

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
    return [MiniCssExtractPlugin.loader, ...loaders];
  }

  return {
    css: generateLoaders(),
    less: generateLoaders('less'),
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
    new CleanWebpackPlugin(extensionPath(), {
      allowExternal: true,
      verbose: args.verbose,
    }),
    new webpack.DefinePlugin({
      API_META_DATA: options.apiMetaData,
      ENV: JSON.stringify(config.env),
      IAM_SCRIPT_URL: JSON.stringify(options.iamScriptUrl),
      IAM_PANEL_EXCHANGE_URL: JSON.stringify(options.iamPanelExchangeUrl),
      NAMESPACE: JSON.stringify(options.namespace),
      VENDOR: JSON.stringify(options.vendor),
      VENDOR_FULL_NAME: JSON.stringify(options.vendorFullName),
      IMAREX_VERSION: JSON.stringify(options.version),
      IMAREX_LICENSES: options.licenses,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: args.env === 'development' ? 'styles/popup.css' : 'styles/popup.css',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([{
      from: 'src/w3c/manifest.json',
      transform: (content) => {
        // The edge browser the persistent property in the background configuration is mandatory
        // for the other browser it's not. So we have to transform the manifest.json in the copy
        // process.
        if (options.vendor === 'edge') {
          const manifest = JSON.parse(content.toString());
          manifest.background.persistent = true;
          return JSON.stringify(manifest);
        }
        return content.toString();
      },
    }, {
      from: 'src/w3c/_locales',
      to: '_locales',
    }, {
      from: 'src/w3c/images',
      to: 'images',
    }, {
      from: 'src/w3c/popup/popup.html',
      to: 'popup',
    }]),
    new FriendlyErrorsWebpackPlugin(),
    new VueLoaderPlugin(),
  ];
  // Extend base plugins with production build relevant
  // plugins
  if (config.env === 'production') {
    basePlugins = basePlugins.concat([
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
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
      from: 'src/w3c/_locales/**/messages.json',
      to: `${config.extensionRoot}/Resources/[folder]/resources.resjson`,
      transform: transformEdgeAssets,
    }]));
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
      return 'source-map';
    }
    return 'inline-source-map';
  }
  return false;
};

/**
 * Copies files async from target to source
 *
 * @param {String} source - Source path
 * @param {String} target - Target path
 * @returns {Promise<void | * | undefined>}
 */
const copyFiles = async (source, target) => {
  try {
    let targetFile = target;
    try {
      await fsPromise.lstat(target);
    } catch (err) {
      await fsPromise.mkdir(target);
    }
    const stats = await fsPromise.lstat(target);
    if (stats && stats.isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
    const sourceFile = await fsPromise.readFile(source);
    return fsPromise.writeFile(targetFile, sourceFile);
  } catch (err) {
    throw err;
  }
};
/**
 * Copies folder and their content async and recursively from a given target to a given source
 *
 * @param {String} source - Source path
 * @param {String} target - Target path
 * @returns {Promise<*>}
 */
const copyFolderRecursive = async (source, target) => {
  try {
    const targetFolder = path.join(target, path.basename(source));
    // Check if target folder exists. When not create target folder
    try {
      await fsPromise.lstat(target);
    } catch (err) {
      await fsPromise.mkdir(target);
    }
    // Try to copy
    const sourceStats = await fsPromise.lstat(source);
    if (sourceStats && sourceStats.isDirectory()) {
      const files = await fsPromise.readdir(source);
      return files.forEach(async (file) => {
        const currentSource = path.join(source, file);
        const currentSourceStats = await fsPromise.lstat(currentSource);
        if (currentSourceStats && currentSourceStats.isDirectory()) {
          return copyFolderRecursive(currentSource, targetFolder);
        }
        return copyFiles(currentSource, targetFolder);
      });
    }
    throw new Error(`Source ${source} does not exits`);
  } catch (err) {
    throw err;
  }
};

// Public export
exports.createStyleLoaders = createStyleLoaders;
exports.extensionPath = extensionPath;
exports.resolve = resolve;
exports.createWebpackPlugins = createWebpackPlugins;
exports.multiVendorBrowserFull = multiVendorBrowserFull;
exports.getSourcemapType = getSourcemapType;
exports.transformEdgeAssets = transformEdgeAssets;
exports.copyFolderRecursive = copyFolderRecursive;
exports.copyFiles = copyFiles;
