let ws = null;
let activeTabId = null;
let reconnectAttempts = 0;
let lastErrorMessage = '';
let serverUrl = 'ws://127.0.0.1:29100';

// ---------- Chrome API helpers (callback-based, safe in MV3) ----------
function tabsQuery(queryInfo) {
  return new Promise((resolve) => chrome.tabs.query(queryInfo, (tabs) => resolve(tabs || [])));
}
function tabsUpdate(tabId, updateProps) {
  return new Promise((resolve) => chrome.tabs.update(tabId, updateProps, (tab) => resolve(tab)));
}
function scriptingExecuteScript(args) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(args, (results) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(results || []);
    });
  });
}
function windowsGetAll() {
  return new Promise((resolve) => chrome.windows.getAll({}, (wins) => resolve(wins || [])));
}

function sendPopupStatus(status) {
  // Use callback to absorb "Receiving end does not exist" when popup isn't open
  try {
    chrome.runtime.sendMessage({ status }, () => {
      // Accessing lastError prevents the uncaught promise rejection
      // when there are no listeners (e.g., popup closed)
      void chrome.runtime.lastError;
    });
  } catch (_err) {
    // ignore sync errors just in case
  }
}

// Auto-reconnect disabled; manual connect only

async function getActiveTabId() {
  if (!activeTabId) {
    const tabs = await tabsQuery({ active: true, currentWindow: true });
    const tab = tabs[0];
    activeTabId = tab && tab.id;
  }
  return activeTabId;
}

async function updateActiveTab() {
  const tabs = await tabsQuery({ active: true, currentWindow: true });
  const tab = tabs[0];
  activeTabId = tab && tab.id;
  return activeTabId;
}

async function exec(tabId, func, args = []) {
  try {
    const results = await scriptingExecuteScript({ target: { tabId }, func, args });
    const first = results && results[0];
    return first ? first.result : null;
  } catch (error) {
    console.error('Script execution error:', error);
    return null;
  }
}

// Handle messages from the MCP server
function handleMCPMessage(message) {
  try {
    const { type, payload } = message;
    console.log('Received MCP message:', type, payload);
    
    switch (type) {
      case 'browser_navigate':
        handleNavigate(payload);
        break;
      case 'browser_go_back':
        handleGoBack();
        break;
      case 'browser_go_forward':
        handleGoForward();
        break;
      case 'browser_wait':
        handleWait(payload);
        break;
      case 'browser_click':
        handleClick(payload);
        break;
      case 'browser_type':
        handleType(payload);
        break;
      case 'browser_hover':
        handleHover(payload);
        break;
      case 'browser_snapshot':
        handleSnapshot();
        break;
      default:
        console.log('Unknown message type:', type);
    }
  } catch (error) {
    console.error('Error handling MCP message:', error);
    lastErrorMessage = String(error?.message || error);
  }
}

async function handleNavigate(payload) {
  const tabId = await getActiveTabId();
  if (tabId && payload.url) {
    await tabsUpdate(tabId, { url: payload.url });
    sendResult('browser_navigate', true);
  }
}

async function handleGoBack() {
  const tabId = await getActiveTabId();
  if (tabId) {
    await exec(tabId, () => { history.back(); });
    sendResult('browser_go_back', true);
  }
}

async function handleGoForward() {
  const tabId = await getActiveTabId();
  if (tabId) {
    await exec(tabId, () => { history.forward(); });
    sendResult('browser_go_forward', true);
  }
}

async function handleWait(payload) {
  const time = payload?.time || 1;
  await new Promise(resolve => setTimeout(resolve, time * 1000));
  sendResult('browser_wait', true);
}

async function handleClick(payload) {
  const tabId = await getActiveTabId();
  if (tabId && payload.selector) {
    await exec(tabId, (selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        return true;
      }
      return false;
    }, [payload.selector]);
    sendResult('browser_click', true);
  }
}

async function handleType(payload) {
  const tabId = await getActiveTabId();
  if (tabId && payload.selector && payload.text) {
    await exec(tabId, (selector, text, mode) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const applyValue = (node) => {
        if (mode === 'append') node.value = (node.value || '') + text;
        else node.value = text;
        node.dispatchEvent(new Event('input', { bubbles: true }));
        node.dispatchEvent(new Event('change', { bubbles: true }));
      };
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        applyValue(el);
        return true;
      }
      if (el.isContentEditable) {
        if (mode === 'append') el.textContent = (el.textContent || '') + text;
        else el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, [payload.selector, payload.text, payload.mode || 'replace']);
    sendResult('browser_type', true);
  }
}

