document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect');
  const connectTabBtn = document.getElementById('connect-tab');
  const focusTabBtn = document.getElementById('focus-tab');
  const disconnectBtn = document.getElementById('disconnect');
  const statusDiv = document.getElementById('status');

  function refreshUIForActiveTab() {
    chrome.runtime.sendMessage({ cmd: 'getStatus' }, (statusResponse) => {
      const isServerConnected = statusResponse && statusResponse.status === 'connected';
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab) return;

        chrome.storage.local.get('connectedTabId', (data) => {
          const connectedTabId = data.connectedTabId;
          const hasConnectedTab = Boolean(connectedTabId);

          if (connectedTabId && connectedTabId !== currentTab.id) {
            // Connected elsewhere: offer switch + focus, show disconnect if any tab is marked connected
            connectBtn.classList.add('hidden');
            connectTabBtn.classList.remove('hidden');
            focusTabBtn.classList.remove('hidden');
            disconnectBtn.classList.toggle('hidden', !hasConnectedTab);
            statusDiv.textContent = 'Connected on another tab';
            statusDiv.className = 'status-connected';
          } else if (connectedTabId === currentTab.id) {
            // Connected here: hide connect/switch/focus; show disconnect if any tab is marked connected
            connectBtn.classList.add('hidden');
            connectTabBtn.classList.add('hidden');
            focusTabBtn.classList.add('hidden');
            disconnectBtn.classList.toggle('hidden', !hasConnectedTab);
            statusDiv.textContent = isServerConnected ? 'Connected on this tab' : 'Connecting...';
            statusDiv.className = isServerConnected ? 'status-connected' : 'status-disconnected';
          } else {
            // Not connected anywhere yet
            connectBtn.classList.remove('hidden');
            connectTabBtn.classList.add('hidden');
            focusTabBtn.classList.add('hidden');
            disconnectBtn.classList.add('hidden');
            statusDiv.textContent = 'Disconnected';
            statusDiv.className = 'status-disconnected';
          }
        });
      });
    });
  }

  // Initial paint
  refreshUIForActiveTab();

  // Connect to MCP Server (save current tab as connected)
  connectBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Connecting...';
    statusDiv.className = 'status-disconnected';

    chrome.runtime.sendMessage({ cmd: 'connect' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        statusDiv.textContent = 'Connection failed';
        statusDiv.className = 'status-disconnected';
        return;
      }

      // On successful background connection, mark this tab as the connected one
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.storage.local.set({ connectedTabId: tabs[0].id }, () => {
          statusDiv.textContent = 'Connected on this tab';
          statusDiv.className = 'status-connected';

          connectBtn.classList.add('hidden');
          connectTabBtn.classList.add('hidden');
          focusTabBtn.classList.add('hidden');
        });
      });
    });
  });

  // Switch connection to current tab
  connectTabBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.storage.local.set({ connectedTabId: tabs[0].id }, () => {
        statusDiv.textContent = 'Switched connection to this tab';
        statusDiv.className = 'status-connected';

        connectBtn.classList.add('hidden');
        connectTabBtn.classList.add('hidden');
        focusTabBtn.classList.add('hidden');
        disconnectBtn.classList.remove('hidden');
      });
    });
  });

  // Focus back to connected tab
  focusTabBtn.addEventListener('click', () => {
    chrome.storage.local.get('connectedTabId', (data) => {
      if (data.connectedTabId) {
        chrome.tabs.update(data.connectedTabId, { active: true });
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, { focused: true });
      }
    });
  });

  // Disconnect from MCP Server
  disconnectBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ cmd: 'disconnect' }, (_response) => {
      // Clear stored connection
      chrome.storage.local.remove('connectedTabId', () => {
        statusDiv.textContent = 'Disconnected';
        statusDiv.className = 'status-disconnected';
        refreshUIForActiveTab();
      });
    });
  });

  // Reflect background status updates in the popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.status) {
      switch (message.status) {
        case 'Connected':
          statusDiv.textContent = 'Connected to MCP Server';
          statusDiv.className = 'status-connected';
          refreshUIForActiveTab();
          break;
        case 'Disconnected':
          statusDiv.textContent = 'Disconnected';
          statusDiv.className = 'status-disconnected';
          refreshUIForActiveTab();
          break;
        case 'WebSocket error':
          statusDiv.textContent = 'WebSocket connection error';
          statusDiv.className = 'status-disconnected';
          refreshUIForActiveTab();
          break;
        case 'Failed to open WebSocket':
          statusDiv.textContent = 'Failed to connect to MCP server';
          statusDiv.className = 'status-disconnected';
          refreshUIForActiveTab();
          break;
        default:
          statusDiv.textContent = message.status;
          statusDiv.className = 'status-disconnected';
          refreshUIForActiveTab();
      }
    }
  });

  // When the active tab changes while popup is open, reflect correct buttons
  chrome.tabs.onActivated.addListener(() => {
    refreshUIForActiveTab();
  });

  // When the active tab finishes loading, re-evaluate UI (optional but helps)
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === 'complete') {
      refreshUIForActiveTab();
    }
  });

  // If storage value changes in background or another popup, refresh
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.connectedTabId) {
      refreshUIForActiveTab();
    }
  });
});



