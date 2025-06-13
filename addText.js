document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("keyInput");
  const valueInput = document.getElementById("valueInput");
  const addButton = document.getElementById("addButton");

  // Check storage permissions
  chrome.storage.sync.get(null, (result) => {
    if (chrome.runtime.lastError) {
      console.error("Storage error:", chrome.runtime.lastError);
      alert("Error accessing storage. Please check extension permissions.");
      return;
    }
  });

  // Add new text
  addButton.addEventListener("click", () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      chrome.storage.sync.get(["texts", "order"], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error loading data:", chrome.runtime.lastError);
          alert("Error loading existing data. Please try again.");
          return;
        }

        const texts = result.texts || {};
        const order = result.order || [];

        // Check if key already exists
        if (texts[key]) {
          alert("This key already exists. Please use a different key.");
          return;
        }

        texts[key] = value;
        order.push(key);

        chrome.storage.sync.set({ texts, order }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving data:", chrome.runtime.lastError);
            alert("Error saving text. Please try again.");
            return;
          }
          alert("Text added successfully!");
          keyInput.value = "";
          valueInput.value = "";
        });
      });
    } else {
      alert("Please enter both key and value.");
    }
  });
});
