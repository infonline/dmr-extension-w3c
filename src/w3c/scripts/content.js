/* eslint-env browser */
/* global iom, IAM_PANEL_EXCHANGE_URL */
// Import web extension driver
/**
 * Web extension driver
 * @type {Proxy|Object}
 */
import { driver } from './driver';
// Import log function
import { log } from './utils';
/**
 * Will create the iam measurement impulse and executes the count method
 * of the iam script.
 *
 * @param {Object} data - The data to transmit to INFOnline cube.
 */
const count = (data) => {
  try {
    const result = data;
    // Include the document referrer
    result.ref = document.referrer;
    // Count
    iom.c(result, 1);
  } catch (err) {
    // Error handling
    throw err;
  }
};

/**
 * Central message handler for the content script
 *
 * @param {*} event - The transmitted message object
 */
const onMessage = async (event) => {
  try {
    const {
      from,
      to,
      message,
    } = event;
    log('info', 'Content script receives message from background script with action'
      + ` ${message.action} and destination ${to}`);
    // Handle normal internal messages
    if (from === to) {
      if (message.action === 'COUNT' && message.data) {
        count(message.data);
      }
    } else if (from !== to) {
      // Send message to the IMAREX exchange site
      window.postMessage({
        from,
        to,
        message,
      }, IAM_PANEL_EXCHANGE_URL);
    }
    // Always response with the message to signalize the successful
    // transmission.
    return true;
  } catch (err) {
    // In case of error log it and signalize the failure to background
    // script
    log('error', err);
    throw err;
  }
};
// Add event message handler for message passing from a normal web page
window.addEventListener('message', async (event) => {
  // Process only events who source are the imarex exchange site
  if (event.source === window && event.origin === IAM_PANEL_EXCHANGE_URL) {
    if (event.data.from && event.data.from === 'IMAREX_REGISTRATION_SITE') {
      log('info', `Content script received message with action ${event.data.message.action}`
        + ` from ${event.data.from} site.`);
      // Send message to background script
      if (event.data.to && event.data.to === 'IMAREX_WEB_EXTENSION') {
        // Send message to background script for processing
        const response = driver.runtime.sendMessage({
          ...event.data,
        });
        if (response) {
          log('info', `Message from ${event.data.from} with action ${event.data.message.action}`
            + ' successfully transmitted to background script');
        }
      }
    }
  }
});
// Add message handler as listener to the runtime on message interface
driver.runtime.onMessage.addListener(onMessage);
