import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ServerConfig } from '../types.js';
import { createMcpServer } from './mcp-server.js';

export async function startStdioServer(config: ServerConfig, logger: any) {
  const transport = new StdioServerTransport();
  const server = createMcpServer(config, logger);

  await server.connect(transport);
  logger.info('MCP server started in stdio mode');
} 