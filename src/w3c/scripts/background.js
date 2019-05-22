/* eslint-env browser */
/* globals IAM_PANEL_EXCHANGE_URL */
/* global IAM_SCRIPT_URL */
// Import web extension driver
/**
 * Web extension driver
 * @type {Proxy|Object}
 */
import { driver } from './driver';
import store from '../store';
import {
  log,
  fetch, uuidv4,
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
 * Listener for history change and dom content loaded events. Will execute the
 * INFOnline measurement script and will instruct the content script to count.
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
      const { settings } = await driver.storage.local.get();
      const { tracking } = settings;
      if (tracking === true) {
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
          const registration = store.getters['registration/getRegistration'];
          // Load INFOnline measurement script from cache or from sourcer
          const code = await loadIamScript();
          // Execute INFOnline measurement script
          await driver.tabs.executeScript(tabId, { code });
          log('info', `Count of ${url.origin} initiated on tab ${tabId}`);
          // Create message object for instruct the content script to count
          const message = {
            from: 'IMAREX_WEB_EXTENSION',
            to: 'IMAREX_WEB_EXTENSION',
            // This is the actual information sent to INFOnline
            message: {
              action: 'COUNT',
              data: {
                cn: 'imarex',
                st: 'imarex',
                cp: 'profile',
                u4: url.origin,
                uid: registration.userId,
                pid: registration.panelId || '',
                pvr: registration.provider || '',
                tid: tabId,
              },
            },
          };
          // Send count message to current tab
          const response = await driver.tabs.sendMessage(tabId, message);
          // Log success or failure
          if (response) {
            log('info', `Count of ${url.origin} succeeded on tab ${tabId}`);
            // Update site statistic
            store.dispatch('statistic/update', { type: 'count', event: 'count', site: url.hostname });
          } else if (!response) {
            log('error', `Count of ${url.origin} failed on tab ${tabId}`);
          }
        }
      } else {
        log('info', 'Count not executed because of deactivated tracking');
      }
    }
  } catch (err) {
    log('error', err);
  }
};
const informTabs = async (tabs, message) => {
  try {
    // Send installation Id back to content script
    const promises = tabs.map(item => driver.tabs.sendMessage(item.id, message));
    const responses = await Promise.all(promises);
    return responses.length === promises.length;
  } catch (error) {
    throw error;
  }
};

/**
 * Central messaging listener for
 *
 * @param request
 * @returns {Promise<*>}
 */
const onMessage = async (request) => {
  try {
    const tabs = await driver.tabs.query({ url: `${IAM_PANEL_EXCHANGE_URL}/*` });
    const tabIds = tabs.map(item => item.id);
    const data = await driver.storage.local.get();
    if (request.from === 'IMAREX_REGISTRATION_SITE'
      && request.message.action === 'GET_REGISTRATION') {
      const { registration } = data;
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Registration details successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Registration details successfully transmitted to tab ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE'
      && request.message.action === 'SET_PANEL_ID') {
      const { registration } = data;
      registration.panelId = request.message.panelId;
      registration.updatedAt = new Date().toJSON();
      await driver.storage.local.set({ ...data, registration });
      // Send panel Id back to content script
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Panel identifier successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Panel identifier details successfully transmitted to tab ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'SET_PROVIDER') {
      const { registration } = data;
      registration.provider = request.message.provider;
      registration.updatedAt = new Date().toJSON();
      await driver.storage.local.set({ ...data, registration });
      // Send provider back to content script
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Provider details successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Provider details successfully transmitted to tab ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'REMOVE_PROVIDER') {
      const { registration } = data;
      registration.provider = undefined;
      registration.updatedAt = new Date().toJSON();
      await driver.storage.local.set({ ...data, registration });
      // Send provider back to content script
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Removal of provider details successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Removal of provider details details successfully transmitted to tab ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'TOGGLE_AGREEMENT') {
      const { registration, settings } = data;
      registration.agreed = request.message.agreed;
      // Toggle tracking state according to the agreement state
      settings.tracking = request.message.agreed;
      settings.updatedAt = new Date().toJSON();
      registration.updatedAt = new Date().toJSON();
      // Persistent state
      await driver.storage.local.set({ ...data, registration, settings });
      // Send provider back to content script
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Removal of provider details successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Removal of provider details details successfully transmitted to tab ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'REMOVE_REGISTRATION') {
      const { registration } = data;
      // Create new user id
      registration.userId = uuidv4();
      registration.agreed = false;
      registration.completed = false;
      // Set the uninstall url which should be opened when the extension is uninstalled
      if (registration.userId && registration.provider) {
        driver.runtime
          .setUninstallURL(`${IAM_PANEL_EXCHANGE_URL}/home/registration?action=revoke&userId=
            ${registration.userId}&provider=${registration.provider.name}`);
      }
      // Wipe panel identifier
      registration.panelId = undefined;
      // Wipe provider name
      registration.provider = undefined;
      registration.updatedAt = new Date().toJSON();
      // Persistent state
      await driver.storage.local.set({ ...data, registration });
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Removal of registration successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Removal of registration failed to transmit to tabs ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_WEB_EXTENSION' && request.message.action === 'UPDATE_SETTINGS') {
      const { settings } = request.message;
      await driver.storage.local.set({ ...data, settings });
      const message = {
        from: request.to,
        to: 'IMAREX_REGISTRATION_SITE',
        message: {
          action: settings.tracking ? 'ACTIVATE_TRACKING' : 'DEACTIVATE_TRACKING',
          tracking: settings.tracking,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Extension settings successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Extension settings failed to transmit to tab tabs ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'GET_EXTENSION_STATS') {
      const { version } = driver.runtime.getManifest();
      const { id } = driver.runtime;
      const { registration, statistic } = data;
      const { createdAt: installedAt } = registration;
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          id,
          version,
          statistic,
          installedAt,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Extension stats successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Extension stats failed to transmit to tab tabs ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE'
      && (request.message.action === 'ACTIVATE_TRACKING'
        || request.message.action === 'DEACTIVATE_TRACKING')) {
      data.settings.tracking = request.message.action === 'ACTIVATE_TRACKING';
      await driver.storage.local.set(data);
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          tracking: data.settings.tracking,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Extension settings successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Extension settings failed to transmit to tab tabs ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'GET_SETTINGS') {
      const { settings } = data;
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          settings,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Extension settings successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Extension settings failed to transmit to tab tabs ${tabIds.join(', ')}`);
      }
    } else if (request.from === 'IMAREX_REGISTRATION_SITE' && request.message.action === 'COMPLETE_REGISTRATION') {
      const { registration } = data;
      registration.completed = true;
      registration.updatedAt = new Date().toJSON();
      // Persistent state
      await driver.storage.local.set({ ...data, registration });
      const message = {
        from: request.to,
        to: request.from,
        message: {
          ...request.message,
          registration,
        },
      };
      if (await informTabs(tabs, message)) {
        log('info', `Completion of registration successfully transmitted to tabs ${tabIds.join(', ')}`);
      } else {
        log('error', `Completion of registration failed to transmit to tabs ${tabIds.join(', ')}`);
      }
    }
    return true;
  } catch (error) {
    log('error', error);
    return false;
  }
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
      const {
        tabId,
        transitionType,
      } = sender;
      const url = new URL(sender.url);
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
        store.dispatch('statistic/update', { type: 'navigation', event: transitionType, site: url.hostname });
      }
    }
  } catch (err) {
    log('error', err);
  }
};

// Event binding.
driver.webNavigation.onCommitted.addListener(committed);
driver.runtime.onMessage.addListener(onMessage);
store.dispatch('init');
