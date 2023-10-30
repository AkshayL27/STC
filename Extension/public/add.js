const cpubtn2 = document.getElementById('addpassword');
const conf2 =document.getElementById('confirm');
cpubtn2.addEventListener('click',()=>{
    conf2.classList.add('active');
    setTimeout(()=>{
        conf2.classList.remove('active');
    },2000)
});

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

