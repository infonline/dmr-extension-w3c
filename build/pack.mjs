/* eslint-disable import/no-extraneous-dependencies */
import archiver from 'archiver';
import del from 'del';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import pkg from '../package.json';

const { version } = pkg;

const BROWSERS = [
  {
    name: 'chrome',
    extension: 'zip',
  }, {
    name: 'edge',
    extension: 'zip',
  }, {
    name: 'firefox',
    extension: 'zip',
  }, {
    name: 'opera',
    extension: 'zip',
  },
];

/**
 /**
 * Packs the extension by provided browser
 *
 * @param {Object} browser - The browser which will hold the packaging instructions
 * @return {Promise<any>} Promise
 */
const pack = browser => new Promise((resolve, reject) => {
  try {
    // current directory
    const dirname = path.dirname(import.meta.url.slice(7, import.meta.url.length));
    // Define input path
    const inputPath = path.join(dirname, '..', 'dist', 'bundle');
    // Define a versioned output path
    const outputPathVersioned = path.join(dirname, '..', 'dist', 'packages', browser.name, `DMR-${version}.${browser.extension}`);
    const outputPathLatest = path.join(dirname, '..', 'dist', 'packages', browser.name, `DMR-latest.${browser.extension}`);
    // Create output directory
    fs.mkdirSync(path.dirname(outputPathVersioned), { recursive: true });
    // Recopy all content before start archiving
    del.sync(`${path.dirname(outputPathVersioned)}/*`);
    // Create output stream
    const outputStream = fs.createWriteStream(outputPathVersioned);
    // Resolve promise when output stream is ended
    outputStream.on('finish', () => {
      fsPromises
        .copyFile(outputPathVersioned, outputPathLatest)
        .then(() => resolve())
        .catch(error => reject(error));
    });
    // Create new archive instance
    const archive = archiver('zip', { zlib: { level: 9 } });
    // It's a good practice to catch warning for stat failures and another non blocking errors so we
    // bind a listener to the warning event emitted from node js stream module
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(err.code, err.message);
      } else {
        reject(err);
      }
    });
    // good practice to catch this error explicitly
    archive.on('error', error => reject(error));
    // pipe archive data to the file
    archive.pipe(outputStream);
    // Add bundle directory to archive
    archive.directory(inputPath, false);
    // Finalize archive
    archive.finalize();
  } catch (error) {
    reject(error);
  }
});

// Start packaging
Promise
  .all(BROWSERS.map(BROWSER => pack(BROWSER)))
  .then(() => {
    console.info('\nPackaging was successful...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
