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


chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  console.log(response, sender);
  var tabId = sender.tab.id;
  loadScript("https://script.ioam.de/iam.js", function (code) {
    chrome.tabs.executeScript(tabId, {code: code}, function (){
      if(chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        throw Error("Unable to inject iam script into tab " + tabId);
      } else {
        chrome.tabs.executeScript(tabId, {file: "count.js"}, function (){
          if(chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            throw Error("Unable to inject count script into tab " + tabId);
          }
        });
      }
    });
  });
});
