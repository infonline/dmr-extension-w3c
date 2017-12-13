var port = chrome.extension.connect({
  name: 'Imarex'
});
port.onMessage.addListener(function(msg) {
  console.log("message recieved:" + msg);
});
