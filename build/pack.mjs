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
 * Packs the extension by provided browser
 *
 * @param {Object} browser - The browser which will hold the packaging instructions
 * @return {Promise<void>} Void
 */
const pack = async (browser) => {
  try {
    // current directory
    const dirname = path.dirname(import.meta.url.slice(7, import.meta.url.length));
    // Define input path
    const inputPath = path.join(dirname, '..', 'dist', 'bundle');
    // Define a versioned output path
    const outputPathVersioned = path.join(dirname, '..', 'dist', 'packages', browser.name, `DMR-${version}.${browser.extension}`);
    // Create output directory
    await fsPromises.mkdir(path.dirname(outputPathVersioned), { recursive: true });
    // Recopy all content before start archiving
    await del(`${path.dirname(outputPathVersioned)}/*`);
    // Create output stream
    const outputStream = fs.createWriteStream(outputPathVersioned);
    // Create new archive instance
    const archive = archiver('zip', { zlib: { level: 9 } });
    // good practice to catch this error explicitly
    archive.on('error', (err) => {
      throw err;
    });
    // pipe archive data to the file
    archive.pipe(outputStream);
    // Add bundle directory to archive
    archive.directory(inputPath, false);
    // Finalize archive
    archive.finalize();
  } catch (error) {
    throw error;
  }
};

/**
 * Makes a "latest" copy of the packed extension
 *
 * @param {Object} browser - The browser which will hold the packaging instructions
 * @return {Promise<void>} Void
 */
const copy = async (browser) => {
  try {
    // current directory
    const dirname = path.dirname(import.meta.url.slice(7, import.meta.url.length));
    // Define a versioned output path
    const outputPathVersioned = path.join(dirname, '..', 'dist', 'packages', browser.name, `DMR-${version}.${browser.extension}`);
    // Define a latest output path
    const outputPathLatest = path.join(dirname, '..', 'dist', 'packages', browser.name, `DMR-latest.${browser.extension}`);
    return fsPromises.copyFile(outputPathVersioned, outputPathLatest);
  } catch (error) {
    throw error;
  }
};

// Start packaging
Promise
  .all(BROWSERS.map(BROWSER => pack(BROWSER)))
  .then(() => Promise.all(BROWSERS.map(BROWSER => copy(BROWSER))))
  .then(() => {
    console.info('\nPackaging was successful...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
