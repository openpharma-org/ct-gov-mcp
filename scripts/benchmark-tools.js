#!/usr/bin/env node

import Benchmark from 'benchmark';
import fs from 'fs';
import path from 'path';
import { mkdirSync } from 'fs';

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

const suite = new Benchmark.Suite();

console.log('🔧 ClinicalTrials.gov Tool Performance Benchmarks');
console.log('==================================================\n');

// Mock fetch for consistent testing
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    total: 1000,
    hits: Array.from({ length: 10 }, (_, i) => ({
      id: `NCT${1234567 + i}`,
      study: {
        protocolSection: {
          identificationModule: {
            briefTitle: `Test Clinical Trial ${i + 1} for Performance Benchmarking`
          },
          statusModule: {
            overallStatus: 'RECRUITING',
            studyFirstSubmitDate: '2024-01-15'
          }
        }
      }
    }))
  })
});

// CT.gov search tool comprehensive benchmarks
const searchTestCases = [
  { condition: 'Diabetes', limit: 5 },
  { condition: 'Heart Failure', phase: '2', limit: 10 },
  { condition: 'Cancer', intervention: 'Immunotherapy', phase: '1 2', status: 'rec', limit: 15 },
      { condition: 'Alzheimer Disease', ages: 'adult older_adult', sex: 'all', location: 'United States', limit: 20 },
  { 
    condition: 'Hypertension', 
    intervention: 'ACE Inhibitor',
    phase: '3',
    status: 'rec act',
    ages: 'adult',
    healthy: 'y',
    studyType: 'int',
    funderType: 'industry',
    results: 'with',
    limit: 25
  }
];

searchTestCases.forEach((testCase, index) => {
  const complexity = Object.keys(testCase).length;
  suite.add(`CT.gov Search - Case ${index + 1} (${complexity} params)`, {
    defer: true,
    fn: function(deferred) {
      ctGovUnifiedHandler({ method: 'search', ...testCase })
        .then(() => deferred.resolve())
        .catch(() => deferred.resolve());
    }
  });
});

// Mock fetch for suggest tool
const originalFetch = global.fetch;
const mockSuggestFetch = (dictionary) => () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([
    `${dictionary} Suggestion 1`,
    `${dictionary} Suggestion 2`,
    `${dictionary} Suggestion 3`,
    `${dictionary} Suggestion 4`,
    `${dictionary} Suggestion 5`
  ])
});

// CT.gov suggest tool with different dictionaries and input lengths
const suggestTestCases = [
  { input: 'di', dictionary: 'Condition' },
  { input: 'diab', dictionary: 'Condition' },
  { input: 'diabetes', dictionary: 'Condition' },
  { input: 'asp', dictionary: 'InterventionName' },
  { input: 'aspirin', dictionary: 'InterventionName' },
  { input: 'pf', dictionary: 'LeadSponsorName' },
  { input: 'pfizer', dictionary: 'LeadSponsorName' },
  { input: 'ma', dictionary: 'LocationFacility' },
  { input: 'mayo clinic', dictionary: 'LocationFacility' }
];

