/* eslint-env browser */
/* global chrome browser window URL */
// Import chrome promisify library
import ChromePromise from 'chrome-promise';
/**
 * The ENV variable. Specifies the environment (production or development).
 * Will be injected in the script while building the web extension.
 *
 * @type {string}
 */
const ENV = '<%=ENV%>';
/**
 * The vendor variable. Will be injected in the script while building
 * the web extension.
 * @type {string}
 */
const vendor = '<%=vendor%>';
/**
 * The global variable. Either specific promisified chrome web extension
 * api or the common browser web extension api which rely on mozilla and
 * has already a promisified api. For API specific things please refer
 * to https://developer.mozilla.org/en-US/Add-ons/WebExtensions
 *
 * @type {Object}
 */
const global = vendor === 'chrome' ? new ChromePromise({ chrome, Promise }) : browser;
/**
 * The URI of the INFOnline measurement script. Will be injected in the script while building
 * the web extension.
 * @type {String}
 */
const IAM_SCRIPT_URL = '<%=IAM_SCRIPT_URL%>';
/**
 * The default URL filter for navigation events
 *
 * @type {{url: *[]}}
 */
const URL_FILTER = { url: [{ schemes: ['http', 'https'] }] };
/**
 * Local port cache. Makes it possible to measure different tabs simultaneously
 *
 * @type {Array}
 */
const ports = [];
/**
 * Local INFOnline measurement code cache
 *
 * @type {String}
 */
let iamCode;

/**
 * Orchestrates the general XMLHttpRequest with a promise.
 *
 * @param {String} url - The url to fetch
 * @param {Object} [options] - Optional fetch options
 * @return {Promise<any>} Fetch result as Promise
 */
