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
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

gulp.task('images', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'images/**/*')),
  gulpif(args.production, imagemin()),
  gulp.dest(`dist/${args.vendor}/images`),
], next));
