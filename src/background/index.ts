// Background service worker for Close CRM Extractor
console.log("Background service worker initialized");

// Track ongoing extractions per tab to prevent race conditions
const extractionStates = new Map<number, boolean>();

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Message received:", message.type, "from tab:", sender.tab?.id);

  try {
    if (message.type === 'EXTRACT_STATUS') {
      // Return current extraction state for a tab
      const tabId = sender.tab?.id;
      const isExtracting = tabId ? extractionStates.get(tabId) ?? false : false;
      sendResponse({ isExtracting });
      return true;
    }

    if (message.type === 'EXTRACTION_STARTED') {
      // Content script signals extraction began
      const tabId = sender.tab?.id;
      if (tabId) {
        extractionStates.set(tabId, true);
        console.log(`[Background] Extraction started on tab ${tabId}`);
      }
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'EXTRACTION_COMPLETED') {
      // Content script signals extraction finished
      const tabId = sender.tab?.id;
      if (tabId) {
        extractionStates.delete(tabId);
        console.log(`[Background] Extraction completed on tab ${tabId}. Count: ${message.count}`);
      }
      sendResponse({ success: true });
      return true;
    }

    if (message.type === 'CLEAR_DATA') {
      // Popup requests data clear
      chrome.storage.local.remove('close_data', () => {
        console.log("[Background] Data cleared");
        sendResponse({ success: true });
        // Notify all tabs that data was cleared
        notifyAllTabs({ type: 'DATA_CLEARED' });
      });
      return true;
    }

    // Unknown message type
    sendResponse({ error: 'Unknown message type' });
  } catch (error) {
    console.error("[Background] Error handling message:", error);
    sendResponse({ error: String(error) });
  }
});

// Notify all tabs of a storage event
const notifyAllTabs = (message: any) => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab may not be reachable; ignore
        });
      }
    });
  });
};

// Clean up extraction state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  extractionStates.delete(tabId);
  console.log(`[Background] Cleaned up extraction state for closed tab ${tabId}`);
});