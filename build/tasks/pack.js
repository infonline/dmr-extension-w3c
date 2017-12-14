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
import { colors, log } from 'gulp-util';
import zip from 'gulp-zip';
import pump from 'pump';
import packageDetails from '../../package.json';
import args from '../lib/args';
import { getPackageFileType } from '../lib/vendors';

gulp.task('pack', ['build'], (next) => {
  const { name, version } = packageDetails;
  const fileType = getPackageFileType(args.vendor);
  const filename = `${name}-${version}-${args.vendor}${fileType}`;
  const distStyled = colors.green(`dist/${args.vendor}`);
  const filenameStyled = colors.gree(`./packages/${filename}`);
  return pump([
    gulp.src(`dist/${args.vendor}/**/*`),
    zip(filename),
    gulp.dest('./packages'),
    log(`Created web extension package ${distStyled} to ${filenameStyled}`),
  ], next);
});
