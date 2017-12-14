/**
 * Web extension locales task. This file contains the locales task
 * for processing each locale file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp locales    # Will process the locale files for a vendor specific web extension
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import pump from 'pump';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('locales', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'locales/**/*.json')),
  gulp.dest(`dist/${args.vendor}/locales`),
  gulpif(args.watch, browserSync.reload),
], next));
