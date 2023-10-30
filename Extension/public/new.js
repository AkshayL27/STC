const logout = document.getElementById('logout');

logout.addEventListener("click", function(e) {
    localStorage.removeItem("token");
    alert("You have been logged out");
    window.location.href = './signin/index.html';
});
