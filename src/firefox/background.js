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
