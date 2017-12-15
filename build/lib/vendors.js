/**
 * This module contains shared vendor methods to allow a universal web extension
 * build process
 */
/**
 * Vendor browser name mapping
 * @type {Object}
 */
const VENDOR_BROWSER_NAMES = {
  chrome: 'Google Chrome',
  edge: 'microsoft-edge',
  firefox: 'firefox',
  opera: 'opera',
};
/**
 * Converts and removes keys with a browser prefix to the key without prefix
 *
 * Example:
 *
 *    __chrome__keyName
 *    __firefox__keyName
 *    __opera__keyName
 *
 * to `keyName`. This way we can write one manifest that is valid for all browsers
 *
 * @param vendor
 * @return {Function} - The iterator function with the manifest file as object
 */
export const applyBrowserPrefixesFor = vendor => function iterator(source) {
  const obj = source;
  const keys = Object.keys(obj);
  for (let i = 0, iLen = keys.length; i < iLen; i += 1) {
    const key = keys[i];
    const match = key.match(/^__(chrome|edge|firefox|opera)__(.*)/);
    if (match) {
      // Swap key with non prefixed name.
      if (match[1] === vendor) {
        obj[match[2]] = obj[key];
      }

      // Remove the prefixed key.
      // So it won't cause warnings.
      delete obj[key];
    } else if (typeof (obj[key]) === 'object') {
      // No match? Try deeper iterations.
      // Recurse over object's inner keys.
      iterator(obj[key]);
    }
  }
  return obj;
};

/**
 * Makes it possible to jump into a vendor prefixed path in gulp tasks
 *
 * @param vendor - The vendor string
 * @param path - The relative path of the gulp sources
 * @return {string[]} - Array of paths
 */
export const multiVendorPath = (vendor, path) => [`src/${vendor}/${path}`, `src/shared/${path}`];
/**
 * Determines the right browser name for browser sync options
 *
 * @param {String} vendor - The vendor
 * @return {*}
 */
export const multiVendorBrowser = vendor => VENDOR_BROWSER_NAMES[vendor];
/**
 * Returns the file type of the package considering the vendor
 *
 * @param {String} vendor - The vendor
 * @return {string} File type
 */
export const getPackageFileType = (vendor) => {
  if (vendor === 'firefox') {
    return '.xpi';
  } else if (vendor === 'chrome') {
    return '.crx';
  }
  return '.zip';
};
