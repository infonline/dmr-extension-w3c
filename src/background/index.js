/* eslint-env browser */
import store from '../store';
import {
  log,
  uuidv4,
  setUninstallUrl,
  getCurrentVendor,
} from '../common/utils';

import {
  ENVIRONMENT,
  DMR_WEB_APP_URIS,
  MESSAGE_ACTIONS,
  MESSAGE_DIRECTIONS,
  URL_FILTER,
} from '../constants';

const localTimeStampsMap = new Map();
const transitionQualifiersMap = new Map();

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
      const { settings, registration } = await browser.storage.local.get();
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
          log('info', `Count of ${url.origin} initiated on tab ${tabId}`);
          // Create message object for instruct the content script to count
          const message = {
            from: MESSAGE_DIRECTIONS.EXTENSION,
            to: MESSAGE_DIRECTIONS.EXTENSION,
            // This is the actual information sent to INFOnline
            message: {
              action: MESSAGE_ACTIONS.COUNT,
              data: {
                cn: 'imarex',
                st: 'imarex',
                cp: 'profile',
                u4: url.origin,
                uid: registration.userId,
                pid: registration.panelId || '',
                pvr: registration.provider.id || '',
                tid: tabId,
              },
            },
          };
          // Send count message to current tab
          const response = await browser.tabs.sendMessage(tabId, message);
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

/**
 * Gets all tabs which url will fulfill the dmr url pattern
 *
 * @return {Promise<Array|*>} Collection of tabs
 */
const getTabs = async () => {
  try {
    const allTabs = await browser.tabs.query({ url: '<all_urls>' });
    const pattern = ENVIRONMENT === 'development' ? 'localhost:8080' : DMR_WEB_APP_URIS;
    return allTabs.filter((tab) => {
      if (Array.isArray(pattern)) {
        return pattern.map(pat => tab.url.includes(pat)).filter(item => item === true).length > 0;
      }
      return tab.url.includes(pattern);
    });
  } catch (error) {
    log('error', error);
    return [];
  }
};

/**
 * Sends the provided message object all provided tabs in current browser instance
 *
 * @param {Object} request - Request object
 * @return {Promise<boolean>} Transmit result
 */
const informTabs = async (request) => {
  try {
    const tabs = await getTabs();
    const tabIds = tabs.map(item => item.id);
    // Send request back to content script
    const promises = tabs.map(item => browser.tabs.sendMessage(item.id, request));
    const responses = await Promise.all(promises);
    if (responses.length === promises.length) {
      log('info', `Message with action ${request.message.action} successful transmitted to tabs with ids ${tabIds.join(', ')}`);
    } else {
      log('error', `Message with action ${request.message.action} failed to transmit to tabs with ids ${tabIds.join(', ')}`);
    }
  } catch (error) {
    log('error', error);
  }
};

/**
 * Opens the VENDOR specific extension management page in a new tab
 */
const openExtensionManagementTab = async () => {
  const vendor = await getCurrentVendor();
  if (vendor === 'chrome' || vendor === 'opera') {
    browser.tabs.create({
      url: `chrome://extensions/?id=${browser.runtime.id}`,
    });
  } else if (vendor === 'firefox') {
    if (ENVIRONMENT === 'development') {
      browser.tabs.create({
        url: 'about:debugging#addons',
      });
    } else {
      browser.tabs.create({
        url: 'about:addons',
      });
    }
  } else if (vendor === 'edge') {
    browser.tabs.create({
      url: `edge://extensions/?id=${browser.runtime.id}`,
    });
  }
};

/**
 * Central messaging handler for the extension
 *
 * @param {Object} request- The message request
 * @returns {Promise<Boolean>} Handling success
 */
