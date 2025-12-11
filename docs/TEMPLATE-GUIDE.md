# MCP Server Template

[![CI/CD Pipeline](https://github.com/uh-joan/template-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/uh-joan/template-mcp-server/actions/workflows/ci.yml)
[![Performance Monitoring](https://github.com/uh-joan/template-mcp-server/actions/workflows/performance.yml/badge.svg)](https://github.com/uh-joan/template-mcp-server/actions/workflows/performance.yml)
[![codecov](https://codecov.io/gh/uh-joan/template-mcp-server/graph/badge.svg)](https://codecov.io/gh/uh-joan/template-mcp-server)
[![npm version](https://badge.fury.io/js/template-mcp-server.svg)](https://badge.fury.io/js/template-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-0.6.0-green.svg)](https://github.com/modelcontextprotocol/typescript-sdk)
[![Benchmark Results](https://img.shields.io/badge/📊-Benchmark%20Results-blue)](https://uh-joan.github.io/template-mcp-server/dev/bench/)
[![Coverage Report](https://img.shields.io/badge/📈-Coverage%20Report-green)](https://uh-joan.github.io/template-mcp-server/coverage/)

A modular template for creating Model Context Protocol (MCP) servers that can run in multiple transport modes (stdio, SSE, HTTP).

## Quick Start

1. Clone or copy this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── types.ts              # TypeScript type definitions
├── tools/                # Tool implementations
│   ├── index.ts          # Tool registry
│   ├── example-tool.ts   # Example tool
│   └── math-tool.ts      # Math calculator tool
├── transports/           # Transport implementations
│   ├── mcp-server.ts     # Shared MCP server factory
│   ├── stdio.ts          # Stdio transport
│   ├── sse.ts            # Server-Sent Events transport
│   └── http.ts           # HTTP transport
└── utils/                # Utility modules
    ├── config.ts         # Configuration loader
    └── logger.ts         # Logging utility
```

## Adding New Tools

To add a new tool, create a new file in `src/tools/`:

1. **Create your tool file** (e.g., `src/tools/my-tool.ts`):
   ```typescript
   import { ToolDefinition, ToolHandler } from '../types.js';

   export const definition: ToolDefinition = {
     name: "my_tool",
     description: "Description of your tool",
     inputSchema: {
       type: "object",
       properties: {
         input: { type: "string", description: "Input parameter" }
       },
       required: ["input"]
     },
     responseSchema: {
       type: "object",
       properties: {
         result: { type: "string", description: "Result of the operation" }
       },
       required: ["result"]
     },
     examples: [
       {
         description: "Example usage",
         usage: { "input": "example" },
         response: { "result": "example result" }
       }
     ]
   };

   export const handler: ToolHandler = async (args: any) => {
     // Your tool implementation here
     return {
       result: `Processed: ${args.input}`
     };
   };
   ```

2. **Register your tool** in `src/tools/index.ts`:
   ```typescript
   import * as myTool from './my-tool.js';

   export const toolRegistry: ToolRegistry = {
     // ... existing tools
     [myTool.definition.name]: {
       definition: myTool.definition,
       handler: myTool.handler
     }
   };
   ```

3. **Build and test**:
   ```bash
   npm run build
   npm run test
   ```

## Cursor MCP Settings

To use this server with Cursor, add one of these configurations to your `~/.cursor/mcp.json`:

1. Using `node` directly:
   ```json
   {
     "your-server-name": {
       "command": "node",
       "args": ["/path/to/your/dist/index.js"],
       "env": {
         "USE_HTTP": "false"
       }
     }
   }
   ```

2. Using `npx`:
   ```json
   {
     "your-server-name": {
       "command": "npx",
       "args": ["--yes", "node", "/path/to/your/dist/index.js"],
       "env": {
         "USE_HTTP": "false",
         "LOG_LEVEL": "debug"
       }
     }
   }
   ```

Make sure to:
1. Build the TypeScript files first with `npm run build`
2. Replace `/path/to/your` with your actual project path
3. Choose a unique name for `your-server-name`
4. Restart Cursor after making changes to `mcp.json`

## Server Modes

### Stdio Mode (for MCP/Cursor)
- Set `USE_HTTP=false` and `USE_SSE=false` in `.env` (default)
- Tools are available via stdio communication
- This is the mode used by Cursor

### SSE Mode (Server-Sent Events)
- Set `USE_SSE=true` in `.env`
- Tools are available via SSE transport over HTTP
- Useful for web-based MCP clients
- Endpoint available at `/mcp` (or custom path via `SSE_PATH`)

### HTTP Mode (for Development/Testing)
- Set `USE_HTTP=true` in `.env`
- Tools are available via HTTP endpoints:
  - `GET /health` - Health check
  - `POST /list_tools` - List available tools
  - `POST /{tool_name}` - Call specific tool

## Environment Variables

- `SERVER_NAME`: Server name (default: 'mcp-server-template')
- `SERVER_VERSION`: Server version (default: '0.1.0')
- `USE_HTTP`: Set to 'true' for HTTP mode, 'false' for stdio mode (default: false)
- `USE_SSE`: Set to 'true' for SSE mode, 'false' for other modes (default: false)
- `PORT`: HTTP server port (default: 3000, used in HTTP and SSE modes)
- `SSE_PATH`: SSE endpoint path (default: '/mcp', only used in SSE mode)
- `LOG_LEVEL`: Logging level - 'error', 'warn', 'info', 'debug' (default: 'info')

## Development

1. Start in watch mode:
   ```bash
   npm run dev
   ```

2. Test the server:
   ```bash
   # Build first
   npm run build
   
   # Run the test client
   npm run test
   ```

3. Test SSE mode:
   ```bash
   # Start in SSE mode
   USE_SSE=true PORT=3000 npm start
   
   # Check health endpoint
   curl http://localhost:3000/health
   
   # Connect via SSE (requires SSE-compatible MCP client)
   # The SSE endpoint is available at http://localhost:3000/mcp
   ```

## Example Tools Included

- **example_tool**: A simple example that processes text input
- **math_calculator**: A calculator that performs basic math operations (add, subtract, multiply, divide)

## Publishing & Releases

### Automated Publishing with Version Tags

This project supports **automated publishing to npm** using GitHub Actions. Here's how it works:

**"Automated publishing on version tags"** means that when you create a git tag with a version number (like `v1.0.0`), GitHub automatically:

1. **Builds** your package
2. **Tests** it thoroughly across multiple Node.js versions
3. **Publishes** it to npm
4. **Creates** a GitHub release with changelog

### How to Publish a New Version

**Method 1: Automated Release (Recommended)**
```bash
# Update version and create tag automatically
npm run release:patch    # 1.0.0 → 1.0.1
npm run release:minor    # 1.0.0 → 1.1.0  
npm run release:major    # 1.0.0 → 2.0.0

# This will:
# 1. Run all pre-publish checks
# 2. Update package.json version
# 3. Create git tag (e.g., v1.0.1)
# 4. Push tag to GitHub
# 5. Trigger automated publishing
```

**Method 2: Manual Tag Creation**
```bash
# Create and push tag manually
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically publish
```

### Pre-Publish Validation

Before any publish, comprehensive validation runs:
```bash
npm run prepublish:check    # Full validation
npm run publish:dry         # See what would be published
npm run publish:safe        # Validate + publish locally
```

**Validation includes:**
- ✅ All tests pass (86 tests with 95%+ coverage)
- ✅ TypeScript compilation
- ✅ Code linting and formatting
- ✅ Security audit (no vulnerabilities)
- ✅ Package integrity check
- ✅ Git status validation

### Setting Up Automated Publishing

To enable automated publishing, you need to configure the `NPM_TOKEN` secret:

1. **Create npm access token:**
   ```bash
   npm login
   npm token create --type=automation
   ```

2. **Add to GitHub repository:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

3. **That's it!** Now when you push version tags, GitHub will automatically publish to npm.

### Manual Publishing (Alternative)

If you prefer manual control:
```bash
npm run publish:safe     # Full validation + publish
npm run publish:beta     # Publish with beta tag
```

## License

MIT