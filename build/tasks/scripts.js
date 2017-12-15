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
/**
 * Webpack configuration
 * @type {Object}
 */
const config = {
  devtool: args.sourcemaps ? 'inline-source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
      'process.env.VENDOR': JSON.stringify(args.vendor),
    }),
  ],
  module: {
    rules: [{
      parser: {
        amd: false,
      },
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: args.production ? ['minify'] : [],
      },
    }],
  },
  watch: args.watch,
};

gulp.task('scripts', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'scripts/**/*.js')),
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
  // Replace template strings in all scripts when found with these variables
  template({ vendor: args.vendor, ENV, IAM_SCRIPT_URL }),
  gulp.dest(`dist/${args.vendor}/scripts`),
], next));
