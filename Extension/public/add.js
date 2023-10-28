const cpubtn2 = document.getElementById('addpassword');
const conf2 =document.getElementById('confirm');
cpubtn2.addEventListener('click',()=>{
    conf2.classList.add('active');
    setTimeout(()=>{
        conf2.classList.remove('active');
    },2000)
});
