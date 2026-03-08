document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("sessionInput");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const activeLabel = document.getElementById("activeLabel");
  const timeline = document.getElementById("timeline");

  // Load active session on popup open
  chrome.storage.local.get(["activeSession", "sessions"], (data) => {
    if (data.activeSession) {
      activeLabel.textContent = "Trail active: " + data.activeSession;
      stopBtn.style.display = "block";
      displayTimeline(data.sessions, data.activeSession);
    } else {
      stopBtn.style.display = "none";
    }
  });

  // Start trail
  startBtn.addEventListener("click", () => {
    const sessionName = input.value.trim();
    if (sessionName === "") return;

    chrome.storage.local.set({ activeSession: sessionName }, () => {
      activeLabel.textContent = "Trail active: " + sessionName;
      input.value = "";
      stopBtn.style.display = "block";
      timeline.innerHTML = "";
    });
  });

  // Stop trail
  stopBtn.addEventListener("click", () => {
    chrome.storage.local.remove("activeSession", () => {
      activeLabel.textContent = "No active session";
      stopBtn.style.display = "none";
      timeline.innerHTML = "";
    });
  });

  // Display vertical timeline
  function displayTimeline(sessions, activeSession) {
    if (!sessions || !sessions[activeSession]) return;

    const tabs = sessions[activeSession];
    timeline.innerHTML = "";

    tabs.forEach((tab, index) => {
      // Node
      const node = document.createElement("div");
      node.className = "node";

      node.innerHTML = `
        <div class="node-content">
          <button class="delete-btn" data-index="${index}">x</button>
          <img src="https://www.google.com/s2/favicons?domain=${tab.url}" />
          <div class="node-info">
            <p class="node-title">${tab.title || "New Tab"}</p>
            <input 
              class="note-input" 
              placeholder="why this tab..." 
              value="${tab.note || ""}"
              data-index="${index}"
            />
          </div>
        </div>
      `;

      // Save note on typing
      node.querySelector(".note-input").addEventListener("input", (e) => {
        const i = e.target.dataset.index;
        chrome.storage.local.get(["activeSession", "sessions"], (data) => {
          data.sessions[data.activeSession][i].note = e.target.value;
          chrome.storage.local.set({ sessions: data.sessions });
        });
      });

      // Delete tab
      node.querySelector(".delete-btn").addEventListener("click", (e) => {
        const i = parseInt(e.target.dataset.index);
        chrome.storage.local.get(["activeSession", "sessions"], (data) => {
          data.sessions[data.activeSession].splice(i, 1);
          chrome.storage.local.set({ sessions: data.sessions }, () => {
            chrome.storage.local.get(["activeSession", "sessions"], (fresh) => {
              displayTimeline(fresh.sessions, fresh.activeSession);
            });
          });
        });
      });

      timeline.appendChild(node);

      // Connector line between nodes
      if (index < tabs.length - 1) {
        const connector = document.createElement("div");
        connector.className = "connector";
        timeline.appendChild(connector);
      }
    });
  }

});