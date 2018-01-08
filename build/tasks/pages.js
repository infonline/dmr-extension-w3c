/* eslint-disable import/no-extraneous-dependencies */
/**
 * Web extension locales task. This file contains the pages task
 * for processing each html file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp pages    # Will process the html files for a vendor specific web extension
 */
import gulp from 'gulp';
import pump from 'pump';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

gulp.task('pages', next => pump([
  gulp.src(multiVendorPath(args.vendor, '/pages/**/*.html')),
  gulp.dest(`dist/${args.vendor}/pages`),
], next));
