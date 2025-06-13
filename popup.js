document.addEventListener("DOMContentLoaded", () => {
  const textList = document.getElementById("textList");
  const navigateToAddPage = document.getElementById("navigateToAddPage");
  let draggedItem = null;
  let texts = {};
  let order = [];

  // Add loading state
  function showLoading() {
    textList.innerHTML = '<div class="loading">Loading...</div>';
  }

  function hideLoading() {
    const loadingElement = textList.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Check storage permissions and load data
  showLoading();
  chrome.storage.sync.get(["texts", "order"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Storage error:", chrome.runtime.lastError);
      alert("Error accessing storage. Please check extension permissions.");
      hideLoading();
      return;
    }

    texts = result.texts || {};
    order = result.order || Object.keys(texts);
    renderTextList();
    hideLoading();
  });

  // Function to render the text list
  function renderTextList() {
    const fragment = document.createDocumentFragment();

    if (order.length === 0) {
      textList.innerHTML =
        '<div class="empty-state">No saved texts yet. Click "Add Text" to get started!</div>';
      return;
    }

    order.forEach((key) => {
      if (texts[key]) {
        const value = texts[key];
        const li = createListItem(key, value);
        fragment.appendChild(li);
      }
    });

    textList.innerHTML = "";
    textList.appendChild(fragment);
  }

  // Function to create a list item element
  function createListItem(key, value) {
    const li = document.createElement("li");
    li.classList.add("draggable");
    li.setAttribute("draggable", true);
    li.innerHTML = `
        <div class="textItem">
          <span class="textKey" data-value="${value}">${key}</span>
          <button class="deleteButton" data-key="${key}" title="Delete">&#128465;</button>
        </div>
      `;

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    return li;
  }

  // Copy text to clipboard
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

  // Delete text and update the order array
  textList.addEventListener("click", (event) => {
    if (event.target.classList.contains("deleteButton")) {
      const key = event.target.getAttribute("data-key");

      delete texts[key];
      order = order.filter((item) => item !== key);

      chrome.storage.sync.set({ texts, order }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving data:", chrome.runtime.lastError);
          alert("Error saving changes. Please try again.");
          return;
        }
        const li = event.target.closest("li");
        li.remove();
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
    event.preventDefault();
    const targetItem = event.target.closest(".draggable");
    if (targetItem && targetItem !== draggedItem) {
      textList.insertBefore(draggedItem, targetItem);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    saveReorderedTextsDebounced();
  }

  function handleDragEnd() {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  }

  // Debounced save function to avoid frequent storage writes
  const saveReorderedTextsDebounced = debounce(() => {
    const newOrder = Array.from(textList.querySelectorAll(".draggable")).map(
      (item) => item.querySelector(".textKey").textContent
    );

    order = newOrder;

    chrome.storage.sync.set({ order }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving order:", chrome.runtime.lastError);
      }
    });
  }, 500);

  // Debounce function to limit how often a function can be called
  function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }
});
