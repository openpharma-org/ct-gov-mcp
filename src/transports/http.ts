import http from 'http';
import { ServerConfig } from '../types.js';
import { getToolDefinitions, getToolHandler } from '../tools/index.js';

function sendError(res: http.ServerResponse, message: string, code: number = 400) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message, code }));
}

const parseBody = (req: http.IncomingMessage) => new Promise<any>((resolve, reject) => {
  let body = '';
  req.on('data', (chunk: any) => { body += chunk; });
  req.on('end', () => {
    try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
  });
});

export async function startHttpServer(config: ServerConfig, logger: any) {
  const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const method = req.method || '';
    const url = req.url || '';

    // Health check endpoint
    if (method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'http' }));
      return;
    }

    // List tools endpoint
    if (method === 'POST' && url === '/list_tools') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        tools: getToolDefinitions()
      }));
      return;
    }

    // Tool routing
    if (method === 'POST') {
      let data: any;
      let result: any;
      try {
        data = await parseBody(req);
        const toolName = url?.substring(1); // Remove leading slash
        
        const handler = getToolHandler(toolName);
        if (handler) {
          result = await handler(data.input || data);
        } else {
          sendError(res, 'Tool not found', 404);
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        sendError(res, err instanceof Error ? err.message : String(err));
      }
    } else {
      sendError(res, 'Not found', 404);
    }
  });

  server.listen(config.port, () => {
    logger.info(`HTTP server listening on port ${config.port}`);
  });
} 