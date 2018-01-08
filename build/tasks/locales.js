/* eslint-disable import/no-extraneous-dependencies */
/**
 * Web extension locales task. This file contains the locales task
 * for processing each locale file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp locales    # Will process the locale files for a vendor specific web extension
 */
import gulp from 'gulp';
import pump from 'pump';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

gulp.task('locales', next => pump([
  gulp.src(multiVendorPath(args.vendor, '_locales/**/*.json')),
  gulp.dest(`dist/${args.vendor}/_locales`),
], next));
