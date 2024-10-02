document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("keyInput");
  const valueInput = document.getElementById("valueInput");
  const addButton = document.getElementById("addButton");

  // Add new text
  addButton.addEventListener("click", () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      chrome.storage.sync.get(["texts"], (result) => {
        const texts = result.texts || {};
        texts[key] = value;
        chrome.storage.sync.set({ texts }, () => {
          //   alert("Text added successfully!");
          keyInput.value = "";
          valueInput.value = "";
        });
      });
    }
  });
});