const onMessage = async (request) => {
  try {
    const data = await browser.storage.local.get();
    let response;
    if (request.from === MESSAGE_DIRECTIONS.WEB_APP && request.to === MESSAGE_DIRECTIONS.EXTENSION) {
      if (request.message.action === MESSAGE_ACTIONS.GET_REGISTRATION) {
        const { registration } = data;
        // Send panel Id back to content script
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.SET_PANEL_ID) {
        const { registration } = data;
        registration.panelId = request.message.panelId;
        registration.updatedAt = new Date().toJSON();
        await browser.storage.local.set({ registration });
        // Create response with set panel id
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.SET_PROVIDER) {
        const { registration } = data;
        registration.provider = request.message.provider;
        registration.updatedAt = new Date().toJSON();
        await browser.storage.local.set({ registration });
        if (registration.provider.name) {
          setUninstallUrl(registration.userId, registration.provider.name);
        }
        // Create response with set provider
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.REMOVE_PROVIDER) {
        const { registration } = data;
        registration.provider = {
          id: undefined,
          name: undefined,
          label: undefined,
        };
        registration.updatedAt = new Date().toJSON();
        await browser.storage.local.set({ registration });
        // Create response with emptied provider
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.TOGGLE_AGREEMENT) {
        const { registration, settings } = data;
        registration.agreed = request.message.agreed;
        // Toggle tracking state according to the agreement state
        settings.tracking = request.message.agreed;
        settings.updatedAt = new Date().toJSON();
        registration.updatedAt = new Date().toJSON();
        // Persistent state
        await browser.storage.local.set({ ...data, registration, settings });
        // Create response with updated registration object
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.REMOVE_REGISTRATION) {
        const { registration } = data;
        // Create new user id
        registration.userId = uuidv4();
        registration.agreed = false;
        registration.completed = false;
        // Set the uninstall url which should be opened when the extension is uninstalled
        if (registration.provider.name) {
          setUninstallUrl(registration.userId, registration.provider.name);
        }
        // Wipe panel identifier
        registration.panelId = undefined;
        // Wipe provider
        registration.provider = {
          id: undefined,
          name: undefined,
          label: undefined,
        };
        registration.updatedAt = new Date().toJSON();
        // Persistent state
        await browser.storage.local.set({ ...data, registration });
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.GET_EXTENSION_STATS) {
        const { version } = browser.runtime.getManifest();
        const { id } = browser.runtime;
        const { registration, statistic } = data;
        const { createdAt: installedAt } = registration;
        response = {
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
      } else if (request.message.action === MESSAGE_ACTIONS.ACTIVATE_TRACKING || request.message.action === MESSAGE_ACTIONS.DEACTIVATE_TRACKING) {
        data.settings.tracking = request.message.action === MESSAGE_ACTIONS.ACTIVATE_TRACKING;
        await browser.storage.local.set(data);
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            tracking: data.settings.tracking,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.GET_SETTINGS) {
        const { settings } = data;
        // Create response with extension settings
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            settings,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.COMPLETE_REGISTRATION) {
        const { registration } = data;
        registration.completed = true;
        registration.updatedAt = new Date().toJSON();
        // Persistent state
        await browser.storage.local.set({ ...data, registration });
        if (registration.provider.name) {
          setUninstallUrl(registration.userId, registration.provider.name);
        }
        // Create response with completed registration
        response = {
          from: request.to,
          to: request.from,
          message: {
            ...request.message,
            registration,
          },
        };
      } else if (request.message.action === MESSAGE_ACTIONS.OPEN_EXTENSION_TAB) {
        await openExtensionManagementTab();
      }
    } else if (request.from === MESSAGE_DIRECTIONS.EXTENSION && request.to === MESSAGE_DIRECTIONS.WEB_APP) {
      if (request.message.action === MESSAGE_ACTIONS.UPDATE_SETTINGS) {
        const { settings } = request.message;
        await browser.storage.local.set({ ...data, settings });
        // Create response with updated settings
        response = {
          ...request,
          message: {
            action: MESSAGE_ACTIONS.UPDATE_SETTINGS,
            settings,
          },
        };
      }
    }
    if (response !== undefined) {
      await informTabs(response);
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
      if (!browser.webNavigation.onHistoryStateUpdated.hasListener(onLoaded)) {
        browser.webNavigation.onHistoryStateUpdated.addListener(onLoaded, URL_FILTER);
      }
      if (!browser.webNavigation.onDOMContentLoaded.hasListener(onLoaded)) {
        browser.webNavigation.onDOMContentLoaded.addListener(onLoaded, URL_FILTER);
      }
      if (!browser.webNavigation.onReferenceFragmentUpdated.hasListener(onLoaded, URL_FILTER)) {
        browser.webNavigation.onReferenceFragmentUpdated.addListener(onLoaded, URL_FILTER);
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
browser.webNavigation.onCommitted.addListener(committed);
browser.runtime.onMessage.addListener(onMessage);
store.dispatch('init');
