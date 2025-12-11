/// <reference types="jest" />
import { createLogger } from '../../src/utils/logger.js';

describe('Logger Utility', () => {
  let originalStderrWrite: typeof process.stderr.write;
  let originalStdoutWrite: typeof process.stdout.write;
  let stderrOutput: string[] = [];
  let stdoutOutput: string[] = [];

  beforeEach(() => {
    stderrOutput = [];
    stdoutOutput = [];
    
    originalStderrWrite = process.stderr.write;
    originalStdoutWrite = process.stdout.write;
    
    process.stderr.write = ((chunk: any) => {
      stderrOutput.push(chunk.toString());
      return true;
    }) as any;
    
    process.stdout.write = ((chunk: any) => {
      stdoutOutput.push(chunk.toString());
      return true;
    }) as any;
  });

  afterEach(() => {
    process.stderr.write = originalStderrWrite;
    process.stdout.write = originalStdoutWrite;
  });

  test('should create logger with info level by default', () => {
    const logger = createLogger();
    
    logger.info('test message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"info"');
    expect(stderrOutput[0]).toContain('"message":"test message"');
  });

  test('should create logger with specified level', () => {
    const logger = createLogger('debug');
    
    logger.debug('debug message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"debug"');
    expect(stderrOutput[0]).toContain('"message":"debug message"');
  });

  test('should log error messages to stderr', () => {
    const logger = createLogger('error');
    
    logger.error('error message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"error"');
    expect(stderrOutput[0]).toContain('"message":"error message"');
  });

  test('should log warning messages to stderr', () => {
    const logger = createLogger('warn');
    
    logger.warn('warning message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"warn"');
    expect(stderrOutput[0]).toContain('"message":"warning message"');
  });

  test('should not log debug messages when level is info', () => {
    const logger = createLogger('info');
    
    logger.debug('debug message');
    expect(stderrOutput.length).toBe(0);
  });

  test('should not log info messages when level is warn', () => {
    const logger = createLogger('warn');
    
    logger.info('info message');
    expect(stderrOutput.length).toBe(0);
  });

  test('should not log warn messages when level is error', () => {
    const logger = createLogger('error');
    
    logger.warn('warn message');
    expect(stderrOutput.length).toBe(0);
  });

  test('should include timestamp in log output', () => {
    const logger = createLogger('info');
    
    logger.info('test message');
    expect(stderrOutput[0]).toMatch(/"timestamp":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);
  });

  test('should log to stdout when useHttp is true for info/debug messages', () => {
    const logger = createLogger('info', true);
    
    logger.info('test message');
    expect(stdoutOutput.length).toBe(1);
    expect(stdoutOutput[0]).toContain('"level":"info"');
    expect(stdoutOutput[0]).toContain('"message":"test message"');
    expect(stderrOutput.length).toBe(0);
  });

  test('should still log errors to stderr even when useHttp is true', () => {
    const logger = createLogger('error', true);
    
    logger.error('error message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"error"');
    expect(stderrOutput[0]).toContain('"message":"error message"');
    expect(stdoutOutput.length).toBe(0);
  });

  test('should handle meta parameter gracefully', () => {
    const logger = createLogger('info');
    
    logger.info('test message', { key: 'value' });
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"info"');
    expect(stderrOutput[0]).toContain('"message":"test message"');
  });

  test('should end log messages with newline', () => {
    const logger = createLogger('info');
    
    logger.info('test message');
    expect(stderrOutput[0]).toMatch(/.*\n$/);
  });

  test('should create logger with useHttp parameter explicitly set', () => {
    const logger = createLogger('debug', false);
    
    logger.debug('debug message');
    expect(stderrOutput.length).toBe(1);
    expect(stderrOutput[0]).toContain('"level":"debug"');
    expect(stderrOutput[0]).toContain('"message":"debug message"');
    expect(stdoutOutput.length).toBe(0);
  });
}); 