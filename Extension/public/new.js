const logout = document.getElementById('logout');

logout.addEventListener("click", function(e) {
    alert("You will be logged out and all your passwords will be deleted.");
    localStorage.clear();
    chrome.storage.local.clear();
    window.location.href = './signin/index.html';
});
