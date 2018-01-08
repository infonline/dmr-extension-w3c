/* eslint-disable import/no-extraneous-dependencies */
/**
 * Web extension packaging task. This file contains the packaging task
 * for taking a build web extension an pack them into the desired packaging
 * file.
 *
 * You can use the commands:
 *
 * gulp pack    # Will pack the build vendor specific web extension into a package file
 */
import gulp from 'gulp';
import zip from 'gulp-zip';
import pump from 'pump';
import packageDetails from '../../package.json';
import args from '../lib/args';
import { getPackageFileType } from '../lib/vendors';
import edgeManifestReplace from '../lib/edge';

gulp.task('pack', ['build'], (next) => {
  const { name, version } = packageDetails;
  const fileType = getPackageFileType(args.vendor);
  const filename = `${name}-${version}-${args.vendor}${fileType}`;
  if (args.vendor === 'edge') {
    return pump([
      gulp.src('build/assets/edge/**/*'),
      edgeManifestReplace('dist/edge/manifest.json'),
      gulp.dest('.temp'),
    ], pump([
      gulp.src('dist/edge/**/*'),
      gulp.dest('.temp/Extension'),
    ]), pump([
      gulp.src('.temp/**/*'),
      zip(filename),
      gulp.dest('./packages'),
    ], next));
  }
  return pump([
    gulp.src(`dist/${args.vendor}/**/*`),
    zip(filename),
    gulp.dest('./packages'),
  ], next);
});
