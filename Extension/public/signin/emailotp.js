document.getElementById('send-otp-btn').addEventListener('click', sendOTP);

function sendOTP() {
    const email = document.getElementById('email');
    const otpverify = document.getElementsByClassName('otpverify')[0];
 
    let otp_val = Math.floor(Math.random() * 10000);
 
    let emailbody = `<h2>Your OTP is </h2>${otp_val}`;
    Email.send({
    SecureToken : "809817fc-e770-4d70-a193-b22f93077669",
    To : email.value,
    From : "meshramayush750@gmail.com",
    Subject : "Email OTP using JavaScript",
    Body : emailbody,
 }).then(
 
    message => {
        if (message === "OK") {
            alert("OTP sent to your email " + email.value);
 
            otpverify.style.display = "flex";
            const otp_inp = document.getElementById('otp_inp');
            const otp_btn = document.getElementById('otp-btn');
 
            otp_btn.addEventListener('click', () => {
                if (otp_inp.value == otp_val) {
                    alert("Email address verified...");
                }
                else {
                    alert("Invalid OTP");
                }
            })
        }
    }
 );
}

var Email = { send: function (a) { 
    return new Promise(function (n, e) { 
        a.nocache = Math.floor(1e6 * Math.random() + 1), 
        a.Action = "Send"; var t = JSON.stringify(a); 
        Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { 
            n(e) 
        }) 
    }) 
}, 
ajaxPost: function (e, n, t) { 
    var a = Email.createCORSRequest("POST", e); 
    a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), 
    a.onload = function () { var e = a.responseText; null != t && t(e) 
    }, 
    a.send(n) 
}, 
ajax: function (e, n) { 
    var t = Email.createCORSRequest("GET", e); 
    t.onload = function () { 
        var e = t.responseText; null != n && n(e) 
    }, 
    t.send() 
}, 
createCORSRequest: function (e, n) { 
    var t = new XMLHttpRequest; 
    return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t 
} 
};
 
 