/**
 * Web extension images task. This file contains the images task
 * for processing each image file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp images    # Will process the image files for a vendor specific web extension
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import pump from 'pump';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('images', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'images/**/*.{jpg|png}')),
  gulpif(args.production, imagemin()),
  gulp.dest(`dist/${args.vendor}`),
  gulpif(args.watch, browserSync.reload()),
], next));
