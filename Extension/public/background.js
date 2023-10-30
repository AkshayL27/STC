// background.js

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.showPopup) {
      // Show the extension popup (set the popup URL to get.html and pass the URL as a parameter)
      chrome.action.setPopup({ popup: 'get.html?url=' + encodeURIComponent(message.url) });
  }
});
