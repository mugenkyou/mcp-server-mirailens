# MiraiLens MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with web browsers through browser automation. MiraiLens provides a bridge between AI models and web browsers, allowing for sophisticated web automation tasks.

## Features

- **Browser Automation**: Navigate, click, type, and interact with web pages
- **Accessibility Support**: Capture accessibility snapshots for better understanding of page structure
- **Console Integration**: Access browser console logs and debugging information
- **Screenshot Capabilities**: Capture visual representations of web pages
- **MCP Compliance**: Full Model Context Protocol implementation for seamless AI integration

## Quick Start

### Prerequisites

- Node.js 18+ 
- Chrome/Chromium browser
- MiraiLens browser extension

### Install and Run (no repo clone required)

You can use MiraiLens directly via npx or by installing the package:

```bash
# Option A: Run directly
npx mirailens

# Option B: Install locally and run
npm install mirailens --save-dev
npx mirailens
```

### Load the Browser Extension

1. Open Chrome/Chromium and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder from your installed package:
   - If installed locally in a project: `./node_modules/mirailens/extension`
   - If installed globally (not required): your global npm directory under `mirailens/extension`

### Usage

#### As an MCP Server

```bash
# Run with the MCP inspector
pnpx @modelcontextprotocol/inspector npx mirailens
```

#### With Claude Desktop

1. Add the server to your Claude Desktop configuration:
   ```json
   {
     "mcpServers": {
       "mirailens": {
         "command": "node",
         "args": ["/path/to/mirailens/dist/index.js"],
         "env": {}
       }
     }
   }
   ```

2. Restart Claude Desktop

#### Available Tools

- **Navigation**: `navigate`, `goBack`, `goForward`
- **Interaction**: `click`, `hover`, `type`, `selectOption`
- **Information**: `snapshot`, `getConsoleLogs`, `screenshot`
- **Utilities**: `wait`, `pressKey`

## Development

### Project Structure

```
src/
├── config.ts          # Application configuration
├── context.ts         # MCP context management
├── index.ts           # Main entry point
├── server.ts          # MCP server implementation
├── tools/             # Tool implementations
│   ├── common.ts      # Common browser tools
│   ├── custom.ts      # Custom browser tools
│   ├── snapshot.ts    # Accessibility snapshot tools
│   └── tool.ts        # Tool type definitions
├── resources/         # Resource definitions
├── utils/             # Utility functions
└── ws.ts              # WebSocket handling
```

### Building

```bash
# Development build with watch mode
npm run watch

# Production build
npm run build

# Type checking
npm run typecheck
```

### Testing

```bash
# Run the MCP inspector for testing
npm run inspector
```

## Browser Extension

The MiraiLens browser extension provides the connection between the MCP server and the active browser tab. It handles:

- Tab communication
- Script injection
- Permission management
- Background service worker

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/mugenkyou/mcp-server-mirailens/issues)
- **Documentation**: [MCP Specification](https://modelcontextprotocol.io/)
- **Community**: [Discord](https://discord.gg/mirailens)

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- [Claude Desktop](https://claude.ai/) for MCP client implementation
- The open source community for inspiration and contributions

## Cursor Guide

To use MiraiLens with Cursor, you need to configure your MCP.json file. Here's how to set it up:

### 1. Create MCP.json Configuration

Create or edit your `MCP.json` file in your Cursor configuration directory:

**Windows**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\mcp.json`
**macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json`
**Linux**: `~/.config/Cursor/User/globalStorage/cursor.mcp/mcp.json`

### 2. Add MiraiLens Server Configuration

Add this configuration to your `MCP.json`:

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

### 3. Alternative: Direct Path Configuration

If you prefer to use a local installation:

```json
{
  "mcpServers": {
    "mirailens": {
      "command": "node",
      "args": ["/path/to/your/mirailens/dist/index.js"],
      "env": {}
    }
  }
}
```

### 4. Restart Cursor

After saving the configuration, restart Cursor for the changes to take effect.

### 5. Verify Installation

Once Cursor restarts, you should see MiraiLens tools available in your AI assistant. You can test by asking the AI to navigate to a website or take a screenshot.

### Troubleshooting

- **Command not found**: Make sure you have Node.js installed and the package is built
- **Connection failed**: Ensure the MiraiLens browser extension is installed and active
- **Permission denied**: Check that the path to your MiraiLens installation is correct

### Available Commands

With this configuration, you'll have access to all MiraiLens tools:
- Browser navigation and interaction
- Screenshot and accessibility features
- Console log access
- Web automation capabilities
