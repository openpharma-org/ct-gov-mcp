/// <reference types="jest" />
import { startSseServer } from '../../src/transports/sse.js';

/**
 * SSE Transport Testing Strategy
 * =============================
 * 
 * SSE (Server-Sent Events) transport is tested via integration tests that verify:
 * - CORS headers are set correctly
 * - SSE connections work properly
 * - Error handling for connection failures
 * 
 * Unit testing SSE requires complex mocking of HTTP servers and SSE streams.
 * Integration tests provide better coverage for this infrastructure code.
 */

describe('SSE Transport', () => {
  test('should export startSseServer function', () => {
    expect(typeof startSseServer).toBe('function');
    expect(startSseServer.length).toBe(2); // config, logger parameters
  });

  test('should have correct function signature', () => {
    expect(startSseServer).toBeDefined();
    expect(startSseServer.name).toBe('startSseServer');
  });
}); 