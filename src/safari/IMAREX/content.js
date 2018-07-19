/* eslint-env browser */
/* global safari, iom, ENV, IAM_PANEL_EXCHANGE_URL, IAM_SCRIPT_URL */
/**
 * Utils factory. We will separate the utility code from the content script to stay clean
 * and modular
 *
 * @type {{getQueryParameterByName}}
 */
const utilities = (function utils(document, window) {
  return {
    /**
     * Extracts a query parameter from a given url and returns the decoded value from it
     *
     * @param {String} name - Name of the query parameter
     * @param {String} [url] - URI of current browsed page
     * @returns {*}
     */
    getQueryParameterByName(name, url = window.location.href) {
      const localName = name.replace(/[[]]/g, '\\$&');
      const regex = new RegExp(`[?&]${localName}(=([^&#]*)|&|#|$)`);
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
  };
}(document, window));
/**
 * Content script IIFE
 */
(function init(document, window, safari, utils) {
  // Local environment (ENV='development' allows logging to console)
  const env = ENV;
  // Define a mutable variable for the interval
  let scriptLoaded;
  /**
   * Counts teh page request via iam.js
   *
   * @param {Object} event - The transmitted event form safari app extension
   */
  const count = (event) => {
    const settings = event.message;
    // console.log(window);
    if (window.iom) {
      iom.c({
        cn: 'de',
        st: 'imarex',
        cp: 'profile',
        u4: document.location.href,
        uid: settings.userId,
        pid: settings.panelId,
        pvr: settings.panelVendor,
      }, 1);
    }
  };
  /**
   * Central message handler to call local functions in behalf of transmitted message types
   *
   * @param {Object} event - The transmitted event form safari app extension
   */
  const handler = (event) => {
    if (event.message.state === 'success') {
      if (event.name === 'init') {
        // Will count the browsed page after we get all the information
        // we need (user id, panel id and vendor)
        count(event);
      } else if (event.name === 'configure') {
        if (env === 'development') {
          console.info('Panel id and panel vendor successfully saved to app extension');
        }
      }
    } else if (event.message.state === 'error') {
      if (env === 'development') {
        console.error(event.message.error);
      }
    }
  };

  /**
   * Loads the iam.js as early as possible. When function call is active in content script
   * It will load the iam.js when document head is available. This ensures that the iam.js
   * is loaded before init process is dispatched when dom content is loaded.
   */
  const loadScript = () => {
    scriptLoaded = setInterval(() => {
      // Check if document head is available
      if (document.head) {
        // Clear the interval
        clearInterval(scriptLoaded);
        // Create script tag
        const el = document.createElement('script');
        // Set attributes
        el.setAttribute('type', 'text/javascript');
        el.setAttribute('src', IAM_SCRIPT_URL);
        // Append script to head
        document.head.appendChild(el);
      }
    }, 0);
  };
  /**
   * Initializes the app extension when dom content is loaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    if (document.location.href.includes(IAM_PANEL_EXCHANGE_URL)) {
      // We are on the IAM <-> Panel Vendor exchange page and have to extract parameters from
      // the URL query part
      const panelId = utils.getQueryParameterByName('pid');
      const panelVendor = utils.getQueryParameterByName('pvr');
      if (panelId && panelVendor) {
        // Dispatch a configure message to the app extension to store the panel id and vendor
        // in the app extension local store
        safari.extension.dispatch('configure', {
          panelId,
          panelVendor,
        });
      }
    }
    // Initialize the IAM measurement process
    safari.extension.dispatchMessage('init');
  });
  /**
   * This is the handler for the ping back from the safari extension backend code
   */
  safari.self.addEventListener('message', handler);
  // Load iam.js
  loadScript();
}(document, window, safari, utilities));
