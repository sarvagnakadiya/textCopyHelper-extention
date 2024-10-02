document.addEventListener("DOMContentLoaded", () => {
  const textList = document.getElementById("textList");
  const navigateToAddPage = document.getElementById("navigateToAddPage");
  let draggedItem = null;

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
      li.classList.add("draggable");
      li.setAttribute("draggable", true); // Set the element as draggable
      li.innerHTML = `
          <div class="textItem">
            <span class="textKey" data-value="${value}">${key}</span>
            <button class="deleteButton" data-key="${key}" title="Delete">&#128465;</button>
          </div>
        `;
      textList.appendChild(li);

      // Add drag event listeners
      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragover", handleDragOver);
      li.addEventListener("drop", handleDrop);
      li.addEventListener("dragend", handleDragEnd);
    }
  }

  // Copy text to clipboard by clicking on the key
  textList.addEventListener("click", (event) => {
    if (event.target.classList.contains("textKey")) {
      const value = event.target.getAttribute("data-value");
      navigator.clipboard.writeText(value).then(() => {
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

  // Drag and Drop Handlers
  function handleDragStart(event) {
    draggedItem = event.target;
    setTimeout(() => {
      draggedItem.classList.add("dragging");
    }, 0);
  }

  function handleDragOver(event) {
    event.preventDefault(); // Allow dropping
    const targetItem = event.target.closest(".draggable");
    if (targetItem && targetItem !== draggedItem) {
      textList.insertBefore(draggedItem, targetItem);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    saveReorderedTexts();
  }

  function handleDragEnd() {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  }

  // Save reordered texts to chrome storage
  function saveReorderedTexts() {
    const newTexts = {};
    const items = textList.querySelectorAll(".draggable");
    items.forEach((item) => {
      const key = item.querySelector(".textKey").textContent;
      const value = item.querySelector(".textKey").getAttribute("data-value");
      newTexts[key] = value;
    });
    chrome.storage.sync.set({ texts: newTexts });
  }
});
