#!/usr/bin/env node

import Benchmark from 'benchmark';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

// ES module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine output directory: current dir for CI, temp dir for local development
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const outputDir = isCI ? '.' : './temp';

// Ensure output directory exists
if (!isCI) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📁 Output directory: ${path.resolve(outputDir)} ${isCI ? '(CI mode)' : '(local mode)'}`);

// Import our tools for benchmarking
import { handler as ctGovUnifiedHandler } from '../dist/tools/ct-gov-unified-tool.js';
import { getToolDefinitions, getToolHandler } from '../dist/tools/index.js';
import { loadConfig } from '../dist/utils/config.js';
import { createLogger } from '../dist/utils/logger.js';

const suite = new Benchmark.Suite();
const results = [];

// Helper function to add benchmark results
function addResult(name, benchmark) {
  // Skip warmup benchmark from results display
  if (name.startsWith('Warmup -')) {
    console.log(`${name}: ${Math.round(benchmark.hz).toLocaleString()} ops/sec ±${Math.round(benchmark.stats.rme * 100) / 100}% (warmup - excluded from results)`);
    return;
  }
  
  const result = {
    name,
    ops: Math.round(benchmark.hz),
    rme: Math.round(benchmark.stats.rme * 100) / 100,
    samples: benchmark.stats.sample.length,
    mean: Math.round(benchmark.stats.mean * 1000000) / 1000, // Convert to microseconds
    faster: '',
    slower: ''
  };
  results.push(result);
  console.log(`${name}: ${Math.round(benchmark.hz).toLocaleString()} ops/sec ±${Math.round(benchmark.stats.rme * 100) / 100}%`);
}

// Mock fetch for ct.gov tools testing - consistent across all benchmarks
const mockSearchFetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    total: 100,
    hits: [
      {
        id: 'NCT12345678',
        study: {
          protocolSection: {
            identificationModule: {
              briefTitle: 'Test Clinical Trial for Benchmarking'
            },
            statusModule: {
              overallStatus: 'RECRUITING',
              studyFirstSubmitDate: '2024-01-15'
            }
          }
        }
      }
    ]
  })
});

// Set consistent mock fetch for all search operations
global.fetch = mockSearchFetch;

// Pre-warm the unified tool with mock to ensure proper initialization
console.log('🔧 Pre-warming unified tool with mock...');

// Add a warmup benchmark first to initialize the mock properly
suite.add('Warmup - Initialize Mock', {
  defer: true,
  fn: function(deferred) {
    // Force mock initialization
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    ctGovUnifiedHandler({ method: 'search', condition: 'WarmupTest', limit: 1 })
      .then(() => {
        global.fetch = originalFetch; // Reset to our mock
        global.fetch = mockSearchFetch; // Ensure it's set
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch; // Reset to our mock  
        global.fetch = mockSearchFetch; // Ensure it's set
        deferred.resolve();
      });
  }
});

// Benchmark CT.gov search tool operations
suite.add('CT.gov Search - Simple Condition', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    ctGovUnifiedHandler({ method: 'search', condition: 'Diabetes', limit: 5 })
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

suite.add('CT.gov Search - Complex Query', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    ctGovUnifiedHandler({ 
      method: 'search',
      condition: 'Heart Failure', 
      phase: '2 3', 
      status: 'rec', 
      ages: 'adult',
      location: 'United States',
      limit: 10 
    })
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

suite.add('CT.gov Search - Advanced Filtering', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    ctGovUnifiedHandler({ 
      method: 'search',
      condition: 'Cancer', 
      intervention: 'Immunotherapy',
      phase: '1 2',
      status: 'rec act',
      healthy: 'y',
      studyType: 'int',
      funderType: 'industry',
      results: 'with',
      limit: 20
    })
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Mock fetch for suggest tool
const originalFetch = global.fetch; // This is now our mockSearchFetch
const mockSuggestFetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(['Diabetes Mellitus', 'Diabetes Mellitus Type 1', 'Diabetes Mellitus Type 2'])
});

suite.add('CT.gov Suggest - Condition', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch;
    ctGovUnifiedHandler({ method: 'suggest', input: 'diab', dictionary: 'Condition' })
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

suite.add('CT.gov Suggest - Intervention', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch;
    ctGovUnifiedHandler({ method: 'suggest', input: 'asp', dictionary: 'InterventionName' })
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Benchmark tool discovery
suite.add('Tool Discovery - getToolDefinitions', function() {
  getToolDefinitions();
});

suite.add('Tool Discovery - getToolHandler', function() {
  getToolHandler('ct_gov_studies');
  getToolHandler('nonexistent_tool');
  getToolHandler('another_nonexistent_tool');
});

// Benchmark configuration loading
suite.add('Config Loading', function() {
  loadConfig();
});

// Benchmark logger creation
suite.add('Logger Creation', function() {
  createLogger('info', false);
});

// Large data processing benchmarks
const largeSearchQueries = Array.from({ length: 50 }, (_, i) => ({
  condition: `Test Condition ${i}`,
  limit: 5
}));

suite.add('Batch CT.gov Searches (50 queries)', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    Promise.all(largeSearchQueries.map(query => ctGovUnifiedHandler({ method: 'search', ...query })))
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Complex suggestion processing
const complexSuggestions = Array.from({ length: 20 }, (_, i) => ({
  input: `test${i}`,
  dictionary: i % 2 === 0 ? 'Condition' : 'InterventionName'
}));

suite.add('Batch CT.gov Suggestions (20 queries)', {
  defer: true,
  fn: function(deferred) {
    const originalFetch = global.fetch;
    global.fetch = mockSuggestFetch;
    
    Promise.all(complexSuggestions.map(query => ctGovUnifiedHandler({ method: 'suggest', ...query })))
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Error handling performance
suite.add('Error Handling - Invalid Search Parameters', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSearchFetch;
    
    ctGovUnifiedHandler({ method: 'search' }) // No parameters should trigger validation error
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

suite.add('Error Handling - Invalid Suggestion Input', {
  defer: true,
  fn: function(deferred) {
    // Ensure mock is set for this specific call - be extra explicit
    const originalFetch = global.fetch;
    global.fetch = mockSuggestFetch;
    
    ctGovUnifiedHandler({ method: 'suggest', input: 'a', dictionary: 'Condition' }) // Too short input
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      })
      .catch(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Set a global timeout to prevent infinite runs
const benchmarkTimeout = setTimeout(() => {
  console.error('⚠️ Benchmark timeout reached (10 minutes), stopping...');
  process.exit(1);
}, 10 * 60 * 1000); // 10 minutes

// Run the benchmark suite
console.log('🚀 Starting ClinicalTrials.gov MCP Server Performance Benchmarks...\n');
console.log('==========================================');

suite
  .on('cycle', function(event) {
    addResult(event.target.name, event.target);
  })
  .on('error', function(event) {
    console.error('Benchmark error:', event.target.error);
  })
  .on('complete', function() {
    clearTimeout(benchmarkTimeout);
    console.log('\n==========================================');
    console.log('📊 Benchmark Results Summary:');
    console.log('==========================================\n');
    
    // Sort results by operations per second (descending)
    results.sort((a, b) => b.ops - a.ops);
    
    // Calculate relative performance
    const fastest = results[0];
    results.forEach((result, index) => {
      if (index === 0) {
        result.faster = 'baseline (fastest)';
      } else {
        const times = fastest.ops / result.ops;
        result.slower = `${Math.round(times * 100) / 100}x slower`;
      }
    });
    
    // Display formatted results
    console.log('Rank | Operation                              | Ops/sec    | ±RME    | Relative Performance');
    console.log('-----|----------------------------------------|------------|---------|--------------------');
    
    results.forEach((result, index) => {
      const rank = (index + 1).toString().padStart(4);
      const name = result.name.padEnd(38);
      const ops = result.ops.toLocaleString().padStart(10);
      const rme = `±${result.rme}%`.padStart(7);
      const relative = result.faster || result.slower;
      
      console.log(`${rank} | ${name} | ${ops} | ${rme} | ${relative}`);
    });
    
    // Performance insights
    console.log('\n==========================================');
    console.log('🔍 Performance Insights:');
    console.log('==========================================\n');
    
    const configOps = results.find(r => r.name === 'Config Loading')?.ops || 0;
    const loggerOps = results.find(r => r.name === 'Logger Creation')?.ops || 0;
    const toolDiscoveryOps = results.find(r => r.name === 'Tool Discovery - getToolDefinitions')?.ops || 0;
    
    console.log(`• Configuration loading: ${configOps.toLocaleString()} ops/sec`);
    console.log(`• Logger creation: ${loggerOps.toLocaleString()} ops/sec`);
    console.log(`• Tool discovery: ${toolDiscoveryOps.toLocaleString()} ops/sec`);
    
    const searchOps = results.filter(r => r.name.includes('CT.gov Search')).map(r => r.ops);
    const suggestOps = results.filter(r => r.name.includes('CT.gov Suggest')).map(r => r.ops);
    
    if (searchOps.length > 0) {
      const avgSearchOps = Math.round(searchOps.reduce((a, b) => a + b, 0) / searchOps.length);
      console.log(`• Average CT.gov search performance: ${avgSearchOps.toLocaleString()} ops/sec`);
    }
    
    if (suggestOps.length > 0) {
      const avgSuggestOps = Math.round(suggestOps.reduce((a, b) => a + b, 0) / suggestOps.length);
      console.log(`• Average CT.gov suggest performance: ${avgSuggestOps.toLocaleString()} ops/sec`);
    }
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestampedFilename = `benchmark-results-${timestamp}.json`;
    const fixedFilename = 'benchmark-results.json'; // For GitHub Action
    
    const timestampedPath = path.join(outputDir, timestampedFilename);
    const fixedPath = path.join(outputDir, fixedFilename);
    
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: isCI
      },
      summary: {
        totalTests: results.length,
        fastestOps: fastest.ops,
        slowestOps: results[results.length - 1].ops,
        averageOps: Math.round(results.reduce((sum, r) => sum + r.ops, 0) / results.length)
      },
      results
    };
    
    // Create GitHub Action compatible format
    const githubActionData = results.map(result => ({
      name: result.name,
      unit: 'ops/sec',
      value: result.ops,
      range: result.rme ? `±${result.rme}%` : undefined,
      extra: `samples: ${result.samples || 'N/A'}, mean: ${result.mean ? result.mean.toFixed(6) + 's' : 'N/A'}`
    }));
    
    try {
      // Save timestamped version for archival
      fs.writeFileSync(timestampedPath, JSON.stringify(reportData, null, 2));
      
      // Save GitHub Action compatible version
      fs.writeFileSync(fixedPath, JSON.stringify(githubActionData, null, 2));
      
      console.log(`\n📄 Detailed results saved to: ${timestampedFilename}`);
      if (isCI) {
        console.log(`📄 GitHub Action results saved to: ${fixedFilename}`);
      }
    } catch (error) {
      console.error(`\n❌ Failed to save results: ${error.message}`);
    }
    
    console.log('\n✅ Benchmark completed successfully!');
    console.log('==========================================\n');
  })
  .run({ async: true }); 