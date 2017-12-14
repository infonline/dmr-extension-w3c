/**
 * Web extension manifest task. This file contains the manifest task
 * for processing each manifest file of a vendor specific web extension
 *
 * You can use the commands:
 *
 * gulp manifest    # Will process the manifest file for a vendor specific web extension
 */
import gulp from 'gulp';
import gulpif from 'gulp-if';
import jsonTransform from 'gulp-json-transform';
import merge from 'gulp-merge-json';
import pump from 'pump';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { applyBrowserPrefixesFor, multiVendorPath } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('manifest', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'manifest.json')),
  merge({ fileName: 'manifest.json' }),
  jsonTransform(
    applyBrowserPrefixesFor(args.vendor),
    2,
  ),
  gulp.dest(`dist/${args.vendor}`),
  gulpif(args.watch, browserSync.reload()),
], next));
