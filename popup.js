document.addEventListener("DOMContentLoaded", () => {
  const textList = document.getElementById("textList");
  const navigateToAddPage = document.getElementById("navigateToAddPage");
  let draggedItem = null;
  let texts = {};
  let order = [];

  // Load texts and order from storage
  chrome.storage.local.get(["texts", "order"], (result) => {
    // console.log("Loaded from local storage:", result);
    texts = result.texts || {};
    order = result.order || Object.keys(texts);
    renderTextList();
  });

  // Function to render the text list
  function renderTextList() {
    const fragment = document.createDocumentFragment();

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

      chrome.storage.local.set({ texts, order }, () => {
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

    chrome.storage.local.set({ order });
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
