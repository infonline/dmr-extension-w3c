// eslint-disable-next-line import/no-extraneous-dependencies
import archiver from 'archiver';
import fs, { promises as fsPromises } from 'fs';
import path from 'path';
import { version } from '../package.json';

const BROWSERS = [
  {
    name: 'chrome',
    extension: 'crx',
  }, {
    name: 'edge',
    extension: 'crx',
  }, {
    name: 'firefox',
    extension: 'zip',
  }, {
    name: 'opera',
    extension: 'crx',
  },
];
// Create a archived package from the bundled extension source for each browser vendor
BROWSERS.forEach(async (BROWSER) => {
  // Define input path
  const inputPath = path.join(import.meta.url, '..', 'dist', 'bundle');
  // Define a versioned output path
  const outputPathVersioned = path.join(import.meta.url, '..', 'dist', 'packages', BROWSER.name, `DRM-${version}.${BROWSER.extension}`);
  // Define a latest output path
  const outputPathLatest = path.join(import.meta.url, '..', 'dist', 'packages', BROWSER.name, `DRM-latest.${BROWSER.extension}`);
  // Create output directory
  await fsPromises.mkdir(path.dirname(outputPathVersioned), { recursive: true });
  // Create output stream
  const outputStream = fs.createWriteStream(outputPathVersioned);
  // Create a listener for the end event of nodejs stream api and copy the result to a latest file
  outputStream.on('end', async () => {
    await fsPromises.copyFile(outputPathVersioned, outputPathLatest);
  });
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
});
