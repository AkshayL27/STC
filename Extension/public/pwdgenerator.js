const digits =[0,1,2,3,4,5,6,7,8,9];
const specials = ['!', '?','/','_','-','@','#','$','&','%'];
const letterLowerCase = [...Array(26)].map((_, i) =>String.fromCharCode(i+97));
const letterUpperCase = letterLowerCase.map(letter=> letter.toUpperCase());
let generatedPassword = document.getElementById("generatedPassword").value;

const generatePassword = (lenght) => {
    var includeUppercase = document.getElementById("uppercaseCheckbox").checked;
    var includeLowercase = document.getElementById("lowercaseCheckbox").checked;
    var includeNumbers = document.getElementById("numbersCheckbox").checked;
    var includeSymbols = document.getElementById("symbolsCheckbox").checked;
    generatedPassword = ' ';
    let possiblePwdChar = ['.'];
    if(includeNumbers===true) digits.forEach(digits => possiblePwdChar.push(digits));
    if(includeSymbols===true) specials.forEach(specials => possiblePwdChar.push(specials));
    if(includeLowercase===true) letterLowerCase.forEach(letter => possiblePwdChar.push(letter));
    if(includeUppercase===true) letterUpperCase.forEach(letter => possiblePwdChar.push(letter));
    for(let i = 0; i <= lenght; i++) {
        generatedPassword+=possiblePwdChar[Math.floor(Math.random()*possiblePwdChar.length)];
    }
    document.getElementById("generatedPassword").value=generatedPassword;
};

let click=false;
document.getElementById("generatePassword").addEventListener("click", ()=>{
    click=!click;
    if(click){
        generatePassword(13);
        click=!click;
    }
});

const cpubtn = document.getElementById('copy-password');
const conf =document.getElementById('confirmation');
cpubtn.addEventListener('click',()=>{
    navigator.clipboard.writeText(generatedPassword);
    conf.classList.add('active');
    setTimeout(()=>{
        conf.classList.remove('active');
    },2000)
})