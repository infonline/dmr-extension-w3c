/* eslint-env browser */
/* global safari, iom */
(function init(document, window, safari) {
  let scriptLoaded;

  const count = (event) => {
    const settings = event.message;
    // console.log(window);
    if (window.iom) {
      iom.c({
        cn: 'de',
        st: 'imarex',
        cp: 'profile',
        u4: document.location.href,
        usr: settings.userID,
      }, 1);
    }
  };
  /**
   *
   * @param event
   */
  const handler = (event) => {
    if (event.name === 'count') {
      count(event);
    }
  };

  /**
   * Loads th iam.js
   */
  const loadScript = () => {
    scriptLoaded = setInterval(() => {
      if (document.head) {
        clearInterval(scriptLoaded);
        const el = document.createElement('script');
        el.setAttribute('type', 'text/javascript');
        el.setAttribute('src', 'https://script.ioam.de/iam.js');
        document.head.appendChild(el);
      }
    }, 0);
  };
  /**
   * Initializes the app extension when dom content is loaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    safari.extension.dispatchMessage('init');
  });
  /**
   * This is the handler for the ping back from the safari extension backend code
   */
  safari.self.addEventListener('message', handler);
  // Load iam.js
  // loadScript();
}(document, window, safari));
