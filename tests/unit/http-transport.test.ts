/// <reference types="jest" />
import { startHttpServer } from '../../src/transports/http.js';

/**
 * HTTP Transport Testing Strategy
 * ==============================
 * 
 * HTTP transport is tested via integration tests that verify:
 * - Health endpoints work correctly
 * - Tool listing and execution via HTTP
 * - Error handling and status codes
 * 
 * Unit testing HTTP transports requires complex mocking of Node.js http module
 * and is better handled at the integration level.
 */

describe('HTTP Transport', () => {
  test('should export startHttpServer function', () => {
    expect(typeof startHttpServer).toBe('function');
    expect(startHttpServer.length).toBe(2); // config, logger parameters
  });

  test('should have correct function signature', () => {
    expect(startHttpServer).toBeDefined();
    expect(startHttpServer.name).toBe('startHttpServer');
  });
}); 