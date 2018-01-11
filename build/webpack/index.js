/* eslint-disable import/no-extraneous-dependencies */
const args = require('../lib/args');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./base');
const utils = require('../lib/utils');
const pkg = require('../../package.json');

const apiMetaData = JSON.stringify(fs.readFileSync(path.join(__dirname, '../assets/shared/apiMetaData.json'), 'utf8'));
const iamScriptUrl = args.scriptUri;
const namespace = args.vendor === 'chrome' || args.vendor === 'opera' ? 'chrome' : 'browser';
const { vendor, pack } = args;
const vendorFullName = utils.multiVendorBrowserFull(args.vendor);
const { version } = pkg;

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.createStyleLoaders({ sourcemaps: config.sourcemaps, env: args.env }),
  },
  devtool: utils.getSourcemapType(),
  plugins: utils.createWebpackPlugins({
    apiMetaData,
    iamScriptUrl,
    namespace,
    pack,
    vendor,
    vendorFullName,
    version,
  }),
});
