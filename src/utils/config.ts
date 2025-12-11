import dotenv from 'dotenv';
import { ServerConfig } from '../types.js';

dotenv.config();

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseStringArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function parseInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Load configuration from environment variables with sensible defaults
 * Validates environment variables and provides type safety
 */
export function loadConfig(): ServerConfig {
  return {
    name: process.env.npm_package_name || '@uh-joan/ct.gov-mcp-server',
    version: process.env.npm_package_version || '0.1.0',
    nodeEnv: process.env.NODE_ENV || 'production',
    logLevel: process.env.LOG_LEVEL || 'info',
    useHttp: parseBoolean(process.env.USE_HTTP, false),
    useSse: parseBoolean(process.env.USE_SSE, false),
    port: parseInt(process.env.PORT, 3000),
    ssePath: process.env.SSE_PATH || '/mcp',
    corsOrigins: parseStringArray(process.env.CORS_ORIGINS, ['*']),
    enablePerformanceMonitoring: parseBoolean(process.env.ENABLE_PERFORMANCE_MONITORING, true),
    enableExperimentalFeatures: parseBoolean(process.env.ENABLE_EXPERIMENTAL_FEATURES, false)
  };
}

/**
 * Validate that the configuration is valid for the current environment
 */
export function validateConfig(config: ServerConfig): void {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('Server name is required');
  }
  
  if (!config.version) {
    errors.push('Server version is required');
  }
  
  if (!['development', 'production', 'test'].includes(config.nodeEnv)) {
    console.warn(`Unknown NODE_ENV: ${config.nodeEnv}. Expected: development, production, or test.`);
  }
  
  if (!['error', 'warn', 'info', 'debug'].includes(config.logLevel)) {
    console.warn(`Unknown LOG_LEVEL: ${config.logLevel}. Expected: error, warn, info, or debug.`);
  }
  
  if (config.port <= 0 || config.port > 65535) {
    errors.push(`Invalid port: ${config.port}. Must be between 1 and 65535.`);
  }

  // Check transport configuration
  if (!config.useHttp && !config.useSse) {
    console.warn('No transport protocols enabled. Server will only work with stdio transport.');
  }
  
  if ((config.useHttp || config.useSse) && (!config.port || config.port === 0)) {
    errors.push('Port must be specified when HTTP or SSE transport is enabled');
  }

  if (config.corsOrigins.length === 0) {
    errors.push('At least one CORS origin must be specified');
  }

  // Check CORS configuration for production
  if (config.nodeEnv === 'production' && config.corsOrigins.includes('*')) {
    console.warn('CORS is set to allow all origins (*) in production. Consider restricting to specific domains.');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
} 