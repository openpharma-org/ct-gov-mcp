export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  // Coverage configuration - Focus on business logic, not infrastructure
  collectCoverage: false, // Only collect when explicitly requested
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Exclude barrel exports
    '!src/transports/**', // Exclude infrastructure/transport layer
    '!src/index.ts', // Exclude main entry point (tested via integration)
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 80,      // Focus on business logic only
      functions: 100,    // All business functions should be tested
      lines: 95,         // High standard for business logic
      statements: 95     // High standard for business logic
    },
    // Business logic modules with specific thresholds
    './src/tools/': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 85,
      functions: 100,
      lines: 95,
      statements: 95
    }
  },
  // Test patterns - more explicit separation
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.{js,ts}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/'
  ],
  // Setup for ES modules
  setupFilesAfterEnv: [],
  maxWorkers: '50%'
}; 