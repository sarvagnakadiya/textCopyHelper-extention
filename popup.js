document.addEventListener("DOMContentLoaded", () => {
  const textList = document.getElementById("textList");
  const navigateToAddPage = document.getElementById("navigateToAddPage");

  // Load texts from storage
  chrome.storage.sync.get(["texts"], (result) => {
    const texts = result.texts || {};
    renderTextList(texts);
  });

  // Function to render the text list
  function renderTextList(texts) {
    textList.innerHTML = "";
    for (const [key, value] of Object.entries(texts)) {
      const li = document.createElement("li");
      li.innerHTML = `
  <div class="textItem">
    <span class="textKey" data-value="${value}">${key}</span>
    <button class="deleteButton" data-key="${key}" title="Delete">&#128465;</button>
  </div>
`;

      textList.appendChild(li);
    }
  }

  // Copy text to clipboard by clicking on the key
  textList.addEventListener("click", (event) => {
    if (event.target.classList.contains("textKey")) {
      const value = event.target.getAttribute("data-value");
      navigator.clipboard.writeText(value).then(() => {
        // Provide visual feedback to the whole textItem
        const textItem = event.target.closest(".textItem");
        textItem.classList.add("copied");
        setTimeout(() => {
          textItem.classList.remove("copied");
        }, 1000);
      });
    }
  });

  // Delete text
  textList.addEventListener("click", (event) => {
    if (event.target.classList.contains("deleteButton")) {
      const key = event.target.getAttribute("data-key");
      chrome.storage.sync.get(["texts"], (result) => {
        const texts = result.texts || {};
        delete texts[key];
        chrome.storage.sync.set({ texts }, () => {
          renderTextList(texts);
        });
      });
    }
  });

  // Navigate to Add Text page
  navigateToAddPage.addEventListener("click", () => {
    chrome.tabs.create({ url: "addText.html" });
  });
});