async function handleHover(payload) {
  const tabId = await getActiveTabId();
  if (tabId && payload.selector) {
    await exec(tabId, (selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        return true;
      }
      return false;
    }, [payload.selector]);
    sendResult('browser_hover', true);
  }
}

async function handleSnapshot() {
  const tabId = await getActiveTabId();
  if (tabId) {
    try {
      const result = await exec(tabId, () => {
        const dims = { width: window.innerWidth, height: window.innerHeight };
        const scroll = { x: window.scrollX, y: window.scrollY };
        return {
          url: window.location.href,
          title: document.title,
          viewport: dims,
          scroll,
          html: document.documentElement.outerHTML
        };
      });
      sendResult('browser_snapshot', result);
    } catch (error) {
      console.error('Snapshot error:', error);
      sendResult('browser_snapshot', null);
    }
  }
}

function sendResult(type, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ 
      type: `${type}_result`, 
      data,
      timestamp: Date.now()
    }));
  }
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return true;
  }
  
  try {
    ws = new WebSocket(serverUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected to MCP server');
      sendPopupStatus('Connected');
      reconnectAttempts = 0;
      // Send initial connection message
      ws.send(JSON.stringify({ 
        type: 'extension_connected',
        data: { version: '1.0.0', capabilities: ['navigate', 'click', 'type', 'hover', 'snapshot'] }
      }));
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected from MCP server');
      sendPopupStatus('Disconnected');
      ws = null;
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      lastErrorMessage = String(error?.message || 'WebSocket error');
      sendPopupStatus('WebSocket error');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMCPMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    return true;
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    lastErrorMessage = String(error?.message || 'Failed to create WebSocket');
    sendPopupStatus('Failed to open WebSocket');
    return false;
  }
}

// scheduleReconnect removed

// Listen for tab updates to keep track of active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  activeTabId = activeInfo.tabId;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabId === tabId) {
    activeTabId = null;
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.cmd === 'connect') {
    const ok = connect();
    sendResponse({ success: ok, lastError: lastErrorMessage });
    return false; // synchronous response
  }
  
  if (msg?.cmd === 'getStatus') {
    const connected = ws && ws.readyState === WebSocket.OPEN;
    sendResponse({ status: connected ? 'connected' : 'disconnected', lastError: lastErrorMessage, url: serverUrl });
    return false; // synchronous response
  }
  
  if (msg?.cmd === 'disconnect') {
    if (ws) {
      ws.close();
      ws = null;
    }
    sendResponse({ success: true });
    return false; // synchronous response
  }
});

// alarms reconnect removed

// Keyboard commands support
chrome.commands?.onCommand.addListener((command) => {
  if (command === 'connect') {
    connect();
  } else if (command === 'disconnect') {
    if (ws) {
      ws.close();
      ws = null;
      sendPopupStatus('Disconnected');
    }
  }
});

// Disconnect when the last browser window is closed
chrome.windows.onRemoved.addListener(async () => {
  const windows = await windowsGetAll();
  if (windows.length === 0 && ws) {
    try { ws.close(); } catch (_) {}
    ws = null;
    sendPopupStatus('Disconnected');
    // Clear connected tab marker so next session starts disconnected
    try { chrome.storage.local.remove('connectedTabId'); } catch (_) {}
  }
});

// Clear stale state when the extension service worker starts
chrome.runtime.onStartup?.addListener(() => {
  try { chrome.storage.local.remove('connectedTabId'); } catch (_) {}
  if (ws) {
    try { ws.close(); } catch (_) {}
    ws = null;
  }
  sendPopupStatus('Disconnected');
});

chrome.runtime.onInstalled.addListener(() => {
  try { chrome.storage.local.remove('connectedTabId'); } catch (_) {}
  if (ws) {
    try { ws.close(); } catch (_) {}
    ws = null;
  }
  sendPopupStatus('Disconnected');
});

// Best-effort cleanup when the service worker is about to be suspended
chrome.runtime.onSuspend?.addListener(() => {
  try { chrome.storage.local.remove('connectedTabId'); } catch (_) {}
  if (ws) {
    try { ws.close(); } catch (_) {}
    ws = null;
  }
});



