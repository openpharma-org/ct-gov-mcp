/// <reference types="jest" />
import { getToolDefinitions, getToolHandler } from '../../src/tools/index.js';

describe('Tools Index', () => {
  test('should return array of tool definitions', () => {
    const definitions = getToolDefinitions();
    
    expect(Array.isArray(definitions)).toBe(true);
    expect(definitions.length).toBeGreaterThan(0);
    
    // Check that each definition has the required properties
    definitions.forEach(def => {
      expect(def).toHaveProperty('name');
      expect(def).toHaveProperty('description');
      expect(def).toHaveProperty('inputSchema');
      expect(typeof def.name).toBe('string');
      expect(typeof def.description).toBe('string');
      expect(typeof def.inputSchema).toBe('object');
    });
  });

  test('should include ct_gov_studies unified tool', () => {
    const definitions = getToolDefinitions();
    const ctGovTool = definitions.find(def => def.name === 'ct_gov_studies');
    
    expect(ctGovTool).toBeDefined();
    expect(ctGovTool?.description).toContain('clinical trials');
    expect(ctGovTool?.description).toContain('suggestions');
    expect(ctGovTool?.description).toContain('study information');
    expect(ctGovTool?.inputSchema.properties).toHaveProperty('method');
    expect(ctGovTool?.inputSchema.properties).toHaveProperty('condition');
    expect(ctGovTool?.inputSchema.properties).toHaveProperty('input');
    expect(ctGovTool?.inputSchema.properties).toHaveProperty('nctId');
    expect(ctGovTool?.inputSchema.required).toEqual(['method']);
  });

  test('should return handler for ct_gov_studies', () => {
    const handler = getToolHandler('ct_gov_studies');
    
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');
  });

  test('should return undefined for non-existent tool', () => {
    const handler = getToolHandler('non_existent_tool');
    
    expect(handler).toBeUndefined();
  });

  test('should execute ct_gov_studies handler with search method', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      // Mock fetch for this test
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          total: 0, 
          hits: [], 
          from: 0, 
          limit: 10, 
          terms: [] 
        })
      } as Response);

      try {
        const result = await handler({ method: 'search', condition: 'Diabetes' });
        expect(typeof result).toBe('string');
        expect(result).toContain('Clinical Trials Search Results');
      } finally {
        global.fetch = originalFetch;
      }
    }
  });

  test('should execute ct_gov_studies handler with suggest method', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      // Mock fetch for this test
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(['Diabetes Mellitus', 'Diabetes Type 1', 'Diabetes Type 2'])
      } as Response);

      try {
        const result = await handler({ method: 'suggest', input: 'diab', dictionary: 'Condition' });
        expect(typeof result).toBe('string');
        expect(result).toContain('ClinicalTrials.gov Suggestions');
      } finally {
        global.fetch = originalFetch;
      }
    }
  });

  test('should execute ct_gov_studies handler with get method', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      // Mock fetch for this test
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          protocolSection: {
            identificationModule: {
              nctId: 'NCT00841061',
              briefTitle: 'Test Study'
            },
            statusModule: {
              overallStatus: 'COMPLETED'
            },
            designModule: {
              studyType: 'INTERVENTIONAL'
            }
          }
        })
      } as Response);

      try {
        const result = await handler({ method: 'get', nctId: 'NCT00841061' });
        expect(typeof result).toBe('string');
        expect(result).toContain('Clinical Trial Details');
      } finally {
        global.fetch = originalFetch;
      }
    }
  });

  test('should handle case sensitivity for tool names', () => {
    const handler1 = getToolHandler('STUDIES');
    const handler2 = getToolHandler('Studies');
    
    expect(handler1).toBeUndefined();
    expect(handler2).toBeUndefined();
  });

  test('should handle empty string tool name', () => {
    const handler = getToolHandler('');
    
    expect(handler).toBeUndefined();
  });

  test('should handle undefined tool name', () => {
    const handler = getToolHandler(undefined as any);
    
    expect(handler).toBeUndefined();
  });

  test('should have unified ct_gov_studies tool registered', () => {
    const definitions = getToolDefinitions();
    
    expect(definitions.length).toBe(1);
    const toolNames = definitions.map(def => def.name);
    expect(toolNames).toContain('ct_gov_studies');
    
    // Verify the unified tool contains method parameter with correct enum values
    const ctGovTool = definitions.find(def => def.name === 'ct_gov_studies');
    expect(ctGovTool?.inputSchema.properties.method).toEqual({
      type: 'string',
      enum: ['search', 'suggest', 'get'],
      description: 'The operation to perform: search (find clinical trials), suggest (get term suggestions), or get (get detailed study information)'
    });
  });

  test('should throw error for invalid method', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      await expect(handler({ method: 'invalid_method' })).rejects.toThrow('Invalid method: invalid_method. Must be one of: search, suggest, get');
    }
  });

  test('should validate required parameters for each method', async () => {
    const handler = getToolHandler('ct_gov_studies');
    
    if (handler) {
      // Test suggest method validation
      await expect(handler({ method: 'suggest' })).rejects.toThrow('input parameter is required for suggest method');
      await expect(handler({ method: 'suggest', input: 'test' })).rejects.toThrow('dictionary parameter is required for suggest method');
      await expect(handler({ method: 'suggest', input: 'a', dictionary: 'Condition' })).rejects.toThrow('Input must be at least 2 characters long');
      
      // Test get method validation
      await expect(handler({ method: 'get' })).rejects.toThrow('nctId parameter is required for get method');
      await expect(handler({ method: 'get', nctId: 'invalid' })).rejects.toThrow('Invalid NCT ID format');
    }
  });
}); 