/// <reference types="jest" />
import { createMcpServer } from '../../src/transports/mcp-server.js';
import { loadConfig } from '../../src/utils/config.js';
import { createLogger } from '../../src/utils/logger.js';

describe('MCP Server Integration', () => {
  test('should create server with default configuration', async () => {
    const config = loadConfig();
    const logger = createLogger('error', false);
    
    const server = createMcpServer(config, logger);
    
    expect(server).toBeDefined();
    expect(typeof server).toBe('object');
    expect(server.constructor.name).toBe('Server');
  });

  test('should have required server configuration', async () => {
    const config = loadConfig();
    
    expect(config.name).toBe('@uh-joan/ct.gov-mcp-server');
    expect(config.version).toBeTruthy();
  });
}); 