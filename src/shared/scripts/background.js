function loadScript(url, cb) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', url);
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
      cb(xmlhttp.responseText);
    }
  };
  xmlhttp.send();
}


chrome.runtime.onMessage.addListener((response, sender) => {
  const tabId = sender.tab.id;
  loadScript('https://script.ioam.de/iam.js', (code) => {
    chrome.tabs.executeScript(tabId, { code }, () => {
      if (chrome.runtime.lastError) {
        throw Error(`Unable to inject iam script into tab ${tabId}`);
      } else {
        chrome.tabs.executeScript(tabId, { file: 'count.js' }, () => {
          if (chrome.runtime.lastError) {
            throw Error(`Unable to inject count script into tab ${tabId}`);
          }
        });
      }
    });
  });
});
