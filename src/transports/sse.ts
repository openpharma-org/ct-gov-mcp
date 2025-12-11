import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import http from 'http';
import { ServerConfig } from '../types.js';
import { createMcpServer } from './mcp-server.js';

function sendError(res: http.ServerResponse, message: string, code: number = 400) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message, code }));
}

export async function startSseServer(config: ServerConfig, logger: any) {
  const httpServer = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const method = req.method || '';
    const url = req.url || '';

    // CORS headers for SSE
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    // Health check endpoint
    if (method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
      res.end(JSON.stringify({ status: 'ok', transport: 'sse' }));
      return;
    }

    // SSE endpoint
    if (method === 'POST' && url === config.ssePath) {
      const transport = new SSEServerTransport(config.ssePath, res);
      const server = createMcpServer(config, logger);
      
      try {
        await server.connect(transport);
        logger.info(`SSE MCP server connected on ${config.ssePath}`);
      } catch (error) {
        logger.error('SSE server connection error:', { error: error instanceof Error ? error.message : String(error) });
        sendError(res, 'SSE connection failed', 500);
      }
      return;
    }

    // Fallback for other requests
    sendError(res, 'Not found', 404);
  });

  httpServer.listen(config.port, () => {
    logger.info(`SSE MCP server listening on port ${config.port}, SSE endpoint: ${config.ssePath}`);
  });
} 