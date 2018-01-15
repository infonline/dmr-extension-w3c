/* eslint-env browser */
/* global IAM_SCRIPT_URL */
// Import web extension driver
/**
 * Web extension driver
 * @type {Proxy|Object}
 */
import { driver } from './driver';
import {
  log,
  uuidv4,
  fetch,
  getSelectedProfile,
} from './utils';
/**
 * The default URL filter for navigation events
 *
 * @type {{url: *[]}}
 */
const URL_FILTER = {
  url: [{
    // Listen only for http and https schemes
    schemes: ['http', 'https'],
  }],
};
/**
 * Local INFOnline measurement code cache
 *
 * @type {*}
 */
let iamCode;
const localTimeStampsMap = new Map();
const transitionQualifiersMap = new Map();
/**
 * Initializes the web extension store
 *
 * @return {Promise<any>}
 */
const configureStore = async () => {
  try {
    const results = await driver.storage.local.get();
    if (!results.userId) {
      results.userId = uuidv4();
    }
    if (!results.stats) {
      results.stats = {
        host: {},
        type: {},
      };
    }
    await driver.storage.local.set(results);
    return results;
  } catch (err) {
    throw err;
  }
};
/**
 * Initializes the background script on every update and installation.
 * It will create the local storage items if necessary and can be extended
 * for later development in the future.
 */
const init = async () => {
  try {
    const result = await configureStore();
    const profile = await getSelectedProfile(driver);
    if (profile && profile.email) {
      driver.browserAction.setIcon({ path: { 19: 'images/io19.png' } });
    } else {
      // Set popup icon to a error state
      driver.browserAction.setIcon({ path: { 19: 'images/io19-no-profile.png' } });
      log('warn', 'No profile selected. Socio meta information is missing in IMAREX data.');
    }
    log('info', `Background script with user ID ${result.userId} initialized.`);
  } catch (err) {
    log('error', 'Background script could not be initialized due to this error:');
    log('error', err);
  }
};
/**
 * Loads the INFOnline measurement script from the sourcer endpoint, if
 * not locally cached and will execute it in the active tab. The cache
 * is designed for only cache the script when browser is active. The cache
 * gets automatically destroyed when background script will exit. This happens
 * when user closes the browser.
 *
 * @return {Promise<*>} Fulfill code.
 */
const loadIamScript = async () => {
  try {
    if (!iamCode) {
      // No cached script. So we have to load it from the INFOnline sourcer
      // and store it in the local iamCode variable
      iamCode = await fetch(IAM_SCRIPT_URL);
    }
    // Return loaded or cached code
    return iamCode;
  } catch (err) {
    throw err;
  }
};

/**
 * Listener for history change and dom content loaded events. Will execute the INFOnline
 * measurement script and will instruct the content script to count.
 *
 * @param {Object} sender - The message sender object.
 */
const onLoaded = async (sender) => {
  try {
    // Filter out any sub-frame related navigation event
    if (sender.frameId === 0) {
      const {
        timeStamp,
        tabId,
      } = sender;
      // Get transition qualifier from transition qualifier map
      const transitionQualifiers = transitionQualifiersMap.get(tabId) || '';
      // Get local timestamp from local time stamp map
      let localTimeStamp = localTimeStampsMap.get(tabId);
      // Convert sender url in a WHATWG URL object.
      // Refer to https://url.spec.whatwg.org/#dom-url for details.
      // For browser compliant please refer to https://caniuse.com/#search=URL.
      const url = new URL(sender.url);
      // To avoid multiple count requests on pages who uses the history api
      // we will calculate a boolean who is always true when background script
      // is reloaded and only true if the time difference between last count
      // and current count above 1 second. This is necessary because of missing
      // functionality to check if current page uses the html5 history api.
      const valid = localTimeStamp ? ((timeStamp - localTimeStamp) / 1000) > 1 : true;
      // Filter out any attempts under 1 second, new tab requests in chrome
      // (we have no access to this new tab pages) and requests with client redirect as
      // transition qualifier.
      if (valid && !url.pathname.includes('_/chrome/newtab')
        && !transitionQualifiers.includes('client_redirect')) {
        localTimeStamp = timeStamp;
        // Update tab in tabs weak map
        localTimeStampsMap.set(tabId, localTimeStamp);
        // Retrieve storage data.
        const store = await driver.storage.local.get();
        // Extract profile from local storage and fallback to empty object if undefined
        const profile = await getSelectedProfile(driver) || {};
        // Load INFOnline measurement script from cache or from sourcer
        const code = await loadIamScript();
        // Execute INFOnline measurement script
        await driver.tabs.executeScript(tabId, { code });
        log('info', `Count of ${url.origin} initiated on tab ${tabId}`);
        // Create message object for instruct the content script to count
        const message = {
          type: 'success',
          request: 'count',
          // This is the actual information sent to INFOnline
          result: {
            cn: 'de',
            st: 'imarexdata',
            cp: 'profile',
            url: url.origin,
            usr: store.userId,
            tab: tabId,
            soz: JSON.stringify(profile),
          },
        };
        // Send count message to current tab
        const response = await driver.tabs.sendMessage(tabId, message);
        // Log success or failure
        if (response) {
          log('info', `Count of ${url.origin} succeeded on tab ${tabId}`);
        } else if (!response) {
          log('error', `Count of ${url.origin} failed on tab ${tabId}`);
        }
        // Update stats
        store.stats.host[url.hostname] = store.stats.host[url.hostname] || 0;
        store.stats.host[url.hostname] += 1;
        // Persist the updated stats.
        await driver.storage.local.set(store);
      }
    }
  } catch (err) {
    log('error', err);
  }
};

