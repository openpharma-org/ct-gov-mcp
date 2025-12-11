export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  // Quality thresholds - customize these values
  coverageThreshold: {
    global: {
      branches: 70,      // Require 70% branch coverage
      functions: 75,     // Require 75% function coverage
      lines: 75,         // Require 75% line coverage
      statements: 75     // Require 75% statement coverage
    },
    // Per-file thresholds for critical components
    './src/tools/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  // Fail fast on coverage issues
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json'],
  verbose: true,
  testTimeout: 10000,
}; 