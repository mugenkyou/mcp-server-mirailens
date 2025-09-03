const statusEl = document.getElementById('status');
const connectBtn = document.getElementById('connect');

function setStatus(text, className = 'status-disconnected') {
  statusEl.textContent = text;
  statusEl.className = `status-${className}`;
}

function updateButtonState(connected) {
  if (connected) {
    connectBtn.textContent = 'Disconnect';
    connectBtn.disabled = false;
    setStatus('Connected to MCP Server', 'connected');
  } else {
    connectBtn.textContent = 'Connect to MCP Server';
    connectBtn.disabled = false;
    setStatus('Disconnected', 'disconnected');
  }
}

function setConnecting() {
  connectBtn.textContent = 'Connecting...';
  connectBtn.disabled = true;
  setStatus('Attempting connection...', 'disconnected');
}

function setDisconnecting() {
  connectBtn.textContent = 'Disconnecting...';
  connectBtn.disabled = true;
  setStatus('Disconnecting...', 'disconnected');
}

connectBtn.addEventListener('click', async () => {
  try {
    const isConnected = connectBtn.textContent === 'Disconnect';
    
    if (isConnected) {
      // Disconnect
      setDisconnecting();
      chrome.runtime.sendMessage({ cmd: 'disconnect' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Disconnect error:', chrome.runtime.lastError);
          setStatus('Disconnect failed', 'disconnected');
          updateButtonState(true); // Keep button as disconnect
          return;
        }
        
        if (response && response.success) {
          updateButtonState(false);
        } else {
          setStatus('Disconnect failed', 'disconnected');
          updateButtonState(true); // Keep button as disconnect
        }
      });
    } else {
      // Connect
      setConnecting();
      chrome.runtime.sendMessage({ cmd: 'connect' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Connection error:', chrome.runtime.lastError);
          setStatus('Connection failed', 'disconnected');
          updateButtonState(false);
          return;
        }
        
        if (response && response.success) {
          // Don't update button state yet - wait for status message from background
          setStatus('Connection initiated...', 'disconnected');
        } else {
          setStatus('Connection failed', 'disconnected');
          updateButtonState(false);
        }
      });
    }
  } catch (error) {
    console.error('Popup error:', error);
    setStatus('Error occurred', 'disconnected');
    updateButtonState(false);
  }
});

// Listen for status updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message?.status) {
    switch (message.status) {
      case 'Connected':
        updateButtonState(true);
        break;
      case 'Disconnected':
        updateButtonState(false);
        break;
      case 'WebSocket error':
        setStatus('WebSocket connection error', 'disconnected');
        updateButtonState(false);
        break;
      case 'Failed to open WebSocket':
        setStatus('Failed to connect to MCP server', 'disconnected');
        updateButtonState(false);
        break;
      default:
        setStatus(message.status, 'disconnected');
    }
  }
});

// Initialize status on popup open
chrome.runtime.sendMessage({ cmd: 'getStatus' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Status check error:', chrome.runtime.lastError);
    setStatus('Status check failed', 'disconnected');
    return;
  }
  
  if (response && response.status) {
    updateButtonState(response.status === 'connected');
  } else {
    setStatus('Status unknown', 'disconnected');
  }
});



