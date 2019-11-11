import Bowser from 'bowser/src/bowser';
import { DEFAULT_DMR_WEB_APP_URL, ENVIRONMENT } from '../constants';

/**
 * Logs messages to browser console if environment is development
 *
 * @param {String} type - Message type (error, warn or info)
 * @param {Array.<*> | String} args - Log arguments like messages.
 */
export const log = (type, ...args) => {
  if (ENVIRONMENT === 'development') {
    // eslint-disable-next-line no-console
    console[type](...args);
  }
};
/**
 * RFC4122 compliant UUID v4 generator. Will be needed for creating
 * unique and unambiguous identifications for users and ports. Uses the
 * window crypto api to make it secure at the cost of just a few bytes
 * by replacing Math.random() with getRandomValues(). For browser
 * compliant please refer to https://caniuse.com/#search=crypto
 *
 * @return {String} RFC4122 compliant UUID v4
 */
export const uuidv4 = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
// eslint-disable-next-line no-bitwise,no-mixed-operators
  .replace(/[018]/g, c => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
/**
 * Sets the uninstall url for the extension
 *
 * @param {String} userId - User identifier
 * @param provider - Provider name
 */
export const setUninstallUrl = (userId, provider) => {
  if (provider) {
    browser.runtime
      .setUninstallURL(`${DEFAULT_DMR_WEB_APP_URL}/remove?&userId=${encodeURIComponent(userId)}&provider=${encodeURIComponent(provider)}`);
  }
};
/**
 * Gets the current browser vendor name via extension api or when not available via user agent parser.
 *
 * @return {String} - Lower cased name of the browser
 */
export const getCurrentVendor = async () => {
  let name = '';
  // Use default extension functionality when available
  if (typeof browser.runtime.getBrowserInfo === 'function') {
    // eslint-disable-next-line prefer-destructuring
    name = await browser.runtime.getBrowserInfo().name;
  } else {
    // Use user agent parser to determine browser name
    const parser = Bowser.getParser(window.navigator.userAgent);
    // eslint-disable-next-line prefer-destructuring
    name = parser.getBrowser().name;
  }
  // Return name always with low cases
  return name.toLowerCase();
};
