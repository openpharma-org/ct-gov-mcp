#!/usr/bin/env node

import 'dotenv/config';
import { loadConfig, validateConfig } from './utils/config.js';
import { createLogger } from './utils/logger.js';
import { startStdioServer } from './transports/stdio.js';
import { startSseServer } from './transports/sse.js';
import { startHttpServer } from './transports/http.js';
import { LogLevel } from './types.js';

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue running
});

// Handle CLI help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
MCP Server Template v${process.env.npm_package_version || '0.1.0'}

USAGE:
  mcp-server [options]

OPTIONS:
  --help, -h     Show this help message
  --version, -v  Show version information

ENVIRONMENT VARIABLES:
  NODE_ENV       Environment: development, production, test (default: production)
  LOG_LEVEL      Logging level: error, warn, info, debug (default: info)
  USE_HTTP       Enable HTTP transport: true/false (default: false)
  USE_SSE        Enable SSE transport: true/false (default: false)
  PORT          Server port for HTTP/SSE (default: 3000)
  
For full configuration options, see: .env.example

EXAMPLES:
  # Run with stdio transport (default)
  mcp-server
  
  # Run with HTTP transport
  USE_HTTP=true PORT=3000 mcp-server
  
  # Run with debug logging
  LOG_LEVEL=debug mcp-server

For more information, visit: https://github.com/uh-joan/ct.gov-mcp-server
`);
  process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(process.env.npm_package_version || '0.1.0');
  process.exit(0);
}

async function main() {
  const config = loadConfig();
  
  // Validate configuration before proceeding
  try {
    validateConfig(config);
  } catch (error) {
    console.error('❌ Configuration validation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  
  const logger = createLogger(config.logLevel as LogLevel, config.useHttp);
  
  // Log configuration summary (without sensitive data)
  logger.info('🚀 Starting MCP Server', {
    name: config.name,
    version: config.version,
    environment: config.nodeEnv,
    transports: {
      http: config.useHttp,
      sse: config.useSse,
      stdio: !config.useHttp && !config.useSse
    },
    port: config.useHttp || config.useSse ? config.port : undefined,
    features: {
      experimental: config.enableExperimentalFeatures,
      performanceMonitoring: config.enablePerformanceMonitoring
    }
  });

  try {
    if (config.useSse) {
      await startSseServer(config, logger);
    } else if (config.useHttp) {
      await startHttpServer(config, logger);
    } else {
      await startStdioServer(config, logger);
    }
  } catch (error) {
    logger.error('Server error:', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

main(); 