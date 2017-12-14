import gulp from 'gulp';
import { colors, log } from 'gulp-util';
import BrowserSync from 'browser-sync';
import args from '../lib/args';
import { multiVendorPath, multiVendorBrowser } from '../lib/vendors';

const browserSync = BrowserSync.create();

gulp.task('watch', (next) => {
  // This task runs only if the
  // watch argument is present!
  if (!args.watch) {
    return next();
  }
  // Initialize browser sync
  browserSync.init({
    browser: multiVendorBrowser(args.vendor),
    server: './demo',
  });
  log('Starting', colors.cyan('\'browser sync\''));
  gulp.watch(multiVendorPath(args.vendor, 'manifest.json'), ['manifest']);
  gulp.watch(multiVendorPath(args.vendor, 'scripts/**/*.js'), ['styles:css']);
  gulp.watch(multiVendorPath(args.vendor, 'styles/**/*.css'), ['styles:css']);
  gulp.watch(multiVendorPath(args.vendor, 'styles/**/*.less'), ['styles:less']);
  gulp.watch(multiVendorPath(args.vendor, 'styles/**/*.scss'), ['styles:sass']);
  gulp.watch(multiVendorPath(args.vendor, 'pages/**/*.html'), ['pages']);
  gulp.watch(multiVendorPath(args.vendor, 'locales/**/*'), ['locales']);
  gulp.watch(multiVendorPath(args.vendor, 'images/**/*'), ['images']);
  gulp.watch(multiVendorPath(args.vendor, 'fonts/**/*.{woff,ttf,eot,svg}'), ['fonts']);
  return next();
});

