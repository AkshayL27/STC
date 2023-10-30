const cpubtn2 = document.getElementById('copypassword');
const conf2 =document.getElementById('confirm');
const pwd = document.getElementById('userPassword');
cpubtn2.addEventListener('click',()=>{
    navigator.clipboard.writeText(pwd.value);
    conf2.classList.add('active');
    setTimeout(()=>{
        conf2.classList.remove('active');
    },2000)
});

// get.js

const urlParams = new URLSearchParams(window.location.search);
const urll = urlParams.get('url');

if (urll) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3000/website/${encodeURIComponent(urll)}`, {
        method: 'GET',
        headers: {
            'authorization': token,
        }
    })
    .then(response => response.json())
    .then(data => {
        const userPassword = document.querySelector('.generatedPassword');
        userPassword.value = data.password;
    })
    .catch(error => {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error('Network error:', error);
        } 
        else {
            console.error('Error:', error);
            if (response.status === 404) {
                // Make a website not found error page
                console.error('Resource not found (404)');
            }
        }
    });
}


const form = document.querySelector('form');
form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('websiteName');
    const url = formData.get('websiteUrl');
    const token = localStorage.getItem('token').toString();


    if (!name && !url) {
        alert('Please enter atleast one of the fields');
        return;
    }
    else if (!url) {
        fetch(`http://localhost:3000/website/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'authorization': token,
            }
        })
        .then(response => response.json())
        .then(data => {
            const userPassword = document.querySelector('.generatedPassword');
            userPassword.value = data.password;
        })
        .catch(error => {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network error:', error);
            } else {
                console.error('Error:', error);
                if (response.status === 404) {

                    // Make a website not found error page
                    console.error('Resource not found (404)');
                }
            }
        });
    }
    else if (!name) {
        fetch(`http://localhost:3000/website/${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'authorization': token,
            }
        })
        .then(response => response.json())
        .then(data => {
            const userPassword = document.querySelector('.generatedPassword');
            userPassword.value = data.password;
        })
        .catch(error => {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network error:', error);
            } else {
                console.error('Error:', error);
                if (response.status === 404) {

                    // Make a website not found error page
                    console.error('Resource not found (404)');
                }
            }
        });
    }
    else {
        var pass1,pass2;
        fetch(`http://localhost:3000/website/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'authorization': token,
            }
        })
        .then(response => response.json())
        .then(data => {
            pass1 = data.password;
        })
        .catch(error => {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network error:', error);
            } else {
                console.error('Error:', error);
                if (response.status === 404) {

                    // Make a website not found error page
                    console.error('Resource not found (404)');
                }
            }
        });

        fetch(`http://localhost:3000/website/${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'authorization': token,
            }
        })
        .then(response => response.json())
        .then(data => {
            pass1 = data.password;
        })
        .catch(error => {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('Network error:', error);
            } else {
                console.error('Error:', error);
                if (response.status === 404) {

                    // Make a website not found error page
                    console.error('Resource not found (404)');
                }
            }
        });

        if (var1 === var2) {
            const userPassword = document.querySelector('.generatedPassword');
            userPassword.value = data.password;
        }
        else {
            // Add a page for 2 diffrent passwords not being same as you have provided url as well as name
        }
    }
});