/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const mkdirp = require('mkdirp');
const archiver = require('archiver');
const path = require('path');
const chalk = require('chalk');
const del = require('del');

const { warn } = console;

const ARCHIVE_OPTIONS = {
  zlib: {
    level: 9,
  },
};
/**
 * Packs the build artifacts from a specific extension to a specific archive and will save it to
 * a specified output path.
 *
 * @param {Object} options
 * @returns {Promise<any>}
 */
const pack = options => new Promise((resolve, reject) => {
  try {
    // Create a output path
    const outputPath = path.join(__dirname, '../../packages', options.vendor);
    // Create a input path
    const inputPath = path.join(__dirname, '../../dist', options.vendor);
    // Ensure the output path exists
    mkdirp.sync(outputPath);
    // Delete contents in the output path
    del.sync(`${outputPath}/*`);
    // Create a writable stream to the output path
    const outputStream = fs.createWriteStream(path.join(outputPath, options.filename));
    // Resolve promise when output stream is ended
    outputStream.on('finish', resolve);
    // Create archive instance
    const archive = archiver(options.format, ARCHIVE_OPTIONS);
    // It's a good practice to catch warning for stat failures and another non blocking errors so we
    // bind a listener to the warning event emitted from node js stream module
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        warn(chalk.yellow(err.code, err.message));
      } else {
        reject(err);
      }
    });
    // It's a good practice to catch this error explicitly
    archive.on('error', err => reject(err));
    // Pipe archive data to the file
    archive.pipe(outputStream);
    // Add all files from input path to the root of the archive
    archive.directory(inputPath, false);
    // Finalize archive
    archive.finalize();
  } catch (err) {
    reject(err);
  }
});

module.exports = pack;
