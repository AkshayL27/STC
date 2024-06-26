const token = localStorage.getItem('token');

if (token) {
    window.location.href = '../new.html';
}


const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const res = Object.fromEntries(formData);
    const payload = JSON.stringify(res);

    // Perform the signup request
    fetch('http://localhost:3000/signup', {
        method: "POST",
        body: payload,
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(signupResponse => signupResponse.json())
    .then(signupData => {
        console.log(signupData);

        // Perform the login request after the signup is successful
        return fetch('http://localhost:3000/login', {
            method: "POST",
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    })
    .then(loginResponse => loginResponse.json())
    .then(loginData => {
        const token = loginData.token; 
        console.log(token);
        localStorage.setItem('token', token);
        window.location.href = '../new.html';
    })
    .catch(error => {
        //console.error(error);
    });
});