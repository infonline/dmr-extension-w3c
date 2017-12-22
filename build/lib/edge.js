import util from 'util';
import fs from 'fs';
import { PluginError } from 'gulp-util';
import through2 from 'through2';

const { promisify } = util;

/**
 * Mapping of permission keys to edge appx manifest capabilities
 *
 * @type {Object}
 */
const EDGE_CAPABILITIES_MAP = {
  '<any url>': 'websiteContent',
  '<all_urls>': 'websiteContent',
  cookies: 'websiteCookies',
  geolocation: 'geolocation',
  storage: 'browserStorage',
  tabs: 'websiteInfo',
  webNavigation: 'websiteInfo',
  webRequest: 'browserWebRequest',
};
/**
 * Filename of the edge appx manifest file
 *
 * @type {string}
 */
const EDGE_APP_MANIFEST_BASE_NAME = 'AppxManifest.xml';
/**
 * Extracts the permissions from the manifest file and will map them to the edge capabilities (XML).
 *
 * @param {Object} manifest - The manifest file of the edge web extension
 * @param {Array} manifest.permissions - The permissions collection of the web extension manifest
 * @return {String} XML capability collection as string
 */
const extractCapabilities = (manifest) => {
  const capabilities = {};
  // Map extension permissions to app capabilities
  for (let i = 0, iLen = manifest.permissions.length; i < iLen; i += 1) {
    const element = manifest.permissions[i];
    const mapKeys = Object.keys(EDGE_CAPABILITIES_MAP);
    if (mapKeys.includes(element)) {
      const mappedElement = EDGE_CAPABILITIES_MAP[element];
      capabilities[mappedElement] = true;
    }
    if (element.includes('://')) {
      capabilities.websiteContent = true;
    }
  }
  // Build capabilities xml
  const capKeys = Object.keys(capabilities);
  let capString = '';
  for (let i = 0, iLen = capKeys.length; i < iLen; i += 1) {
    const key = capKeys[i];
    capString += `<Capability Name="${key}"/>`;
    if (i < iLen - 1) {
      // Add correct test indentations
      capString += '\r\n\t\t\t\t\t\t\t\t';
    }
  }
  return capString;
};

/**
 * Extracts the version from web extension manifest and will pad it with 0's on the left if it
 * does not have 4 segments
 *
 * @param {Object} manifest - The manifest file of the edge web extension
 * @param {String} manifest.version - The version property of the  of the edge web extension
 *        manifest
 *
 * @return {String} Padded web extension version
 */
const extractExtensionVersion = (manifest) => {
  const versionParts = manifest.version.split('.');
  while (versionParts.length < 4) {
    versionParts.push('0');
  }
  return versionParts.slice(0, 4).join('.');
};

/**
 *
 * @param manifest
 * @param file
 * @param next
 */
const replaceValues = (manifest, file, next) => {
  try {
    if (file.isNull()) {
      return next(null, file);
    }

    if (file.isStream()) {
      throw new PluginError('edge-packaging', 'Streaming is not supported.');
    }
    const capabilities = extractCapabilities(manifest);
    const version = extractExtensionVersion(manifest);
    const appManifestContent = file.contents.toString();
    // eslint-disable-next-line no-param-reassign
    file.contents = Buffer.from(appManifestContent
      .replace(/{displayName}/g, manifest.name)
      .replace(/{version}/g, version)
      .replace(/{description}/g, manifest.description)
      .replace(/{capabilities}/g, capabilities), 'utf-8');
    return next(null, file);
  } catch (err) {
    throw err;
  }
};

/**
 * Replaces the edge manifest values in the appx template with the specific
 * values from the web extension manifest file.
 *
 * @param manifestPath - Path to web extension manifest file
 * @return {Stream} - The vinyl file stream
 */
const replaceEdgeManifestValues = (manifestPath) => {
  /**
   * Parses and converts the web extension manifest file and will initiate the processing
   * of the edge specific appx manifest.
   *
   * @param {Object} file - The vinyl file meta data
   * @param {String} encoding - Encoding of the file
   * @param {Function} next - Callback
   */
  const transform = async (file, encoding, next) => {
    try {
      if (file.relative === EDGE_APP_MANIFEST_BASE_NAME) {
        const readFileAsync = promisify(fs.readFile);
        const manifestContent = await readFileAsync(manifestPath, { encoding: 'utf8' });
        const manifest = JSON.parse(manifestContent);
        return replaceValues(manifest, file, next);
      }
      return next(null, file);
    } catch (err) {
      return this.emit('error', new PluginError('edge-manifest-replace', err, { fileName: file.path }));
    }
  };
  return through2.obj(transform);
};

export default replaceEdgeManifestValues;