const fetch = (url, options = { method: 'get' }) => new Promise((resolve, reject) => {
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
 * Finds a port by a given tab ID. This is useful when sending messages
 * to a connected port respectively tab. It will also check if the tab is
 * active to avoid accidentally request ports with inactive tabs.
 *
 * @param {Number} id - The ID of the tab
 * @return {Object} The found port.
 */
const findPortByTab = id => ports
  .find(port => port.sender.tab.id === id && port.sender.tab.active);

/**
 * Adds a port to the local port cache. This allows multi port/tab processing
 *
 * @param {Object} port - The open port to the content script
 */
const addPort = (port) => {
  const pos = ports.findIndex(item => item.id === port.id);
  if (pos === -1) {
    ports.push(port);
    if (ENV === 'development') {
      console.log(`Port with ID ${port.id} added.`);
    }
  }
};
/**
 * Removes a disconnected port from the local port cache. This avoids
 * accidental messaging over inactive ports.
 *
 * @param {Object} port - The disconnected port to the content script
 */
const removePort = (port) => {
  const pos = ports.findIndex(item => item.id === port.id);
  if (pos > -1) {
    ports.splice(port);
    if (ENV === 'development') {
      console.log(`Port with ID ${port.id} removed.`);
    }
  }
};

/**
 * RFC4122 compliant UUID v4 generator. Will be needed for creating a
 * unique and unambiguous identifications for user and ports. Uses the
 * window crypto api to make it secure at the cost of just a few bytes
 * by replacing Math.random() with getRandomValues(). For browser
 * compliant please refer to https://caniuse.com/#search=crypto
 *
 * @return {String} RFC4122 compliant UUID v4
 */
const uuidv4 = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
  // eslint-disable-next-line no-bitwise,no-mixed-operators
  .replace(/[018]/g, c => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

/**
 * Initializes the web extension store
 *
 * @return {Promise<any>}
 */
const configureStore = () => new Promise((resolve, reject) => {
  global.storage.local
    .get()
    .then((data) => {
      const results = data;
      // Create user ID if necessary
      if (!results.userId) {
        results.userId = uuidv4();
      }
      // Create stats if necessary
      if (!results.stats) {
        results.stats = {
          host: {},
          type: {},
        };
      }
      // Make user ID and stats persistent.
      // The storage set method returns no result when fulfilled.
      // So we have to turn an extra round an fulfill or reject manual.
      return global.storage.local
        .set(results)
        .then(() => Promise.resolve(results))
        .catch(err => Promise.reject(err));
    })
    .then(result => resolve(result))
    .catch(err => reject(err));
});
/**
 * Initializes the background script on every update and installation.
 * It will create the local storage items if necessary and can be extended
 * for later development in the future.
 */
const init = () => {
  configureStore()
    .then((result) => {
      if (ENV === 'development') {
        console.log(`Background script with user ID ${result.userId} initialized.`);
      }
    })
    .catch((err) => {
      if (ENV === 'development') {
        console.error('Background script could not be initialized due to this error:');
        console.error(err);
      }
    });
};
/**
 * Loads the INFOnline measurement script from the sourcer endpoint, if
 * not locally cached and will execute it in the active tab. The cache
 * is designed for only cache the script when browser is active. The cache
 * gets automatically destroyed when background script will exit. This happens
 * when user closes the browser.
 *
 * @param {Object} sender - The message sender object.
 * @return {Promise<Object, Error>} Fulfill with tab, code and results or with an rejection.
 */
const load = sender => new Promise((resolve, reject) => {
  const { tabId } = sender;
  // Fetch the iam script from the INFOnline sourcer
  global.tabs
    .get(tabId)
    .then((tab) => {
      if (iamCode) {
        return Promise.resolve({ tab, code: iamCode });
      }
      return fetch(IAM_SCRIPT_URL)
        .then((code) => {
          iamCode = code;
          return Promise.resolve(code);
        })
        .catch(err => Promise.reject(err));
    })
    // Successful fetched
    .then(({ tab, code }) => {
      // cache code
      // Execute the code in the active tab
      if (tab) {
        return global.tabs.executeScript(tabId, { code })
          .then(results => Promise.resolve({ tab, code, results }))
          .catch(err => Promise.reject(err));
      }
      throw new Error('Sender has no active tab.');
    })
    // Success callback for firefox, edge
    .then(results => resolve(results))
    // Error handling
    .catch(err => reject(err));
});

/**
 * Listener for navigation committed events. Will create some stats and will save
 * the transition type respectively increments it's value.
 *
 * @param {Object} sender - The message sender object.
 */
const committed = (sender) => {
  // Filter out any sub-frame related navigation event
  if (sender.frameId !== 0) {
    return;
  }
  global.storage.local
    .get()
    .then((data) => {
      const results = data;
      const { transitionType } = sender;
      results.stats.type[transitionType] = results.stats.type[transitionType] || 0;
      results.stats.type[transitionType] += 1;
      // Persist the updated stats.
      return global.storage.local.set(results);
    })
    .then(() => {
      if (ENV === 'development') {
        console.log(`User initiated navigation for ${sender.tabId} with transition type ${sender.transitionType}`);
      }
    })
    .catch((err) => {
      if (ENV === 'development') {
        console.log(err);
      }
    });
};

/**
 * Listener for history change and dom content loaded events. Will execute the INFOnline
 * measurement script and will instruct the content script to count.
 *
 * @param {Object} sender - The message sender object.
 */
const onLoaded = (sender) => {
  // Filter out any sub-frame related navigation event.
  if (sender.frameId !== 0) {
    return;
  }
  // Convert sender url in a WHATWG URL object.
  // Refer to https://url.spec.whatwg.org/#dom-url for details.
  // For browser compliant please refer to https://caniuse.com/#search=URL.
  const url = new URL(sender.url);
  let store;
  // Retrieve storage data.
  global.storage.local
    .get()
    .then((data) => {
      store = data;
      return Promise.resolve();
    })
    // Execute INFOnline measurement script in active tab
    .then(() => load(sender))
    // Create message for the content script to count this navigation event
    .then(({ tab }) => {
      if (tab) {
        // Find the port by the active tab
        const port = findPortByTab(tab.id);
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
            tab: tab.id,
          },
        };
        if (port) {
          // Send message to content script to execute the count.
          port.postMessage(message);
        }
      }
      // Resolve
      return Promise.resolve();
    })
    // Save stats in local storage
    .then(() => {
      // Update stats
      store.stats.host[url.hostname] = store.stats.host[url.hostname] || 0;
      store.stats.host[url.hostname] += 1;
      // Persist the updated stats.
      return global.storage.local.set(store);
    })
    .then(() => {
      if (ENV === 'development') {
        console.log(`Count of ${url.origin} initiated on tab ${sender.tabId}`);
      }
    })
    .catch((err) => {
      if (ENV === 'development') {
        console.error(err);
      }
    });
};

/**
 * Listener for messages from content script
 *
 * @param {*} message - The message from the content script
 */
const onPortMessage = (message) => {
  const {
    type,
    request,
    result,
    error,
  } = message;
  if (type === 'success' && request === 'count') {
    if (ENV === 'development') {
      console.log(`Count of ${result.url} in tab ${result.tab} successful`);
    }
  } else if (type === 'error') {
    if (ENV === 'development') {
      console.error(error);
    }
  }
};
/**
 * Listener for port disconnect event. Will remove the disonnected
 * port from the current port cache.
 *
 * @param {Object} port - The port who disconnects
 */
const onPortDisconnect = (port) => {
  removePort(port);
};
/**
 * Connected listener, which will be executed when a content script
 * will connect to the background script
 *
 * @param {Object} port - The content script port
 */
const connected = (port) => {
  // Create a port id with a UUID v4
  // This is necessary because the general api doesn't create one
  // and we need it for the multi port respectively tab handling.
  // eslint-disable-next-line no-param-reassign
  port.id = uuidv4();
  if (ENV === 'development') {
    console.log(`Port ID ${port.id} connected.`);
  }
  // Bind listener to message events from the content script
  port.onMessage.addListener(onPortMessage);
  // Bind listener to disconnect events from the content script
  port.onDisconnect.addListener(onPortDisconnect);
  // Add port to local cache
  addPort(port);
};

/**
 * We cannot rely on the global variable because of possible losses of event
 * bound events. So we have to handle them on the originally global variables.
 */
if (vendor === 'chrome' || vendor === 'opera') {
  // Chrome and opera related event binding.
  // Bind initialization callback when extension was installed or updated
  chrome.runtime.onInstalled.addListener(init);
  // Monitor commited and completed navigation events and update
  // stats accordingly.
  chrome.webNavigation.onCommitted.addListener(committed);
  chrome.webNavigation.onDOMContentLoaded.addListener(onLoaded, URL_FILTER);
  // eslint-disable-next-line max-len
  chrome.webNavigation.onHistoryStateUpdated.addListener(onLoaded, URL_FILTER);
  // Bind connected callback for content scripts who connects to the background script
  chrome.runtime.onConnect.addListener(connected);
  // Bind disconnect callback for content scripts who disconnects from the background script
} else {
  // Mozilla related event binding.
  // Bind initialization callback when extension was installed or updated
  browser.runtime.onInstalled.addListener(init);
  // Monitor commited and completed navigation events and update
  // stats accordingly.
  browser.webNavigation.onCommitted.addListener(committed);
  browser.webNavigation.onDOMContentLoaded.addListener(onLoaded, URL_FILTER);
  // eslint-disable-next-line max-len
  browser.webNavigation.onHistoryStateUpdated.addListener(onLoaded, URL_FILTER);
  // Bind connected callback to the
  browser.runtime.onConnect.addListener(connected);
}

