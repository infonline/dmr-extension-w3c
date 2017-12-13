## Ways to identify web extension instances

### Runtime ID

https://developer.mozilla.org/en-US/Add-ons/WebExtensions/WebExtensions_and_the_Add-on_ID

Starting in Firefox 48, if your manifest.json does not contain an ID then the extension will be assigned a randomly-generated temporary ID when you install it in Firefox through about:debugging. If you then reload the extension using the "Reload" button, the same ID will be used. If you then restart Firefox and load the add-on again, it will get a new ID.

If you turn the extension into an .xpi or .zip and install it through about:addons, it will not work. To have it work in this scenario, you will need to add in the applications key in manifest.json

**Syntax:**

```javascript
var myAddonId = browser.runtime.id;
```

**Value:**

A string representing the add-on ID. If the extension specified an ID in its applications manifest.json key, runtime.id will contain that value. Otherwise, runtime.id will contain the ID that was generated for the extension.

** Meaning **

- a unique identifier for the addon in all browsers on all clients
- can be chosen by INFOnline apparently himself
- no different ID for browser or clients with context-based uniqueness
- applies to all mozilla-based extensions


### Instance ID

https://developer.chrome.com/apps/instanceID

Retrieves an identifier for the app instance. The instance ID will be returned by the callback. The same ID will be returned as long as the application identity has not been revoked or expired.

```javascript
chrome.instanceID.getId(function (instanceID) {
    ...
})
```

**Rating:**

- API only seems to be available on the Chrome
- The ID is significantly shorter than the addon ID
     - z. Eg ey1Br5fV0LA (instance ID)
     - z. Eg glfdihaglkfpgoeikekgpiijidoffio (Addon ID)
