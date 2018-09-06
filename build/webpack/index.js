/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const args = require('../lib/args');
const config = require('../config');
const baseWebpackConfig = require('./w3c');
const utils = require('../lib/utils');
const pkg = require('../../package.json');

const apiMetaData = JSON
  .stringify(fs.readFileSync(path.join(__dirname, '../assets/shared/apiMetaData.json'), 'utf8'));
const licenses = JSON
  .stringify(fs.readFileSync(path.join(__dirname, '../assets/shared/licenses.json'), 'utf8'));
const iamScriptUrl = args.scriptUri;
const iamPanelExchangeUrl = args.env === 'production'
  ? args.panelExchangeUri : 'http://localhost:8080';
const namespace = args.vendor === 'chrome' || args.vendor === 'opera' ? 'chrome' : 'browser';
const { vendor, pack } = args;
const vendorFullName = utils.multiVendorBrowserFull(args.vendor);
const { version, description } = pkg;

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.createStyleLoaders({ sourcemaps: config.sourcemaps, env: args.env }),
  },
  devtool: utils.getSourcemapType(),
  plugins: utils.createWebpackPlugins({
    apiMetaData,
    iamScriptUrl,
    iamPanelExchangeUrl,
    namespace,
    pack,
    vendor,
    vendorFullName,
    version,
    description,
    licenses,
  }),
});
