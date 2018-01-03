/**
 * The ENV variable. Specifies the environment (production or development).
 * Will be injected in the script while building the web extension.
 *
 * @type {string}
 */
const ENV = '<%=ENV%>';
/**
 * Logs messages to browser console if environment is development
 *
 * @param {String} type - Message type (error, warn or info)
 * @param {Array.<*> | String} args - Log arguments like messages.
 */
export const log = (type, ...args) => {
  if (ENV === 'development') {
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
 * Orchestrates the general XMLHttpRequest with a promise. To use it
 * with async/await. We can rely on WHATWG fetch but not necessary
 * for loading only scripts.
 *
 * @param {String} url - The url to fetch
 * @param {Object} [options] - Optional fetch options
 * @return {Promise<any>} Fetch result as Promise
 */
export const fetch = (url, options = { method: 'get' }) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.onerror = reject;
  request.onreadystatechange = () => {
    if (request.status === 200 && request.readyState === 4) {
      resolve(request.responseText);
    }
  };
  request.open(options.method, url, true);
  request.send();
});
/**
 * Removes all descendant nodes from a container
 * @param {Element} container
 */
export const removeAllChildren = (container) => {
  try {
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    } else {
      throw new Error('No container specified');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Gets the selected profile from local storage
 *
 * @param {Object} driver - The browser driver
 * @returns {Promise<Profile|Undefined>}
 */
export const getSelectedProfile = async (driver) => {
  const store = await driver.storage.local.get('profiles');
  const profile = store.profiles.find(item => item.selected === true);
  // Remove selected attribute because it's not necessary
  if (profile) {
    delete profile.selected;
  }
  return profile;
};
/**
 * Gets the current profile count
 *
 * @param {Object} driver - The browser driver
 * @returns {Promise<Number>} Profile count
 */
export const getProfilesCount = async (driver) => {
  const store = await driver.storage.local.get('profiles');
  return store.profiles ? store.profiles.length : 0;
};
