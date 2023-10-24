const cpubtn2 = document.getElementById('copypassword');
const conf2 =document.getElementById('confirm');
const pwd = document.getElementById('userPassword');
cpubtn2.addEventListener('click',()=>{
    navigator.clipboard.writeText(pwd.value);
    conf2.classList.add('active');
    setTimeout(()=>{
        conf2.classList.remove('active');
    },2000)
})