suggestTestCases.forEach((testCase, index) => {
  const inputLength = testCase.input.length;
  suite.add(`CT.gov Suggest - ${testCase.dictionary} (${inputLength} chars)`, {
    defer: true,
    fn: function(deferred) {
      global.fetch = mockSuggestFetch(testCase.dictionary);
      ctGovUnifiedHandler({ method: 'suggest', ...testCase })
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
});

// Tool discovery performance
suite.add('Tool Discovery - getToolDefinitions (repeated)', function() {
  for (let i = 0; i < 100; i++) {
    getToolDefinitions();
  }
});

suite.add('Tool Discovery - getToolHandler (cache test)', function() {
  const tools = ['ct_gov_studies', 'nonexistent_tool', 'another_nonexistent_tool'];
  for (let i = 0; i < 100; i++) {
    tools.forEach(tool => getToolHandler(tool));
  }
});

// Concurrent tool execution
suite.add('Concurrent CT.gov Searches (10x)', {
  defer: true,
  fn: function(deferred) {
    const promises = Array.from({ length: 10 }, (_, i) => 
      ctGovUnifiedHandler({ 
        method: 'search',
        condition: `Test Condition ${i + 1}`, 
        limit: 5 
      })
    );
    Promise.all(promises)
      .then(() => deferred.resolve())
      .catch(() => deferred.resolve());
  }
});

suite.add('Concurrent CT.gov Suggestions (10x)', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch('Mixed');
    const promises = Array.from({ length: 10 }, (_, i) => 
      ctGovUnifiedHandler({ 
        method: 'suggest',
        input: `test${i}`, 
        dictionary: i % 2 === 0 ? 'Condition' : 'InterventionName' 
      })
    );
    Promise.all(promises)
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

// Mixed concurrent operations
suite.add('Mixed Concurrent Operations (5 search + 5 suggest)', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch('Mixed');
    
    const searchPromises = Array.from({ length: 5 }, (_, i) => 
      ctGovUnifiedHandler({ method: 'search', condition: `Condition ${i}`, limit: 5 })
    );
    
    const suggestPromises = Array.from({ length: 5 }, (_, i) => 
      ctGovUnifiedHandler({ method: 'suggest', input: `term${i}`, dictionary: 'Condition' })
    );
    
    Promise.all([...searchPromises, ...suggestPromises])
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
suite.add('Error Recovery - Invalid Operations', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch('Error');
    
    const invalidOps = [
      ctGovUnifiedHandler({ method: 'search' }), // No parameters
      ctGovUnifiedHandler({ method: 'suggest', input: 'a', dictionary: 'Condition' }), // Too short
      ctGovUnifiedHandler({ method: 'suggest', input: 'test', dictionary: 'InvalidDictionary' }), // Invalid dictionary
      ctGovUnifiedHandler({ method: 'search', condition: '', limit: 0 }), // Empty/invalid values
    ];
    
    Promise.allSettled(invalidOps)
      .then(() => {
        global.fetch = originalFetch;
        deferred.resolve();
      });
  }
});

// Large batch operations
suite.add('Large Batch - 25 Search Queries', {
  defer: true,
  fn: function(deferred) {
    const conditions = [
      'Diabetes', 'Hypertension', 'Cancer', 'Heart Disease', 'Stroke',
      'Asthma', 'COPD', 'Arthritis', 'Depression', 'Anxiety',
      'Obesity', 'Osteoporosis', 'Migraine', 'Epilepsy', 'Parkinson',
      'Alzheimer', 'Multiple Sclerosis', 'Lupus', 'Psoriasis', 'Eczema',
      'Glaucoma', 'Cataracts', 'Hearing Loss', 'Sleep Apnea', 'Fibromyalgia'
    ];
    
    const promises = conditions.map(condition => 
      ctGovUnifiedHandler({ method: 'search', condition, limit: 3 })
    );
    
    Promise.all(promises)
      .then(() => deferred.resolve())
      .catch(() => deferred.resolve());
  }
});

suite.add('Large Batch - 20 Suggestion Queries', {
  defer: true,
  fn: function(deferred) {
    global.fetch = mockSuggestFetch('Batch');
    
    const terms = [
      'dia', 'hyp', 'can', 'hea', 'str', 'ast', 'cop', 'art', 'dep', 'anx',
      'obe', 'ost', 'mig', 'epi', 'par', 'alz', 'mul', 'lup', 'pso', 'ecz'
    ];
    
    const promises = terms.map((input, i) => 
      ctGovUnifiedHandler({ 
        method: 'suggest',
        input, 
        dictionary: i % 4 === 0 ? 'Condition' : 
                   i % 4 === 1 ? 'InterventionName' :
                   i % 4 === 2 ? 'LeadSponsorName' : 'LocationFacility'
      })
    );
    
    Promise.all(promises)
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
    console.log('\n🏁 All ClinicalTrials.gov tool benchmarks completed!');
    
    // Convert results to the array format expected by github-action-benchmark
    const toolResults = [];
    
    // Add each benchmark result as an array entry
    this.forEach(function(bench) {
      if (!bench.error) {
        toolResults.push({
          name: bench.name,
          unit: 'ops/sec',
          value: bench.hz || bench.stats.mean || 0,
          range: bench.stats.rme ? bench.stats.rme.toFixed(2) + '%' : undefined,
          extra: `samples: ${bench.stats.sample.length}, mean: ${(bench.stats.mean || 0).toFixed(6)}s`
        });
      }
    });

    const outputFile = path.join(outputDir, 'tool-benchmark-results.json');
    fs.writeFileSync(outputFile, JSON.stringify(toolResults, null, 2));
    console.log(`\n💾 Results saved to: ${outputFile}`);
    
    console.log('\n📊 ClinicalTrials.gov Tool Benchmark Summary:');
    console.log('===============================================');
    
    // Group results by tool type
    const searchResults = toolResults.filter(r => r.name.includes('CT.gov Search'));
    const suggestResults = toolResults.filter(r => r.name.includes('CT.gov Suggest'));
    const concurrentResults = toolResults.filter(r => r.name.includes('Concurrent'));
    const batchResults = toolResults.filter(r => r.name.includes('Large Batch'));
    
    if (searchResults.length > 0) {
      console.log('\n🔍 Search Tool Performance:');
      searchResults.forEach(result => {
        console.log(`  ${result.name}: ${Math.round(result.value).toLocaleString()} ${result.unit}`);
      });
    }
    
    if (suggestResults.length > 0) {
      console.log('\n💡 Suggest Tool Performance:');
      suggestResults.forEach(result => {
        console.log(`  ${result.name}: ${Math.round(result.value).toLocaleString()} ${result.unit}`);
      });
    }
    
    if (concurrentResults.length > 0) {
      console.log('\n⚡ Concurrent Operations:');
      concurrentResults.forEach(result => {
        console.log(`  ${result.name}: ${Math.round(result.value).toLocaleString()} ${result.unit}`);
      });
    }
    
    if (batchResults.length > 0) {
      console.log('\n📦 Batch Operations:');
      batchResults.forEach(result => {
        console.log(`  ${result.name}: ${Math.round(result.value).toLocaleString()} ${result.unit}`);
      });
    }
    
    // Performance insights
    console.log('\n🎯 Performance Insights:');
    const avgSearchOps = searchResults.length > 0 ? 
      Math.round(searchResults.reduce((sum, r) => sum + r.value, 0) / searchResults.length) : 0;
    const avgSuggestOps = suggestResults.length > 0 ? 
      Math.round(suggestResults.reduce((sum, r) => sum + r.value, 0) / suggestResults.length) : 0;
    
    if (avgSearchOps > 0) console.log(`  Average search performance: ${avgSearchOps.toLocaleString()} ops/sec`);
    if (avgSuggestOps > 0) console.log(`  Average suggest performance: ${avgSuggestOps.toLocaleString()} ops/sec`);
    
    console.log(`  Total benchmarks completed: ${toolResults.length}`);
    console.log('\n✅ ClinicalTrials.gov tool benchmarking completed successfully!');
    
    process.exit(0);
  })
  .run({ async: true }); 