chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ texts: {}, order: [] }, () => {
    // console.log("Storage initialized.");
  });
});
