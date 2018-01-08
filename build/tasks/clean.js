/* eslint-disable import/no-extraneous-dependencies */
import gulp from 'gulp';
import del from 'del';
import args from '../lib/args';

gulp.task('clean', () => del([`dist/${args.vendor}/**/*`, '.temp']));
