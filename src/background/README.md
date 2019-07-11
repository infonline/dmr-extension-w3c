### Background script

---

This is the background script of the extension. The script hosts the backend logic of the extension. It will emit count instruction messages to the content scripts when observed a countable navigation event in the browser. It will also provide the central messaging system which dispatches and processes a message from content script, extension popup and an open browser tab.
