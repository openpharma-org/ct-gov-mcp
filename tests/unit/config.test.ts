/// <reference types="jest" />
import { loadConfig, validateConfig } from '../../src/utils/config.js';

describe('Config Module', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.npm_package_name;
    delete process.env.npm_package_version;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    delete process.env.USE_HTTP;
    delete process.env.USE_SSE;
    delete process.env.PORT;
    delete process.env.CORS_ORIGINS;
    delete process.env.ENABLE_PERFORMANCE_MONITORING;
    delete process.env.ENABLE_EXPERIMENTAL_FEATURES;
  });

  describe('loadConfig', () => {
    test('should load default configuration', () => {
      const config = loadConfig();
      
      expect(config).toMatchObject({
        name: '@uh-joan/ct.gov-mcp-server',
        version: '0.1.0',
        nodeEnv: 'production',
        logLevel: 'info',
        useHttp: false,
        useSse: false,
        port: 3000,
        corsOrigins: ['*'],
        enablePerformanceMonitoring: true,
        enableExperimentalFeatures: false
      });
    });

    test('should use package.json values when available', () => {
      process.env.npm_package_name = 'test-server';
      process.env.npm_package_version = '2.0.0';

      const config = loadConfig();
      
      expect(config.name).toBe('test-server');
      expect(config.version).toBe('2.0.0');
    });

    test('should parse environment variables correctly', () => {
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'debug';
      process.env.USE_HTTP = 'true';
      process.env.USE_SSE = 'true';
      process.env.PORT = '8080';
      process.env.CORS_ORIGINS = 'https://example.com,https://api.example.com';
      process.env.ENABLE_PERFORMANCE_MONITORING = 'false';
      process.env.ENABLE_EXPERIMENTAL_FEATURES = 'true';

      const config = loadConfig();
      
      expect(config).toMatchObject({
        nodeEnv: 'development',
        logLevel: 'debug',
        useHttp: true,
        useSse: true,
        port: 8080,
        corsOrigins: ['https://example.com', 'https://api.example.com'],
        enablePerformanceMonitoring: false,
        enableExperimentalFeatures: true
      });
    });

    test('should handle boolean environment variables correctly', () => {
      process.env.USE_HTTP = 'false';
      process.env.USE_SSE = 'false';
      process.env.ENABLE_PERFORMANCE_MONITORING = 'true';
      process.env.ENABLE_EXPERIMENTAL_FEATURES = 'false';

      const config = loadConfig();
      
      expect(config.useHttp).toBe(false);
      expect(config.useSse).toBe(false);
      expect(config.enablePerformanceMonitoring).toBe(true);
      expect(config.enableExperimentalFeatures).toBe(false);
    });

    test('should handle invalid boolean values gracefully', () => {
      process.env.USE_HTTP = 'invalid';
      process.env.ENABLE_PERFORMANCE_MONITORING = 'yes';
      process.env.ENABLE_EXPERIMENTAL_FEATURES = '1';

      const config = loadConfig();
      
      expect(config.useHttp).toBe(false);
      expect(config.enablePerformanceMonitoring).toBe(false);
      expect(config.enableExperimentalFeatures).toBe(false);
    });

    test('should handle numeric port correctly', () => {
      process.env.PORT = '9000';

      const config = loadConfig();
      
      expect(config.port).toBe(9000);
    });

    test('should handle different log levels', () => {
      const logLevels = ['error', 'warn', 'info', 'debug'];
      
      logLevels.forEach(level => {
        process.env.LOG_LEVEL = level;
        const config = loadConfig();
        expect(config.logLevel).toBe(level);
      });
    });

    test('should parse CORS origins correctly', () => {
      process.env.CORS_ORIGINS = 'https://app.com, https://api.com , https://admin.com';

      const config = loadConfig();

      expect(config.corsOrigins).toEqual(['https://app.com', 'https://api.com', 'https://admin.com']);
    });
  });

  describe('validateConfig', () => {
    test('should pass validation for valid configuration', () => {
      const config = loadConfig();
      
      expect(() => validateConfig(config)).not.toThrow();
    });

    test('should warn about no transport protocols enabled', () => {
      // Mock console.warn to capture expected warning
      const warnings: string[] = [];
      console.warn = (message: string) => {
        warnings.push(message);
      };
      
      const config = {
        ...loadConfig(),
        useHttp: false,
        useSse: false
      };

      // Call validateConfig directly
      validateConfig(config);
      
      expect(warnings).toContain('No transport protocols enabled. Server will only work with stdio transport.');
    });

    test('should throw error when port is invalid', () => {
      const config = {
        ...loadConfig(),
        port: 0
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nInvalid port: 0. Must be between 1 and 65535.'
      );
    });

    test('should warn about wildcard CORS in production', () => {
      // Mock console.warn to capture expected warning
      const warnings: string[] = [];
      console.warn = (message: string) => {
        warnings.push(message);
      };
      
      const config = {
        ...loadConfig(),
        nodeEnv: 'production',
        corsOrigins: ['*']
      };

      // Call validateConfig directly
      validateConfig(config);
      
      expect(warnings).toContain('CORS is set to allow all origins (*) in production. Consider restricting to specific domains.');
    });

    test('should validate port range', () => {
      const config = {
        ...loadConfig(),
        port: 70000
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nInvalid port: 70000. Must be between 1 and 65535.'
      );
    });

    test('should require server name', () => {
      const config = {
        ...loadConfig(),
        name: ''
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nServer name is required'
      );
    });

    test('should require server version', () => {
      const config = {
        ...loadConfig(),
        version: ''
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nServer version is required'
      );
    });

    test('should warn about unknown NODE_ENV values', () => {
      const warnings: string[] = [];
      console.warn = (message: string) => {
        warnings.push(message);
      };
      
      const config = {
        ...loadConfig(),
        nodeEnv: 'staging'
      };

      validateConfig(config);
      
      expect(warnings).toContain('Unknown NODE_ENV: staging. Expected: development, production, or test.');
    });

    test('should warn about unknown LOG_LEVEL values', () => {
      const warnings: string[] = [];
      console.warn = (message: string) => {
        warnings.push(message);
      };
      
      const config = {
        ...loadConfig(),
        logLevel: 'verbose'
      };

      validateConfig(config);
      
      expect(warnings).toContain('Unknown LOG_LEVEL: verbose. Expected: error, warn, info, or debug.');
    });

    test('should throw error when HTTP/SSE enabled but port is zero', () => {
      const config = {
        ...loadConfig(),
        useHttp: true,
        port: 0
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nInvalid port: 0. Must be between 1 and 65535.\nPort must be specified when HTTP or SSE transport is enabled'
      );
    });

    test('should throw error when CORS origins is empty', () => {
      const config = {
        ...loadConfig(),
        corsOrigins: []
      };

      expect(() => validateConfig(config)).toThrow(
        'Configuration validation failed:\nAt least one CORS origin must be specified'
      );
    });
  });
}); 