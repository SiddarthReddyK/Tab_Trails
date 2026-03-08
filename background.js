chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status !== "complete") return;
  if (!tab.url || tab.url.startsWith("chrome://")) return;
  if (tab.url === "about:blank") return;

  chrome.storage.local.get(["activeSession", "sessions"], (data) => {

    if (!data.activeSession) return;

    const sessionName = data.activeSession;
    const sessions = data.sessions || {};

    if (!sessions[sessionName]) {
      sessions[sessionName] = [];
    }

    // Block duplicate URLs and duplicate tab IDs
    const alreadySaved = sessions[sessionName].some(
      t => t.url === tab.url || t.id === tabId
    );
    if (alreadySaved) return;

    sessions[sessionName].push({
      id: tabId,
      url: tab.url,
      title: tab.title || "Untitled",
      note: ""
    });

    chrome.storage.local.set({ sessions });

  });

});