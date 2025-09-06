# MiraiLens MCP Server

An implementation of the Model Context Protocol (MCP) that enables AI assistants to control and observe web browsers through MiraiLens. It exposes high‑level browser automation tools (navigate, click, type, screenshot, accessibility snapshot, and more) over MCP for seamless integration with AI clients.

## Key Features

- **Full MCP server**: Standards‑compliant, easy to integrate with MCP‑capable clients
- **Browser automation**: Navigate, click, type, select, and interact reliably
- **Observability**: Accessibility tree snapshots, console logs, and screenshots
- **Simple setup**: Run via `npx mirailens` or as a local Node process

## Requirements

- Node.js 18+
- Chrome/Chromium
- MiraiLens browser extension (for in‑browser automation)

## Install and Run

### Option A: Run via npx (recommended)
```bash
npx mirailens@latest
```

Then point your MCP client to the spawned process (see "Configure for Cursor").

### Option B: Local clone
```bash
git clone https://github.com/mugenkyou/mcp-server-mirailens.git
cd mcp-server-mirailens
npm ci
npm run build
node dist/index.js
```

## Configure for Cursor

Create or edit your `mcp.json` in Cursor’s configuration directory:

- Windows: `%APPDATA%/Cursor/User/globalStorage/cursor.mcp/mcp.json`
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json`
- Linux: `~/.config/Cursor/User/globalStorage/cursor.mcp/mcp.json`

### Use npx
```json
{
  "mcpServers": {
    "mirailens": {
      "command": "npx",
      "args": ["mirailens"],
      "env": {}
    }
  }
}
```

### Use local build
```json
{
  "mcpServers": {
    "mirailens": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-mirailens/dist/index.js"],
      "env": {}
    }
  }
}
```

Restart Cursor after saving. In the MCP tools list, you should see MiraiLens available.

## Available Tools

- **Navigation**: `navigate`, `goBack`, `goForward`
- **Interaction**: `click`, `hover`, `type`, `selectOption`, `pressKey`, `wait`
- **Inspection**: `snapshot` (ARIA/accessibility), `getConsoleLogs`, `screenshot`

### Tool identifiers (for MCP clients)

```text
mcp_mirailens_navigate
mcp_mirailens_go_back
mcp_mirailens_go_forward
mcp_mirailens_snapshot
mcp_mirailens_hover
mcp_mirailens_type
mcp_mirailens_select_option
mcp_mirailens_press_key
```

## Browser Extension

The MiraiLens extension brokers communication with the active tab and handles:

- Message passing between the page and the MCP server
- Script injection and permissions
- Background service worker lifecycle

Load the unpacked extension:

1. Open Chrome/Chromium → `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked" and select the `extension/` directory in this repository

## Development

```bash
# Type check
npm run typecheck

# Dev build (watch)
npm run watch

# Production build
npm run build

# MCP Inspector (manual testing)
npm run inspector
```

### Project Layout

```
src/
├── config.ts          # Configuration helpers
├── context.ts         # MCP context wiring
├── index.ts           # CLI entry (bin)
├── server.ts          # Server bootstrap
├── tools/             # Tool implementations
│   ├── common.ts      # Core browser actions
│   ├── custom.ts      # Custom actions
│   ├── snapshot.ts    # Accessibility snapshot
│   └── tool.ts        # Tool type helpers
├── resources/         # Resource definitions
├── utils/             # Logging, ports, ARIA helpers
└── ws.ts              # WebSocket transport
```



## Support

- Issues: https://github.com/mugenkyou/mcp-server-mirailens/issues
- MCP specification: https://modelcontextprotocol.io/

## License

MIT © MiraiLens
