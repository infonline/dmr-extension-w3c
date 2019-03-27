/* globals NAMESPACE, VENDOR, API_META_DATA */
import polyfill from './polyfill';

const namespace = NAMESPACE;
const vendor = VENDOR;
const apiMetaData = JSON.parse(API_META_DATA);
/**
 * The browser driver.
 *
 * For chrome and opera the NAMESPACE is always chrome and gets polyfilled because
 * they rely on the same engine. For edge and firefox it's the global browser object.
 * But only edge get's polyfilled because it relies on chrome callbacks.
 *
 * The polyfill will promisify the web extension api of browser runtime to use the same
 * behaviour as for firefox. This allows to write one code for all 4 browsers who implements
 * the W3C specification of web extensions.
 *
 * Shame on google and microsoft to use callbacks instead of promises and don't rely on mozilla's
 * web extension api to make this step necessary.
 *
 * @return {*} - Polyfilled browser runtime
 */
const createDriver = () => {
  if (namespace === 'chrome') {
    // Promisify chrome api via polyfill
    return polyfill(global.chrome, apiMetaData);
  }
  if (namespace === 'browser' && vendor === 'edge') {
    // Promisify edge api via polyfill
    return polyfill(global.browser, apiMetaData);
  }
  // No polyfill for firefox browser
  return global.browser;
};

// eslint-disable-next-line import/prefer-default-export
export const driver = createDriver();
