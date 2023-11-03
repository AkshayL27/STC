// List of URLs you want to match against
var urlsToMatch;
const token = localStorage.getItem('token');

fetch('http://localhost:3000/weburls', {
    method: 'GET',
    headers: {
        'authorization': token,
    }
})
    .then(response => response.json())
    .then(response => {
        urlsToMatch = response.websites;
    })
    .catch(err => {
        console.error(err);
    })

const currentURL = window.location.href;

if (urlsToMatch.includes(currentURL)) {
    chrome.runtime.sendMessage({ showPopup: true, url: currentURL });
}
  