/**
 * Event listener for message events send to the background script
 *
 * @param {Event} event - The emitted message event
 * @param {String} event.command - The sent command
 * @param {Object|Profile} event.data - The sent event data
 * @returns {boolean}
 */
const onMessage = async (event) => {
  if (event.command === 'switchProfile') {
    const profile = await getSelectedProfile(driver);
    if (profile && profile.email) {
      // Set popup icon to normal state
      driver.browserAction.setIcon({ path: { 19: 'images/io19.png' } });
      log('info', `Profile successfully switched to ${profile.email}`);
    } else {
      // Set popup icon to a error state
      driver.browserAction.setIcon({ path: { 19: 'images/io19-no-profile.png' } });
      log('warn', 'No profile selected. Socio meta information is missing in IMAREX data.');
    }
  }
  return true;
};

/**
 * Listener for navigation committed events. Binds the necessary listener for
 * dom content loaded, history state updated and fragment updated events.
 * Will also create some stats and will save the transition type respectively
 * increments it's value.
 *
 * @param {Object} sender - The message sender object.
 * @return {Promise<void>}
 */
const committed = async (sender) => {
  try {
    // Filter out any sub-frame related navigation event
    if (sender.frameId === 0) {
      const results = await driver.storage.local.get();
      const {
        tabId,
        transitionType,
      } = 'sender';
      let {
        transitionQualifiers,
      } = sender;
      if (!transitionQualifiers) {
        // On edge transition qualifiers are not supported yet
        transitionQualifiers = ['notSupported'];
      }
      // Update tab in tabs weak map
      transitionQualifiersMap.set(tabId, transitionQualifiers.join(';'));
      // Bind event handler to dom contend loaded and history state updated
      // events.
      if (!driver.webNavigation.onHistoryStateUpdated.hasListener(onLoaded)) {
        driver.webNavigation.onHistoryStateUpdated.addListener(onLoaded, URL_FILTER);
      }
      if (!driver.webNavigation.onDOMContentLoaded.hasListener(onLoaded)) {
        driver.webNavigation.onDOMContentLoaded.addListener(onLoaded, URL_FILTER);
      }
      if (!driver.webNavigation.onReferenceFragmentUpdated.hasListener(onLoaded, URL_FILTER)) {
        driver.webNavigation.onReferenceFragmentUpdated.addListener(onLoaded, URL_FILTER);
      }
      if (transitionType) {
        // Update stats
        results.stats.type[transitionType] = results.stats.type[transitionType] || 0;
        results.stats.type[transitionType] += 1;
      }
      // Persist the updated stats.
      await driver.storage.local.set(results);
    }
  } catch (err) {
    log('error', err);
  }
};

// Event binding.
driver.webNavigation.onCommitted.addListener(committed);
driver.runtime.onMessage.addListener(onMessage);

Promise.resolve(init());