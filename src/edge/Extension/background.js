function loadScript(url, cb) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url);
  xmlhttp.onreadystatechange = function()
  {
    if (xmlhttp.status === 200 && xmlhttp.readyState === 4)
    {
      cb(xmlhttp.responseText);
    }
  };
  xmlhttp.send();
}

try {
  browser.runtime.onMessage.addListener(function (response, sender) {
    console.log(response, sender);
    var tabId = sender.tab.id;
    // Because of errors in the remote iam script we have to load the
    //
    browser.tabs.executeScript(tabId, {file: 'iam.js'})
      .then(function () {
        return browser.tabs.executeScript(tabId, {file: 'count.js'})
      })
      .catch(function (err) {
        console.error(err);
      });
  });
} catch (err) {
  console.error(err);
}
