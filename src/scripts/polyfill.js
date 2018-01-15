/**
 * This is a polyfill for the web extension api provided by chrome, edge and opera
 * It relies on mozilla's implementation see
 * https://github.com/mozilla/webextension-polyfill/blob/master/src/browser-polyfill.js
 * for detail.
 */
/**
 * A WeakMap subclass which creates and stores a value for any key which does
 * not exist when accessed, but behaves exactly as an ordinary WeakMap
 * otherwise.
 *
 * @class DefaultWeakMap
 * @extends WeakMap
 */
class DefaultWeakMap extends WeakMap {
  /**
   *
   * @param {Function} createItem - A function which will be called in order
   *        to create the value for any key which does not exist, the first
   *        time it is accessed. The function receives, as its only argument,
   *        the key being created.
   */
  constructor(createItem) {
    super();
    this.createItem = createItem;
  }
  /**
   * Override for native weak map getter to create and store a value for any key
   * which does not exists when accessed.
   *
   * @param {String} key - The key to get
   * @return {* | undefined} - The key value
   */
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.createItem(key));
    }
    return super.get(key);
  }
}

/**
 * Returns true if the given object is an object with a `then` method, and can
 * therefore be assumed to behave as a Promise.
 *
 * @param {*} value The value to test.
 * @returns {boolean} True if the value is thenable.
 */
const isThenable = value => value && typeof value === 'object' && typeof value.then === 'function';
/**
 * Has own property convenient method
 *
 * @type {Function.<Boolean>}
 */
const hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
/**
 * Creates and returns a function which, when called, will resolve or reject
 * the given promise based on how it is called:
 *
 * - If, when called, `browser.runtime.lastError` contains a non-null object,
 *   the promise is rejected with that value.
 * - If the function is called with exactly one argument, the promise is
 *   resolved to that value.
 * - Otherwise, the promise is resolved to an array containing all of the
 *   function's arguments.
 *
 * @param {Object} browser - The browser runtime to polyfill.
 * @param {Object} promise - An object containing resolver and rejection of a Promise
 * @param {Function} promise.resolve - The promise's resolution function.
 * @param {Function} promise.reject - The promise's rejection function.
 * @param {Object} metaData - Metadata about the wrapped method which has created the callback.
 * @param {Boolean} metaData.singleCallbackArg - Defines the callback as function with exactly one
 *        argument
 *
 * @returns {Function} The generated callback function.
 */
const makeCallback = (browser, promise, metaData) => (...callbackArgs) => {
  if (browser.runtime.lastError) {
    promise.reject(browser.runtime.lastError);
  } else if (metaData.singleCallbackArg || callbackArgs.length === 1) {
    promise.resolve(callbackArgs[0]);
  } else {
    promise.resolve(callbackArgs);
  }
};
/**
 * Creates a wrapper function for a method with the given name and metadata.
 *
 * @param {Object} browser - The browser runtime to polyfill.
 * @param {String} name - Name of the method which being wrapped.
 * @param {Object} metaData - Meta information about the method being wrapped.
 * @param {Number} metaData.minArgs -The maximum number of arguments which may be passed to the
 *        function. If called with more than this number of arguments, the wrapper will raise an
 *        exception.
 * @param {Number} metaData.maxArgs - The maximum number of arguments which may be passed to the
 *        callback created by the wrapped async function.
 * @param {Boolean} metaData.singleCallbackArg - Defines the callback as function with exactly one
 *        argument
 * @return {Function}
 */
const wrapAsyncFunction = (browser, name, metaData) => {
  const pluralizeArguments = (numArgs) => {
    if (numArgs === 1) {
      return 'argument';
    }
    return 'arguments';
  };
  // Return wrapper method for async functions
  return function asyncFunctionWrapper(target, ...args) {
    if (args.length < metaData.minArgs) {
      throw new Error(`Expected at least ${metaData.minArgs} 
      ${pluralizeArguments(metaData.minArgs)} for ${name}(), got ${args.length}`);
    }
    if (args.length > metaData.maxArgs) {
      throw new Error(`Expected at most ${metaData.maxArgs} 
      ${pluralizeArguments(metaData.maxArgs)} for ${name}(), got ${args.length}`);
    }
    // Return the callback of the async function as promise.
    return new Promise((resolve, reject) => {
      target[name](...args, makeCallback(browser, { resolve, reject }, metaData));
    });
  };
};
/**
 * Wraps an existing method of the target object, so that calls to it are
 * intercepted by the given wrapper function. The wrapper function receives,
 * as its first argument, the original `target` object, followed by each of
 * the arguments passed to the original method.
 *
 * @param {Object} target - The original target object that the wrapped method belongs to.
 * @param {Function} method - The method being wrapped. This is used as the target of the Proxy
 *        object which is created to wrap the method.
 * @param {Function} wrapper - The wrapper function which is called in place of a direct invocation
 *        of the wrapped method.
 * @return {Proxy.<Function>} A Proxy object for the given method, which invokes the given wrapper
 *         method in its place.
 */
const wrapMethod = (target, method, wrapper) => new Proxy(method, {
  apply(targetMethod, thisObj, args) {
    return wrapper.call(thisObj, target, ...args);
  },
});
/**
 * Wraps an object in a Proxy which intercepts and wraps certain methods
 * based on the given `wrappers` and `metadata` objects.
 *
 * @param {Object} browser - The browser runtime to polyfill
 * @param {Object} targetObj - The target object to wrap.
 * @param {Object} [wrappers = {}] - An object tree containing wrapper functions for special cases.
 *        Any function present in this object tree is called in place of the method in the same
 *        location in the `target` object tree. These wrapper methods are invoked as described
 *        in {@see wrapMethod}.
 * @param {Object} [metaData = {}] - An object tree containing metadata used to automatically
 *        generate Promise-based wrapper functions for asynchronous. Any function in the
 *        `target` object tree which has a corresponding metadata object in the same location
 *        in the `metadata` tree is replaced with an automatically-generated wrapper function,
 *        as described in {@see wrapAsyncFunction}.
 * @returns {Object} Proxy object
 */
