// Initialize storage when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["texts", "order"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error initializing storage:", chrome.runtime.lastError);
      return;
    }

    // If no data exists, initialize with empty objects
    if (!result.texts) {
      chrome.storage.sync.set({
        texts: {},
        order: [],
      });
    }
  });
});

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  // Ensure data is properly loaded
  chrome.storage.sync.get(["texts", "order"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading data on startup:", chrome.runtime.lastError);
      return;
    }
  });
});
