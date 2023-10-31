const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const url = formData.get('url');
    const password = formData.get('password');

    // Check if any required field is empty
    if (!name || !url || !password) {
        // Display an error message to the user
        alert('Please fill in all required fields.');
        return; // Prevent the POST request if fields are empty
    }
    else{
        const cpubtn2 = document.getElementById('addpass');
        const conf2 =document.getElementById('confirm');
        cpubtn2.addEventListener('click',()=>{
            conf2.classList.add('active');
            setTimeout(()=>{
                conf2.classList.remove('active');
            },2000)
        });
    }
    // Create the "websiteData" object with the form data
    const websiteData = {
        name,
        url,
        password
    };

    const token = localStorage.getItem('token').toString();
    const payload = JSON.stringify({ websiteData });

    fetch('http://localhost:3000/website', {
        method: "POST",
        body: payload,
        headers: {
            'Content-Type': 'application/json',
            'authorization': token,
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response, if needed
        console.log('Response:', data);
    })
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


