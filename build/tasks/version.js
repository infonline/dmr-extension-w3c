/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
import gulp from 'gulp';
import git from 'gulp-git';
import bump from 'gulp-bump';
import filter from 'gulp-filter';
import semver from 'semver';
import tagVersion from 'gulp-tag-version';
import packageDetails from '../../package.json';

/**
 * Increments the version of the whole repository by incrementing the versions in
 * package.json and manifest.json up to the desired importance (see above illustration)
 *
 * @param {String} importance - Patch, minor, or major
 */
const increment = (importance) => {
  const newVersion = semver.inc(packageDetails.version, importance);
  // get all the files to bump version in
  gulp.src([
    'package.json',
    'src/**/manifest.json',
  ], {
    base: './',
  })
    // Bump the version number in those files
    .pipe(bump({
      type: importance,
    }))
    // Save it back to filesystem
    .pipe(gulp.dest('./'))
    // Commit the changed version number
    .pipe(git.commit(`chore(release): ${newVersion}`))
    // Read only one file to get the version number
    .pipe(filter('package.json'))
    // Tag it in the repository
    .pipe(tagVersion());
};
gulp.task('bump:patch', () => increment('patch'));
gulp.task('bump:minor', () => increment('minor'));
gulp.task('bump:major', () => increment('major'));
