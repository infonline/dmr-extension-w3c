/* eslint-env browser */
/* global iom, ENV */
// Import web extension driver
/**
 * Web extension driver
 * @type {Proxy|Object}
 */
import { driver } from './driver';
// Import log function
import { log } from './utils';
import {
  DMR_WEB_APP_URIS,
  MESSAGE_ACTIONS,
  MESSAGE_DIRECTIONS,
} from './constants';
import iomFactory from './iom';

const env = ENV;
// Create new instance of INFOnline measurement library
const iom = iomFactory();
/**
 * Local event origin cache. Will be overwritten on every post message event coming from the dmr web app
 *
 * @type {String}
 */
let origin;
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
 * Check if the provided event origin is valid
 *
 * @param {String} transmittedOrigin - The origin (uri) of a post message event
 * @return {Boolean} Check result
 */
const checkOrigin = (transmittedOrigin) => {
  if (env === 'development') {
    // Check origin against development uri schema
    return transmittedOrigin.includes('localhost:8080');
  }
  // Check origin again productive uri schema
  return DMR_WEB_APP_URIS.map(uri => transmittedOrigin.includes(uri)).filter(item => item === true).length > 0;
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
    if (from === MESSAGE_DIRECTIONS.EXTENSION && to === MESSAGE_DIRECTIONS.EXTENSION) {
      if (message.action === MESSAGE_ACTIONS.COUNT && message.data) {
        count(message.data);
      }
    } else if (from === MESSAGE_DIRECTIONS.EXTENSION && to === MESSAGE_DIRECTIONS.WEB_APP) {
      // Send message to the DMR web app
      window.postMessage({
        from,
        to,
        message,
      }, origin);
    }
    // Always response with the message to signalize the successful transmission.
    return true;
  } catch (err) {
    // In case of error log it and signalize the failure to background script
    log('error', err);
    throw err;
  }
};
// Add event message handler for message passing from a normal web page
window.addEventListener('message', async (event) => {
  // Process only events who source are the dmr web app
  if (event.source === window && checkOrigin(event.origin) === true) {
    // eslint-disable-next-line prefer-destructuring
    origin = event.origin;
    if (event.data.from && event.data.from === MESSAGE_DIRECTIONS.WEB_APP) {
      log('info', `Content script received message with action ${event.data.message.action} from ${event.data.from}.`);
      // Send message to background script
      if (event.data.to && event.data.to === MESSAGE_DIRECTIONS.EXTENSION) {
        // Send message to background script for processing
        const response = driver.runtime.sendMessage({
          ...event.data,
        });
        if (response) {
          log('info', `Message from ${event.data.from} with action ${event.data.message.action} successfully transmitted to background script`);
        }
      }
    }
  }
});
// Add message handler as listener to the runtime on message interface
driver.runtime.onMessage.addListener(onMessage);
