const getPasswordButton = document.getElementById('getPassword');
const form = document.querySelector('form');


form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("websiteName");
  const url = formData.get("websiteUrl");
    if (!url) {
        // Retrieve the websites data from local storage
        chrome.storage.local.get('websites', (result) => {
        const websites = result.websites || [];

        // Find the website entry by name
        const website = websites.find((entry) => entry.name === name);

        if (!website) {
          alert('No password found for the specified Name.');
          return;
        }

        const encryptedPassword = website.password;
        const encryptionType = website.type;
        const encryptionKey = website.key;

        if (encryptionType === "AES") {
          // Decrypt the password using AES
          decryptAesPassword(encryptedPassword, encryptionKey);
        } else if (encryptionType === "IDEA") {
          // Decrypt the password using IDEA
          decryptIdeaPassword(encryptedPassword, encryptionKey);
        }
      });
    }
    else if (!name) {
      // Retrieve the websites data from local storage
    chrome.storage.local.get('websites', (result) => {
      const websites = result.websites || [];

      // Find the website entry by URL
    const website = websites.find((entry) => entry.url === url);

      if (!website) {
        alert('No password found for the specified URL.');
        return;
      }

      const encryptedPassword = website.password;
      const encryptionType = website.type;
      const encryptionKey = website.key;

      if (encryptionType === "AES") {
        // Decrypt the password using AES
        decryptAesPassword(encryptedPassword, encryptionKey);
      } else if (encryptionType === "IDEA") {
        // Decrypt the password using IDEA
        decryptIdeaPassword(encryptedPassword, encryptionKey);
      }
    });

    }
});

function decryptAesPassword(encryptedData, encryptionKey) {
  // Decrypt the password using AES-GCM
  window.crypto.subtle.decrypt(
      { name: 'AES-GCM',
        encryptionKey,
        encryptedData
      } 
  ).then((decryptedPassword) => {
      const decoder = new TextDecoder();
      
      const password = decoder.decode(decryptedPassword);
      const userPassword = document.querySelector('.generatedPassword');
      userPassword.value = password;
  }).catch((error) => {
      alert(error);
      console.error('AES decryption error:', error);
  });
}


function decryptIdeaPassword(encryptedPassword, encryptionKey) {
  // Replace "yourIDEAKey" with the actual IDEA encryption key
  const ideaKey = "yourIDEAKey";

  // Check if IDEA key is provided
  if (!ideaKey) {
    console.error('IDEA encryption key is missing. Please provide a valid key.');
    return;
  }

  try {
    // Decrypt the IDEA password using the provided key
    const decryptedPassword = decryptWithIDEA(encryptedPassword, ideaKey);
    const userPassword = document.querySelector('.generatedPassword');
    userPassword.value = decryptedPassword;
  } catch (error) {
    console.error('IDEA decryption failed:', error);
  }
}

function decryptWithIDEA(encryptedPassword, ideaKey) {
    if (!ideaKey || ideaKey.length !== 16) {
      console.error('IDEA decryption key is missing or invalid.');
      return null;
    }
  
    try {
      const encryptedBytes = Array.from(encryptedPassword).map(char => char.charCodeAt(0));
      const keyBytes = ideaKey.split('').map(char => char.charCodeAt(0));
  
      if (encryptedBytes.length % 8 !== 0) {
        console.error('Encrypted data length must be a multiple of 8 for IDEA decryption.');
        return null;
      }
  
      const decryptedData = [];
  
      for (let i = 0; i < encryptedBytes.length; i += 8) {
        const chunk = encryptedBytes.slice(i, i + 8);
        const subKeys = generateSubKeys(keyBytes);
  
        let x1 = chunk[0] << 8 | chunk[1];
        let x2 = chunk[2] << 8 | chunk[3];
        let x3 = chunk[4] << 8 | chunk[5];
        let x4 = chunk[6] << 8 | chunk[7];
  
        for (let round = 7; round >= 0; round--) { // Decryption works in reverse order
          let temp = x4;
          x4 = x3;
          x3 = x2;
          x2 = x1;
          x1 = temp;
  
          x1 = multiply(x1, modInverse(subKeys[round][0], 0x10001));
          x2 = (x2 - subKeys[round][1] + 0x10001) % 0x10001;
          x3 = (x3 - subKeys[round][2] + 0x10001) % 0x10001;
          x4 = multiply(x4, modInverse(subKeys[round][3], 0x10001));
  
          temp = x4;
          x4 = x2;
          x2 = x1;
          x1 = x3;
          x3 = temp;
  
          x1 = multiply(x1, modInverse(subKeys[round][4], 0x10001));
          x2 = (x2 - subKeys[round][5] + 0x10001) % 0x10001;
          x3 = (x3 - subKeys[round][6] + 0x10001) % 0x10001;
          x4 = multiply(x4, modInverse(subKeys[round][7], 0x10001));
        }
  
        decryptedData.push((x1 >> 8) & 0xff, x1 & 0xff, (x2 >> 8) & 0xff, x2 & 0xff, (x3 >> 8) & 0xff, x3 & 0xff, (x4 >> 8) & 0xff, x4 & 0xff);
      }
  
      const decryptedPassword = String.fromCharCode(...decryptedData);
      return decryptedPassword;
    } catch (error) {
      console.error('IDEA decryption failed:', error);
      return null;
    }
  }
  
  function multiply(a, b) {
    if (a === 0) a = 0x10000 - b;
    if (b === 0) b = 0x10000 - a;
  
    const result = (a * b) % 0x10001;
    return result === 0x10000 ? 0 : result;
  }
  
  function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) {
        return x;
      }
    }
    return 0;
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
  
