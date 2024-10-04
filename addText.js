document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("keyInput");
  const valueInput = document.getElementById("valueInput");
  const addButton = document.getElementById("addButton");

  // Add new text
  addButton.addEventListener("click", () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      chrome.storage.local.get(["texts", "order"], (result) => {
        const texts = result.texts || {};
        const order = result.order || [];

        texts[key] = value;
        order.push(key);

        chrome.storage.local.set({ texts, order }, () => {
          alert("Text added successfully!");
          keyInput.value = "";
          valueInput.value = "";
        });
      });
    }
  });
});