const wrapObject = (browser, targetObj, wrappers = {}, metaData = {}) => {
  /**
   * Local cache object
   *
   * @type {any}
   */
  const cache = Object.create(null);
  /**
   * Proxy handlers
   *
   * @type {Object}
   */
  const handlers = {
    has(target, prop) {
      return prop in target || prop in cache;
    },
    get(target, prop) {
      if (prop in cache) {
        return cache[prop];
      }
      if (!(prop in target)) {
        return undefined;
      }

      let value = target[prop];

      if (typeof value === 'function') {
        // This is a method on the underlying object. Check if we need to do
        // any wrapping.

        if (typeof wrappers[prop] === 'function') {
          // We have a special-case wrapper for this method.
          value = wrapMethod(target, target[prop], wrappers[prop]);
        } else if (hasOwnProperty(metaData, prop)) {
          // This is an async method that we have metadata for. Create a
          // Promise wrapper for it.
          const wrapper = wrapAsyncFunction(browser, prop, metaData[prop]);
          value = wrapMethod(target, target[prop], wrapper);
        } else {
          // This is a method that we don't know or care about. Return the
          // original method, bound to the underlying object.
          value = value.bind(target);
        }
      } else if (typeof value === 'object' && value !== null &&
        (hasOwnProperty(wrappers, prop) ||
          hasOwnProperty(metaData, prop))) {
        // This is an object that we need to do some wrapping for the children
        // of. Create a sub-object wrapper for it with the appropriate child
        // metadata.
        value = wrapObject(browser, value, wrappers[prop], metaData[prop]);
      } else {
        // We don't need to do any wrapping for this property,
        // so just forward all access to the underlying object.
        Object.defineProperty(cache, prop, {
          configurable: true,
          enumerable: true,
          get() {
            return target[prop];
          },
          set(val) {
            // eslint-disable-next-line no-param-reassign
            target[prop] = val;
          },
        });
        return value;
      }
      cache[prop] = value;
      return value;
    },
    set(target, prop, value) {
      if (prop in cache) {
        cache[prop] = value;
      } else {
        // eslint-disable-next-line no-param-reassign
        target[prop] = value;
      }
      return true;
    },
    defineProperty(target, prop, desc) {
      return Reflect.defineProperty(cache, prop, desc);
    },

    deleteProperty(target, prop) {
      return Reflect.deleteProperty(cache, prop);
    },
  };

  return new Proxy(targetObj, handlers);
};

/**
 * Creates a set of wrapper functions for an event object, which handles wrapping of listener
 * functions that those messages are passed.
 *
 * A single wrapper is created for each listener function, and stored in a map. Subsequent
 * calls to `addListener`, `hasListener`, or `removeListener` retrieve the original wrapper,
 * so that  attempts to remove a previously-added listener work as expected.
 *
 * @param {DefaultWeakMap<function, function>} wrapperMap - A DefaultWeakMap object which will
 *        create the appropriate wrapper for a given listener function when one does not exist,
 *        and retrieve an existing one when it does.
 *
 * @returns {object}
 */
const wrapEvent = wrapperMap => ({
  addListener(target, listener, ...args) {
    target.addListener(wrapperMap.get(listener), ...args);
  },
  hasListener(target, listener) {
    return target.hasListener(wrapperMap.get(listener));
  },
  removeListener(target, listener) {
    target.removeListener(wrapperMap.get(listener));
  },
});

const onMessageWrappers = new DefaultWeakMap((listener) => {
  if (typeof listener !== 'function') {
    return listener;
  }
  /**
   * Wraps a message listener function so that it may send responses based on its return value,
   * rather than by returning a sentinel value and calling a callback. If the listener function
   * returns a Promise, the response is sent when the promise either resolves or rejects.
   *
   * @param {*} message - The message sent by the other end of the channel.
   * @param {Object} sender - Details about the sender of the message.
   * @param {Function} sendResponse - A callback which, when called with an arbitrary argument,
   *        sends that value as a response.
   *
   * @returns {boolean} True if the wrapped listener returned a Promise, which will later yield
   *          a response. False otherwise.
   */
  return function onMessage(message, sender, sendResponse) {
    const result = listener(message, sender);
    if (isThenable(result)) {
      result.then(sendResponse, (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        sendResponse(error);
      });
      return true;
    } else if (result !== undefined) {
      sendResponse(result);
      return true;
    }
    return false;
  };
});

const staticWrappers = {
  runtime: {
    onMessage: wrapEvent(onMessageWrappers),
  },
};
/**
 * Polyfill factory
 *
 * @param {Object} browser - Browser runtime to polyfill
 * @param {Object} apiMetaData - API meta data of the browser runtime
 */
const polyfill = (browser, apiMetaData) => {
  if (Object.keys(apiMetaData).length === 0) {
    throw new Error('API meta has not been included in polyfill');
  }
  // Create a new empty object and copy the properties of the original browser object
  // to prevent a Proxy violation exception for the devtools API getter
  // (which is a read-only non-configurable property on the original target).
  const targetObject = Object.assign({}, browser);
  return wrapObject(browser, targetObject, staticWrappers, apiMetaData);
};

export default polyfill;
