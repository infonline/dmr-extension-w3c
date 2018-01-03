/**
 * Web extension third party task. This file contains the third party task
 * for copying all third-party assets like fonts, styles or javascript
 * sources to the web extension directory
 *
 * You can use the commands:
 *
 * gulp thirdParty:styles    # Will process the vendor assets for a vendor specific web extension
 */
import gulp from 'gulp';
import pump from 'pump';
import args from '../lib/args';

const THIRD_PARTY_SOURCES = {
  styles: [
    'node_modules/material-components-web/dist/material-components-web.css',
  ],
  scripts: [],
  fonts: [],
};

gulp.task('thirdParty:styles', next => pump([
  gulp.src(THIRD_PARTY_SOURCES.styles),
  gulp.dest(`dist/${args.vendor}/styles`),
], next));

gulp.task('thirdParty:scripts', next => pump([
  gulp.src(THIRD_PARTY_SOURCES.scripts),
  gulp.dest(`dist/${args.vendor}/scripts`),
], next));

gulp.task('thirdParty:fonts', next => pump([
  gulp.src(THIRD_PARTY_SOURCES.fonts),
  gulp.dest(`dist/${args.vendor}/fonts`),
], next));

gulp.task('thirdParty', ['thirdParty:styles']);
