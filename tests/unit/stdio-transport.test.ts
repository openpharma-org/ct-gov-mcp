/// <reference types="jest" />
import { startStdioServer } from '../../src/transports/stdio.js';

/**
 * Transport Layer Testing Strategy
 * ===============================
 * 
 * The transport layer (stdio, http, sse) is considered infrastructure code and is tested via:
 * 1. Integration tests that spawn real servers
 * 2. Manual testing during development
 * 3. End-to-end tests in CI/CD
 * 
 * Unit testing transports is challenging because:
 * - They depend on external MCP SDK modules that are hard to mock
 * - They perform I/O operations (network, stdio)
 * - The business logic value is in the tools/utils, not transport mechanisms
 * 
 * Coverage focus is on business logic (tools, utils) where unit tests provide maximum value.
 */

describe('Stdio Transport', () => {
  test('should export startStdioServer function', () => {
    expect(typeof startStdioServer).toBe('function');
    expect(startStdioServer.length).toBe(2); // config, logger parameters
  });

  test('should have correct function signature', () => {
    // Basic smoke test to ensure the module is importable and has expected shape
    expect(startStdioServer).toBeDefined();
    expect(startStdioServer.name).toBe('startStdioServer');
  });
}); 