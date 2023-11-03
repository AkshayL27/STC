// Get the input element and the option display element
const encryptionSwitch = document.querySelector('.checkbox-input');
const encryptiondisplay = document.querySelector('.text');

encryptionSwitch.addEventListener('change', function () {
    if (this.checked) {
        encryptiondisplay.innerText = 'AES';
    } else {
        encryptiondisplay.innerText = 'IDEA';
    }
});

const form = document.querySelector("form");

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const url = formData.get('url');
    const password = formData.get('password');

    if (!name || !url || !password) {
        alert('Please fill in all the fields.');
        return;
    }

    let encryptionKey;
    let encryptionType;

    if (encryptionSwitch.checked) {
        // Generate an AES encryption key
        window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        ).then((key) => {
            encryptionKey = key;
            encryptionType = "AES";
            // Now you can use the encryptionKey to encrypt the password
            useAesEncryption(name, url, password, encryptionKey, encryptionType);
        }).then((err) => {
            console.log(err);
        });
    } else {
        // Replace "yourIDEAKey" with the actual IDEA encryption key
        const ideaKey = "yourIDEAKey";
        encryptionKey = ideaKey;
        encryptionType = "IDEA";

        if (!ideaKey) {
            console.error('IDEA encryption key is missing. Please provide a valid key.');
            return;
        }

        // Now you can use the encryptionKey to encrypt the password with IDEA
        useIDEAEncryption(name, url, password, encryptionKey, encryptionType)
        .then((err) => {
            console.log(err);
        });
    }
});

function useAesEncryption(name, url, password, encryptionKey, encryptionType) {
    // Generate a random 12-byte IV (Initialization Vector)

    // Convert the password to a binary data array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Encrypt the password using AES-GCM
    window.crypto.subtle.encrypt(
            'AES-GCM',
            encryptionKey, // Use the provided encryption key
            passwordData
    ).then((encryptedPassword) => {
        addWebsiteEntry(name, url, encryptedPassword, encryptionKey, encryptionType); // Store IV + encrypted password
    });
}


function useIDEAEncryption(name, url, password, encryptionKey, encryptionType) {

    // Check if IDEA key is provided
    if (!encryptionKey) {
        console.error('IDEA encryption key is missing. Please provide a valid key.');
        return;
    }

    try {
        // Encrypt the password with IDEA using the provided key
        const encryptedPassword = encryptWithIDEA(password, encryptionKey);
        addWebsiteEntry(name, url, passwordData, encryptionKey, encryptionType);
        console.log('Password Encrypted:', name, url, encryptedPassword, encryptionType);
        // If you want to send the encrypted data to a server, you can do it here
    } catch (error) {
        console.error('IDEA encryption failed:', error);
    }
}

function encryptWithIDEA(data, ideaKey) {
    if (!ideaKey || ideaKey.length !== 16) {
        console.error('IDEA encryption key is missing or invalid.');
        return null;
    }

    const dataBytes = data.split('').map(char => char.charCodeAt(0));
    const keyBytes = ideaKey.split('').map(char => char.charCodeAt(0));

    if (dataBytes.length % 8 !== 0) {
        console.error('Data length must be a multiple of 8 for IDEA encryption.');
        return null;
    }

    const encryptedData = [];

    for (let i = 0; i < dataBytes.length; i += 8) {
        const chunk = dataBytes.slice(i, i + 8);
        const subKeys = generateSubKeys(keyBytes);

        let x1 = chunk[0] << 8 | chunk[1];
        let x2 = chunk[2] << 8 | chunk[3];
        let x3 = chunk[4] << 8 | chunk[5];
        let x4 = chunk[6] << 8 | chunk[7];

        for (let round = 0; round < 8; round++) {
            x1 = multiply(x1, subKeys[round][0]);
            x2 += subKeys[round][1];
            x3 += subKeys[round][2];
            x4 = multiply(x4, subKeys[round][3]);

            const temp = x1;
            x1 = x2 ^ x4;
            x2 = x3 ^ temp;
            x3 = x2 + x1;
            x4 = x3 ^ x1;

            x2 = multiply(x2, subKeys[round][4]);
            x3 += subKeys[round][5];
            x4 += subKeys[round][6];
            x1 = multiply(x1, subKeys[round][7]);
        }

        encryptedData.push((x1 >> 8) & 0xff, x1 & 0xff, (x2 >> 8) & 0xff, x2 & 0xff, (x3 >> 8) & 0xff, x3 & 0xff, (x4 >> 8) & 0xff, x4 & 0xff);
    }

    return String.fromCharCode(...encryptedData);
}

function multiply(a, b) {
    if (a === 0) a = 0x10000 - b;
    if (b === 0) b = 0x10000 - a;

    const result = (a * b) % 0x10001;
    return result === 0x10000 ? 0 : result;
}

function generateSubKeys(keyBytes) {
    const subKeys = [];

    for (let round = 0; round < 8; round++) {
        const subKey = [];

        for (let i = 0; i < 6; i++) {
            subKey.push(keyBytes[(round * 6 + i) % 8]);
        }

        subKeys.push(subKey);
    }

    return subKeys;
}

function addWebsiteEntry(name, url, encryptedPassword, encryptionKey, encryptionType) {
    const websiteData = {
        name,
        url,
        password: encryptedPassword,
        type: encryptionType,
        key: encryptionKey,
    };

    // Get the existing websites data from local storage
    chrome.storage.local.get('websites', (result) => {
        const websites = result.websites || [];

        // Check for collisions based on name or URL
        const isCollision = websites.some((website) => {
            return website.name === name || website.url === url;
        });

        if (isCollision) {
            alert('There already exists same Name or Url')
        } else {
            // Add the new website data to the array
            websites.push(websiteData);

            // Store the updated list of websites back in local storage
            chrome.storage.local.set({ websites }, () => {
                const conf2 =document.getElementById('confirm');
                conf2.classList.add('active');
                setTimeout(()=>{
                    conf2.classList.remove('active');
                },10000)
                console.log('Password stored locally.');
            });
        }
    });
}


const getWebsiteButton = document.getElementById('getwebsite');
const websiteUrlInput = document.querySelector('input[name="url"]');

getWebsiteButton.addEventListener('click', () => {
    // Use the browser's built-in API to get the current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentUrl = tabs[0].url;
            websiteUrlInput.value = currentUrl;
        }
    });
});