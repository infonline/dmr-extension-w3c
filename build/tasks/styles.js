/* eslint-disable import/no-extraneous-dependencies */
/**
 * Processing styles for all web extensions.
 *
 * You can use the commands
 *
 * gulp styles        # Process all styles and style file types
 * gulp styles:css    # Process only css based styles
 * gulp styles:less   # Process only less based styles
 * gulp styles:scss   # Process only sass based styles
 *
 * to process the stylesheets for all web extensions. The output
 * will be transferred to /dist folder
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import less from 'gulp-less';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import pump from 'pump';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

gulp.task('styles:css', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'styles/*.css')),
  gulpif(args.sourcemaps, sourcemaps.init()),
  gulpif(args.production, cleanCSS()),
  gulpif(args.sourcemaps, sourcemaps.write()),
  gulp.dest(`dist/${args.vendor}/styles`),
], next));

gulp.task('styles:less', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'styles/*.less')),
  gulpif(args.sourcemaps, sourcemaps.init()),
  less({ paths: ['./src'] }),
  gulpif(args.production, cleanCSS()),
  gulpif(args.sourcemaps, sourcemaps.write()),
  gulp.dest(`dist/${args.vendor}/styles`),
], next));

gulp.task('styles:sass', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'styles/*.scss')),
  gulpif(args.sourcemaps, sourcemaps.init()),
  sass({ includePaths: ['./src'] }),
  gulpif(args.production, cleanCSS()),
  gulpif(args.sourcemaps, sourcemaps.write()),
  gulp.dest(`dist/${args.vendor}/styles`),
], next));

gulp.task('styles', [
  'styles:css',
  'styles:less',
  'styles:sass',
]);
