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
import conventionalChangelog from 'gulp-conventional-changelog';
import pump from 'pump';
import tagVersion from 'gulp-tag-version';
import packageDetails from '../../package.json';

/**
 * Increments the version of the whole repository by incrementing the versions in
 * package.json and manifest.json up to the desired importance (see above illustration)
 *
 * @param {String} importance - Patch, minor, or major
 * @param {Function} next - Callback
 */
const increment = (importance, next) => {
  const newVersion = semver.inc(packageDetails.version, importance);
  return pump([
    // Get all the files to bump version in
    gulp.src(['package.json', 'src/shared/manifest.json'], { base: './' }),
    // Bump the version number in those files
    bump({ type: importance }),
    // Save it back to filesystem
    gulp.dest('./'),
    // Get changelog for generating the change log
    gulp.src('CHANGELOG.md', { base: './' }),
    // Commit the changed version number
    git.commit(`chore(release): v${newVersion}`),
    // Write conventional change log
    conventionalChangelog({ preset: 'angular' }),
    // Save it back to filesystem
    gulp.dest('./'),
    // Read only one file to get the version number
    filter('package.json'),
    // Tag it in the repository
    tagVersion(),
  ], next);
};
gulp.task('bump:patch', next => increment('patch', next));
gulp.task('bump:minor', next => increment('minor', next));
gulp.task('bump:major', next => increment('major', next));
