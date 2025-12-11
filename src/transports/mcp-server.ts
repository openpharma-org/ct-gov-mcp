import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { ServerConfig } from '../types.js';
import { getToolDefinitions, getToolHandler } from '../tools/index.js';

export function createMcpServer(config: ServerConfig, logger: any) {
  const server = new Server(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Set up request handlers
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    try {
      logger.debug('ListToolsRequestSchema request', { request });
      return {
        tools: getToolDefinitions()
      };
    } catch (error) {
      logger.error('Error listing tools:', error);
      throw new McpError(-32603, error instanceof Error ? error.message : String(error));
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      logger.debug('CallToolRequestSchema request', { request });
      const toolName = request.params?.name;
      const args = request.params?.arguments ?? {};
      
      if (!toolName) {
        throw new McpError(-32602, 'Tool name is required');
      }
      
      const handler = getToolHandler(toolName);
      if (!handler) {
        throw new McpError(-32601, `Unknown tool: ${toolName}`);
      }
      
      const result = await handler(args);
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(result, null, 2) 
        }], 
        isError: false 
      };
    } catch (error) {
      logger.error('Error calling tool:', { toolName: request.params?.name, error });
      
      // If it's already an McpError, re-throw it
      if (error instanceof McpError) {
        throw error;
      }
      
      // Convert other errors to McpError
      throw new McpError(-32603, error instanceof Error ? error.message : String(error));
    }
  });

  // Add error handler for the server itself
  server.onerror = (error) => {
    logger.error('MCP Server error:', error);
  };

  return server;
} 