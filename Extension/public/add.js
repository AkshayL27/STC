const cpubtn2 = document.getElementById('addpassword');
const conf2 =document.getElementById('confirm');

const token = localStorage.getItem('token').toString();

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const res = Object.fromEntries(formData);
    const payload = JSON.stringify(res);

    fetch('http://localhost:3000/website', {
        method: "POST",
        body: payload,
        headers: {
            'authorization': token,
        }
    })
    .then(response => response.json)
    .then()
    .catch(error => {
        console.error(`Error: ${error}`);
        // Handle the error, e.g., display an error message to the user
    });
});

const getWebsiteButton = document.getElementById('getwebsite');
const websiteUrlInput = document.querySelector('input[name="url"]');

getWebsiteButton.addEventListener('click', () => {
    // Use the browser's built-in API to get the current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentUrl = tabs[0].url;
            websiteUrlInput.value = currentUrl;
        }
    });
});
