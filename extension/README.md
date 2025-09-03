# MiraiLens Browser Extension

This extension connects your browser to the MiraiLens MCP server for AI-powered web automation.

## Installation

1. **Load the Extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `extension/` folder from the installed package
     - Local install: `./node_modules/mirailens/extension`
     - Global install (optional): global npm dir under `mirailens/extension`

2. **Start the MCP Server:**
   - Run via npx: `npx mirailens`
   - Or if installed locally: `npx mirailens`
   - The server will start on port 29100

## Usage

1. **Connect:**
   - Click the MiraiLens extension icon in your browser toolbar
   - Click "Connect to MCP Server"
   - Status should show "Connected to MCP Server"

2. **Features:**
   - **Navigate:** Go to any URL
   - **Click:** Click elements by CSS selector
   - **Type:** Type text into form fields
   - **Hover:** Hover over elements
   - **Snapshot:** Capture page content
   - **Wait:** Pause execution
   - **Go Back/Forward:** Browser navigation

## Troubleshooting

- **Connection Failed:** Make sure the MCP server is running (`npm start`)
- **Extension Not Working:** Check Chrome DevTools console for errors
- **Permission Issues:** Ensure the extension has access to the current tab

## Development

The extension communicates with the MCP server via WebSocket on port 29100. All browser automation commands are sent from the MCP server to the extension.

