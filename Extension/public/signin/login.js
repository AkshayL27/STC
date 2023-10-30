const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const res = Object.fromEntries(formData);
    const payload = JSON.stringify(res);

    fetch('http://localhost:3000/login', {
        method: "POST",
        body: payload,
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to log in: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(loginData => {
        const token = loginData.token;
        console.log(token);

        // Go to another page with the token in the URL
        window.location.href = `../new.html?token=${token}`;
    })
    .catch(error => {
        console.error(`Error: ${error}`);
        // Handle the error, e.g., display an error message to the user
    });
});
