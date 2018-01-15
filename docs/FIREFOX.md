### Error analysis to the script injection problem of the `iam.js` in firefox

**Description:**

Currently the firefox emits an error when injecting the iam.js to an active tab. 

```
'addEventListener' called on an object that does not implement interface EventTarget.
```

This error occurred because of the implementation below (Line 603 - 608) in the iam.js:

```javascript 1.5
  if (window.addEventListener) {
    evtListener = window.addEventListener;
  } else {
    evtListener = window.attachEvent;
    evtPrefix = "on";
  }
```

A analysis of the issue shows that the references to the built-in method addEventListener gets lost when the browser tries to interpret the code when injected into a tab. This issues is a very isolated problem and only occurs in this particular context. But to realize a functional IMAREX extension for firefox this issue have to be solved.

**Solution:**

A possible solution ist to replace the code in the iam.js from line 597 to 626 with following code:

```javascript 1.5
if (typeof window.postMessage !== 'undefined'
  && typeof JSON === 'object'
  && typeof JSON.parse === 'function'
  && typeof JSON.stringify === 'function') {
  var messageHandler = function (msg) {
    try {
      var msgdata = JSON.parse(msg.data);
    } catch(e) {
      msgdata = { type: false };
    }
    if (typeof msgdata === 'object' && msgdata.type === 'iam_data') {
      var respObj = {
        seq: msgdata.seq,
        iam_data: {
          st: result.st,
          cp: result.cp
        }
      };
      msg.source.postMessage(JSON.stringify(respObj), msg.origin);
    }
  };
  if (window.addEventListener) {
    window.addEventListener('message', messageHandler);
  } else {
    window.attachEvent('onmessage', messageHandler);
  }
}
```

This code avoids the copying of the built-in listener attach methods into a local variable, which causes the error in firefox browsers. It calls these function directly via the window object and binds a listener function to it. This listener function is defined before and gets referenced in the event binding.
