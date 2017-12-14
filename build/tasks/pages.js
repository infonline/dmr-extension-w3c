/**
 * Web extension locales task. This file contains the pages task
 * for processing each html file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp pages    # Will process the html files for a vendor specific web extension
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import pump from 'pump';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('pages', next => pump([
  gulp.src(multiVendorPath(args.vendor, '/pages/**/*.html')),
  gulp.dest(gulp.dest(`dist/${args.vendor}`)),
  gulpif(args.watch, browserSync.reload()),
], next));
