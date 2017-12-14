/**
 * Web extension fonts task. This file contains the fonts task
 * for processing each font file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp fonts    # Will process the font files for a vendor specific web extension
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import pump from 'pump';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('fonts', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'fonts/**/*.{woff,woff2,ttf,eot,svg}')),
  gulp.dest(`dist/${args.vendor}/fonts`),
  gulpif(args.watch, browserSync.reload),
], next));
