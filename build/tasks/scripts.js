import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import pump from 'pump';
import template from 'gulp-template';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

const ENV = args.production ? 'production' : 'development';
const IAM_SCRIPT_URL = args.scriptUri;
const VENDOR = args.vendor;
const NAMESPACE = VENDOR === 'chrome' || VENDOR === 'opera' ? 'chrome' : 'browser';
const API_META_DATA = fs.readFileSync(path.join(__dirname, '../assets/shared/apiMetaData.json'), 'utf8');
/**
 * Webpack configuration
 * @type {Object}
 */
const config = {
  devtool: args.sourcemaps ? 'inline-source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
      'process.env.VENDOR': JSON.stringify(VENDOR),
      'process.env.NAMESPACE': JSON.stringify(NAMESPACE),
    }),
  ],
  module: {
    rules: [{
      parser: {
        amd: false,
      },
    }],
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: args.production ? ['minify'] : [],
      },
    }],
  },
};

gulp.task('scripts:template', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'scripts/**/*.js')),
  template({
    ENV,
    IAM_SCRIPT_URL,
    NAMESPACE,
    VENDOR,
    API_META_DATA,
  }, {
    interpolate: /<%=([\s\S]+?)%>/g,
  }),
  gulp.dest(`dist/${args.vendor}/scripts`),
], next));

gulp.task('scripts', ['scripts:template'], next => pump([
  gulp.src(`dist/${args.vendor}/scripts/**/*.js`),
  // Replace template strings in all scripts when found with these variables
  named(),
  gulpWebpack(config, webpack, (err, stats) => {
    if (err) {
      return;
    }
    log(`Finished '${colors.cyan('scripts')}'`, stats.toString({
      chunks: false,
      colors: true,
      cached: false,
      children: false,
    }));
  }),
  gulp.dest(`dist/${args.vendor}/scripts`),
], next));
