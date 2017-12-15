/* eslint-env browser */
/* global chrome browser document */
/**
 * The ENV variable. Specifies the environment (production or development).
 * Will be injected in the script while building
 * the web extension.
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
 * The global variable. Either specific chrome web extension api or
 * the common browser web extension api which rely on mozilla.
 *
 * @type {Object}
 */
const global = vendor === 'chrome' || vendor === 'opera' ? chrome : browser;
/**
 * Local port cache
 *
 * @type {Object}
 */
let port;
/**
 * Will create the iam measurement impulse and executes the count method
 * of the iam script.
 *
 * @param {Object} data - The data to transmit to INFOnline cube.
 */
const count = (data) => {
  const result = data;
  // Include the document referrer
  result.ref = document.referrer;
  // Count
  window.iom.c(result, 1);
  // Send success message to the background script for
  // logging purposes.
  port.postMessage({
    type: 'success',
    request: 'count',
    result,
  });
};

/**
 * Will connect to the background script and store the returned
 * communication port local.
 */
const connect = () => {
  // Todo: Submit the web extension id as name and check it on the background script
  // Connect to background script and cache returned port
  port = global.runtime.connect({
    name: 'imarex',
  });
};

/**
 * Central message handler for the content script
 *
 * @param {*} message - The transmitted message object
 */
const onMessage = (message) => {
  const {
    type,
    request,
    result,
    error,
  } = message;
  // Handle normal messages
  if (type === 'success' && request === 'message') {
    if (ENV === 'development') {
      console.log(message);
    }
  } else if (type === 'success' && request === 'count') {
    count(result);
  } else if (type === 'error') {
    if (ENV === 'development') {
      console.error(error);
    }
  }
};
// Connect
connect();
// Reconnect to background script if disconnect occurred
port.onDisconnect.addListener(connect);

// Bind central message listener on registered communication port
port.onMessage.addListener(onMessage);
