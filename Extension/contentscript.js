// Define a function to send a request using the background script
function sendRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
        {
            action: 'makeRequest',
            url: path,
            method: method,
            headers: {
                'Content-Type': 'application/json', // Set headers as needed
            // Add other headers if required
          },
          body: JSON.stringify(data),
        },
        function (response) {
          if (!response.error) {
            resolve(response);
          } else {
            reject(response.error);
          }
        }
      );
    });
}