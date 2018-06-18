/* eslint-env browser */
/* global iom */
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
 * @param {*} message - The transmitted message object
 */
const onMessage = async (message) => {
  try {
    const {
      type,
      request,
      result,
      error,
    } = message;
    // Handle normal messages
    if (type === 'success' && request === 'message') {
      log('info', message);
    } else if (type === 'success' && request === 'count') {
      count(result);
      log('info', type, request, result);
    } else if (type === 'error') {
      // Throw exception locally
      throw error;
    }
    // Always response with the message to signalize the successful
    // transmission.
    return message;
  } catch (err) {
    // In case of error log it and signalize the failure to background
    // script
    log('error', err);
    throw err;
  }
};
// Add message handler as listener to the runtime on message interface
driver.runtime.onMessage.addListener(onMessage);

