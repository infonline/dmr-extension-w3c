// Import web extension polyfill for chrome
// For details refer to
// https://github.com/mozilla/webextension-polyfill
import polyfill from 'webextension-polyfill';

/**
 * The browser namespace. Will be injected on built. For
 * chrome and opera it's always 'chrome'. For other browsers
 * it's simple 'browser'
 *
 * @type {string}
 */
const namespace = '<%=NAMESPACE%>';
/**
 * The browser driver.
 *
 * For chrome and opera it's always chrome with polyfill because
 * they rely on the same engine. For edge and firefox it's the
 * global browser object.
 *
 * The polyfill for the chrome and opera browser will promisify
 * it's web extension api to use the same behaviour as for firefox
 * and edge.
 *
 * Shame on google to use callbacks instead of promises and don't
 * rely on mozilla's web extension api to make this step necessary.
 */
export default namespace === 'chrome' ? polyfill : global.browser;
