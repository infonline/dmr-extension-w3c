### INFOnline web extension (imarex)

#### Status

|Browser|Status        |
|-------|--------------|
|Chrome |running       |
|Edge   |running       |
|Firefox|not running   |
|Opera  |running       |
|Safari |not tested yet|

On Firefox there is a Bug in the web extension javascript api:

```javascript
browser.runtime.onMessage.addListener(function (response, sender) {
  console.log(response, sender);
  var tabId = sender.tab.id;
  loadScript("https://script.ioam.de/iam.js", function (code) {
    browser.tabs.executeScript(tabId, {code: code})
      .then(function () {
        browser.tabs.executeScript(tabId, {file: 'count.js'})
      })
      .catch(function (err) {
        throw err;
      });
  });
});
```

The injection of the iam.js triggers an error:

```
Error: 'addEventListener' called on an object that does not implement interface EventTarget.
```
