let ws = null;
let activeTabId = null;

function sendPopupStatus(status) {
  chrome.runtime.sendMessage({ status }).catch(() => {});
}

async function getActiveTabId() {
  if (!activeTabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabId = tab?.id;
  }
  return activeTabId;
}

async function updateActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;
  return activeTabId;
}

async function exec(tabId, func, args = []) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({ 
      target: { tabId }, 
      func, 
      args 
    });
    return result;
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
  }
}

async function handleNavigate(payload) {
  const tabId = await getActiveTabId();
  if (tabId && payload.url) {
    await chrome.tabs.update(tabId, { url: payload.url });
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
    await exec(tabId, (selector, text) => {
      const element = document.querySelector(selector);
      if (element) {
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, [payload.selector, payload.text]);
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
        return {
          url: window.location.href,
          title: document.title,
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
    ws = new WebSocket('ws://127.0.0.1:29100');
    
    ws.onopen = () => {
      console.log('WebSocket connected to MCP server');
      sendPopupStatus('Connected');
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
    sendPopupStatus('Failed to open WebSocket');
    return false;
  }
}

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
    sendResponse({ success: ok });
    return true;
  }
  
  if (msg?.cmd === 'getStatus') {
    const connected = ws && ws.readyState === WebSocket.OPEN;
    sendResponse({ status: connected ? 'connected' : 'disconnected' });
    return true;
  }
  
  if (msg?.cmd === 'disconnect') {
    if (ws) {
      ws.close();
      ws = null;
    }
    sendResponse({ success: true });
    return true;
  }
});



