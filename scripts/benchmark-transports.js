#!/usr/bin/env node

import Benchmark from 'benchmark';
import fs from 'fs';
import path from 'path';
import { mkdirSync } from 'fs';
import { createMcpServer } from '../dist/transports/mcp-server.js';
import { loadConfig } from '../dist/utils/config.js';
import { createLogger } from '../dist/utils/logger.js';

// Determine output directory: current dir for CI, temp dir for local development
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const outputDir = isCI ? '.' : './temp';

// Ensure output directory exists
if (!isCI) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📁 Output directory: ${path.resolve(outputDir)} ${isCI ? '(CI mode)' : '(local mode)'}`);

const suite = new Benchmark.Suite();

console.log('🚀 Transport Performance Benchmarks');
console.log('====================================\n');

// Mock transport for testing
class MockTransport {
  constructor() {
    this.connected = false;
    this.messageCount = 0;
  }
  
  async connect() {
    this.connected = true;
    return Promise.resolve();
  }
  
  async send(message) {
    this.messageCount++;
    return Promise.resolve();
  }
  
  async close() {
    this.connected = false;
    return Promise.resolve();
  }
}

// Benchmark MCP server creation
suite.add('MCP Server Creation', function() {
  const config = loadConfig();
  const logger = createLogger('error', false); // Use error level to reduce noise
  createMcpServer(config, logger);
});

// Benchmark config loading with different scenarios
suite.add('Config Loading - Default', function() {
  // Clear environment to test defaults
  const originalEnv = { ...process.env };
  delete process.env.USE_HTTP;
  delete process.env.USE_SSE;
  delete process.env.PORT;
  
  loadConfig();
  
  // Restore environment
  Object.assign(process.env, originalEnv);
});

suite.add('Config Loading - With Environment Variables', function() {
  // Set environment variables
  process.env.USE_HTTP = 'true';
  process.env.PORT = '3001';
  process.env.LOG_LEVEL = 'debug';
  
  loadConfig();
  
  // Clean up
  delete process.env.USE_HTTP;
  delete process.env.PORT;
  delete process.env.LOG_LEVEL;
});

// Logger performance with different levels (excluding debug to prevent infinite output)
const logLevels = ['error', 'warn', 'info']; // Removed 'debug' to prevent infinite console output

logLevels.forEach(level => {
  suite.add(`Logger Creation - ${level} level`, function() {
    // Only test logger creation, don't use the logger to prevent console spam
    const logger = createLogger(level, false);
    // Don't call any logging methods to prevent infinite output
  });
});

// Logger message throughput (using error level to prevent console spam)
suite.add('Logger - Info Messages (100x)', function() {
  const logger = createLogger('error', false); // Use error level to prevent console output
  // Create a mock write function to prevent actual console output during benchmarking
  const originalWrite = process.stdout.write;
  const originalErrorWrite = process.stderr.write;
  process.stdout.write = () => true;
  process.stderr.write = () => true;
  
  for (let i = 0; i < 100; i++) {
    logger.info(`Test message ${i}`, { iteration: i });
  }
  
  // Restore original write functions
  process.stdout.write = originalWrite;
  process.stderr.write = originalErrorWrite;
});

suite.add('Logger - Error Messages (100x)', function() {
  const logger = createLogger('error', false);
  // Create a mock write function to prevent actual console output during benchmarking
  const originalWrite = process.stdout.write;
  const originalErrorWrite = process.stderr.write;
  process.stdout.write = () => true;
  process.stderr.write = () => true;
  
  for (let i = 0; i < 100; i++) {
    logger.error(`Error message ${i}`, { error: `Error ${i}` });
  }
  
  // Restore original write functions
  process.stdout.write = originalWrite;
  process.stderr.write = originalErrorWrite;
});

// JSON serialization performance (simulating message passing)
const smallMessage = { type: 'request', id: 1, method: 'test', params: {} };
const mediumMessage = {
  type: 'response',
  id: 1,
  result: {
    tools: Array.from({ length: 50 }, (_, i) => ({
      name: `tool_${i}`,
      description: `Description for tool ${i}`,
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string' },
          param2: { type: 'number' }
        }
      }
    }))
  }
};

const largeMessage = {
  type: 'response',
  id: 1,
  result: {
    data: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random(),
      text: `Sample text ${i} with some content to make it realistic`,
      metadata: {
        timestamp: new Date().toISOString(),
        user: `user_${i % 10}`,
        tags: [`tag_${i % 5}`, `category_${i % 3}`]
      }
    }))
  }
};

suite.add('JSON Serialization - Small Message', function() {
  JSON.stringify(smallMessage);
});

suite.add('JSON Serialization - Medium Message', function() {
  JSON.stringify(mediumMessage);
});

suite.add('JSON Serialization - Large Message', function() {
  JSON.stringify(largeMessage);
});

suite.add('JSON Parse - Small Message', function() {
  const serialized = JSON.stringify(smallMessage);
  JSON.parse(serialized);
});

suite.add('JSON Parse - Medium Message', function() {
  const serialized = JSON.stringify(mediumMessage);
  JSON.parse(serialized);
});

suite.add('JSON Parse - Large Message', function() {
  const serialized = JSON.stringify(largeMessage);
  JSON.parse(serialized);
});

// Simulate message processing overhead
suite.add('Message Processing - Request Validation', function() {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'math_calculator',
      arguments: { operation: 'add', a: 5, b: 3 }
    }
  };
  
  // Simulate validation
  const isValid = request.jsonrpc === '2.0' && 
                  typeof request.id !== 'undefined' && 
                  typeof request.method === 'string' &&
                  typeof request.params === 'object';
  
  return isValid;
});

// Transport connection simulation
suite.add('Mock Transport - Connection Setup', {
  defer: true,
  fn: function(deferred) {
    const transport = new MockTransport();
    transport.connect().then(() => deferred.resolve());
  }
});

suite.add('Mock Transport - Message Sending (10x)', {
  defer: true,
  fn: function(deferred) {
    const transport = new MockTransport();
    transport.connect().then(() => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        transport.send({ id: i, data: `message ${i}` })
      );
      return Promise.all(promises);
    }).then(() => deferred.resolve());
  }
});

// Concurrent operations
suite.add('Concurrent Config Loading (10x)', {
  defer: true,
  fn: function(deferred) {
    const promises = Array.from({ length: 10 }, () => 
      Promise.resolve(loadConfig())
    );
    Promise.all(promises).then(() => deferred.resolve());
  }
});

suite.add('Concurrent Logger Creation (10x)', {
  defer: true,
  fn: function(deferred) {
    const promises = Array.from({ length: 10 }, (_, i) => 
      Promise.resolve(createLogger('info', i % 2 === 0))
    );
    Promise.all(promises).then(() => deferred.resolve());
  }
});

// Set a global timeout to prevent infinite runs
const benchmarkTimeout = setTimeout(() => {
  console.error('⚠️ Benchmark timeout reached (10 minutes), stopping...');
  process.exit(1);
}, 10 * 60 * 1000); // 10 minutes

// Run benchmarks
suite
  .on('cycle', function(event) {
    const benchmark = event.target;
    const ops = Math.round(benchmark.hz).toLocaleString();
    const rme = Math.round(benchmark.stats.rme * 100) / 100;
    console.log(`${benchmark.name}: ${ops} ops/sec ±${rme}%`);
  })
  .on('error', function(event) {
    console.error('Benchmark error:', event.target.error);
  })
  .on('complete', function() {
    clearTimeout(benchmarkTimeout);
    console.log('\n🏆 Transport Benchmark Results:');
    console.log('================================');
    
    const fastest = this.filter('fastest');
    const slowest = this.filter('slowest');
    
    console.log(`\n🥇 Fastest: ${fastest[0].name}`);
    console.log(`🐌 Slowest: ${slowest[0].name}`);
    
    // Categorize results
    const results = this.map(benchmark => ({
      name: benchmark.name,
      ops: Math.round(benchmark.hz),
      category: benchmark.name.includes('Config') ? 'Configuration' :
               benchmark.name.includes('Logger') ? 'Logging' :
               benchmark.name.includes('JSON') ? 'Serialization' :
               benchmark.name.includes('Transport') ? 'Transport' :
               benchmark.name.includes('Message') ? 'Message Processing' :
               benchmark.name.includes('Concurrent') ? 'Concurrency' : 'Other'
    }));
    
    const categories = {};
    results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });
    
    console.log('\n📊 Performance by Category:');
    Object.entries(categories).forEach(([category, benchmarks]) => {
      const avgOps = benchmarks.reduce((sum, b) => sum + b.ops, 0) / benchmarks.length;
      const maxOps = Math.max(...benchmarks.map(b => b.ops));
      const minOps = Math.min(...benchmarks.map(b => b.ops));
      
      console.log(`${category}:`);
      console.log(`  Average: ${Math.round(avgOps).toLocaleString()} ops/sec`);
      console.log(`  Range: ${minOps.toLocaleString()} - ${maxOps.toLocaleString()} ops/sec`);
    });
    
    // Performance insights
    console.log('\n💡 Transport Performance Insights:');
    
    const serializationBenchmarks = results.filter(r => r.category === 'Serialization');
    if (serializationBenchmarks.length > 0) {
      const avgSerialization = serializationBenchmarks.reduce((sum, b) => sum + b.ops, 0) / serializationBenchmarks.length;
      if (avgSerialization > 100000) {
        console.log('🟢 JSON serialization performance is excellent');
      } else if (avgSerialization > 10000) {
        console.log('🟡 JSON serialization performance is good');
      } else {
        console.log('🔴 JSON serialization may be a bottleneck');
      }
    }
    
    const loggingBenchmarks = results.filter(r => r.category === 'Logging');
    if (loggingBenchmarks.length > 0) {
      const avgLogging = loggingBenchmarks.reduce((sum, b) => sum + b.ops, 0) / loggingBenchmarks.length;
      if (avgLogging < 10000) {
        console.log('⚠️  Logging performance could impact high-throughput scenarios');
      } else {
        console.log('✅ Logging performance is adequate');
      }
    }
    
    // Convert results to the array format expected by github-action-benchmark
    const transportResults = [];
    
    // Add each benchmark result as an array entry
    this.forEach(function(bench) {
      if (!bench.error) {
        transportResults.push({
          name: bench.name,
          unit: 'ops/sec',
          value: bench.hz || bench.stats.mean || 0,
          range: bench.stats.rme ? bench.stats.rme.toFixed(2) + '%' : undefined,
          extra: `samples: ${bench.stats.sample.length}, mean: ${(bench.stats.mean || 0).toFixed(6)}s`
        });
      }
    });
    
    const outputFile = path.join(outputDir, 'transport-benchmark-results.json');
    fs.writeFileSync(outputFile, JSON.stringify(transportResults, null, 2));
    console.log(`\n💾 Results saved to: ${outputFile}`);
    
    console.log('\n📊 Transport Benchmark Summary:');
    transportResults.forEach(result => {
      console.log(`  ${result.name}: ${result.value.toFixed(2)} ${result.unit}`);
    });
    
    process.exit(0);
  })
  .run({ async: true }); 