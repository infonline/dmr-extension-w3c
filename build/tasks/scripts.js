import gulp from 'gulp';
import gulpif from 'gulp-if';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import pump from 'pump';
import args from '../lib/args';
import { multiVendorPath } from '../lib/vendors';

gulp.task('scripts', next => pump([
  gulp.src(multiVendorPath(args.vendor, 'scripts/**/*.js')),
  gulpif(args.sourcemaps, sourcemaps.init()),
  babel(),
  gulpif(args.production, uglify()),
  gulpif(args.sourcemaps, sourcemaps.write()),
  gulp.dest(`dist/${args.vendor}/scripts`),
], next));
