/// <reference types="jest" />
import { createMcpServer } from '../../src/transports/mcp-server.js';
import { loadConfig } from '../../src/utils/config.js';
import { createLogger } from '../../src/utils/logger.js';
import { getToolHandler } from '../../src/tools/index.js';

describe('Error Handling Integration', () => {
  test('should handle invalid tool name', async () => {
    const handler = getToolHandler('invalid_tool');
    expect(handler).toBeUndefined();
  });

  test('should handle missing search parameters in ct_gov_studies', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      await expect(handler({})).rejects.toThrow();
    }
  });

  test('should handle network errors in ct_gov_studies', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));

      try {
        await expect(handler({ method: 'search', condition: 'Diabetes' })).rejects.toThrow();
      } finally {
        global.fetch = originalFetch;
      }
    }
  });

  test('should create server without errors', async () => {
    const config = loadConfig();
    const logger = createLogger('error', false);
    
    expect(() => createMcpServer(config, logger)).not.toThrow();
  });
}); 