/// <reference types="jest" />
import { handler, definition } from '../../src/tools/ct-gov-suggest-tool.js';

describe('ct-gov-suggest-tool', () => {
  describe('definition', () => {
    it('should have correct tool name', () => {
      expect(definition.name).toBe('ct_gov_suggest');
    });

    it('should have correct input schema', () => {
      expect(definition.inputSchema.type).toBe('object');
      expect(definition.inputSchema.required).toEqual(['input', 'dictionary']);
      
      const properties = definition.inputSchema.properties;
      expect(properties.input.type).toBe('string');
      expect(properties.input.minLength).toBe(2);
      
      expect(properties.dictionary.type).toBe('string');
      expect(properties.dictionary.enum).toEqual([
        'Condition', 'InterventionName', 'LeadSponsorName', 'LocationFacility'
      ]);
    });

    it('should include examples', () => {
      expect(definition.examples).toBeDefined();
      expect(definition.examples!.length).toBeGreaterThan(0);
    });
  });

  describe('handler', () => {
    describe('input validation', () => {
      it('should throw error for input shorter than 2 characters', async () => {
        await expect(handler({
          input: 'a',
          dictionary: 'Condition'
        })).rejects.toThrow('Input must be at least 2 characters long');
      });

      it('should accept input with exactly 2 characters', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Ovarian Cancer'])
        } as Response);

        const result = await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(result).toContain('Ovarian Cancer');
        global.fetch = originalFetch;
      });
    });

    describe('API integration', () => {
      it('should call correct API endpoint with Condition dictionary', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        global.fetch = ((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['Ovarian Cancer', 'Overweight'])
          } as Response);
        }) as typeof fetch;

        await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(capturedUrl).toBe('https://clinicaltrials.gov/api/int/suggest?input=ov&dictionary=Condition');
        global.fetch = originalFetch;
      });

      it('should call correct API endpoint with InterventionName dictionary', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        global.fetch = ((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['Observation', 'Obinutuzumab'])
          } as Response);
        }) as typeof fetch;

        await handler({
          input: 'ob',
          dictionary: 'InterventionName'
        });

        expect(capturedUrl).toBe('https://clinicaltrials.gov/api/int/suggest?input=ob&dictionary=InterventionName');
        global.fetch = originalFetch;
      });

      it('should call correct API endpoint with LeadSponsorName dictionary', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        global.fetch = ((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['Pfizer', 'Pfenex, Inc'])
          } as Response);
        }) as typeof fetch;

        await handler({
          input: 'pf',
          dictionary: 'LeadSponsorName'
        });

        expect(capturedUrl).toBe('https://clinicaltrials.gov/api/int/suggest?input=pf&dictionary=LeadSponsorName');
        global.fetch = originalFetch;
      });

      it('should call correct API endpoint with LocationFacility dictionary', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        global.fetch = ((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['Cairo university', 'Case Western Reserve University'])
          } as Response);
        }) as typeof fetch;

        await handler({
          input: 'ca',
          dictionary: 'LocationFacility'
        });

        expect(capturedUrl).toBe('https://clinicaltrials.gov/api/int/suggest?input=ca&dictionary=LocationFacility');
        global.fetch = originalFetch;
      });
    });

    describe('response formatting', () => {
      it('should format successful response with suggestions', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Ovarian Cancer', 'Overweight', 'Overweight and Obesity'])
        } as Response);

        const result = await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(result).toContain('# ClinicalTrials.gov Suggestions');
        expect(result).toContain('**Dictionary:** Medical Conditions');
        expect(result).toContain('**Search Input:** "ov"');
        expect(result).toContain('**Results:** 3 suggestions found');
        expect(result).toContain('## Suggested Terms');
        expect(result).toContain('1. **Ovarian Cancer**');
        expect(result).toContain('2. **Overweight**');
        expect(result).toContain('3. **Overweight and Obesity**');
        expect(result).toContain('💡 **Tip:** You can use these suggested terms');
        global.fetch = originalFetch;
      });

      it('should format response with no suggestions', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        } as Response);

        const result = await handler({
          input: 'xyz',
          dictionary: 'Condition'
        });

        expect(result).toContain('# ClinicalTrials.gov Suggestions');
        expect(result).toContain('**Results:** 0 suggestions found');
        expect(result).toContain('No suggestions found for "xyz"');
        expect(result).toContain('**Tips:**');
        expect(result).toContain('- Try a shorter or more general search term');
        expect(result).toContain('- Check spelling');
        expect(result).toContain('- Try searching in a different dictionary');
        global.fetch = originalFetch;
      });

      it('should include correct dictionary information for Condition', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Diabetes'])
        } as Response);

        const result = await handler({
          input: 'di',
          dictionary: 'Condition'
        });

        expect(result).toContain('- Contains medical conditions, diseases, and health disorders');
        expect(result).toContain('- Use for precise condition names in clinical trial searches');
        global.fetch = originalFetch;
      });

      it('should include correct dictionary information for InterventionName', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Aspirin'])
        } as Response);

        const result = await handler({
          input: 'as',
          dictionary: 'InterventionName'
        });

        expect(result).toContain('**Dictionary:** Interventions & Treatments');
        expect(result).toContain('- Contains treatments, drugs, procedures, and interventions');
        expect(result).toContain('- Includes brand names, generic names, and treatment types');
        global.fetch = originalFetch;
      });

      it('should include correct dictionary information for LeadSponsorName', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Mayo Clinic'])
        } as Response);

        const result = await handler({
          input: 'ma',
          dictionary: 'LeadSponsorName'
        });

        expect(result).toContain('**Dictionary:** Lead Sponsors');
        expect(result).toContain('- Contains pharmaceutical companies, research institutions, and organizations');
        expect(result).toContain('- Use to find trials sponsored by specific entities');
        global.fetch = originalFetch;
      });

      it('should include correct dictionary information for LocationFacility', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Mayo Clinic Hospital'])
        } as Response);

        const result = await handler({
          input: 'ma',
          dictionary: 'LocationFacility'
        });

        expect(result).toContain('**Dictionary:** Medical Facilities');
        expect(result).toContain('- Contains hospital names, medical centers, and research facilities');
        expect(result).toContain('- Use to find trials at specific institutions');
        global.fetch = originalFetch;
      });
    });

    describe('error handling', () => {
      it('should handle API request failure', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        } as Response);

        const result = await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(result).toContain('# Error: ClinicalTrials.gov Suggest API');
        expect(result).toContain('❌ **Failed to get suggestions**');
        expect(result).toContain('**Error:** API request failed: 500 Internal Server Error');
        expect(result).toContain('- Input: "ov"');
        expect(result).toContain('- Dictionary: Condition');
        global.fetch = originalFetch;
      });

      it('should handle network error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject(new Error('Network error'));

        const result = await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(result).toContain('# Error: ClinicalTrials.gov Suggest API');
        expect(result).toContain('**Error:** Network error');
        global.fetch = originalFetch;
      });

      it('should handle unknown errors', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject('Unknown error string');

        const result = await handler({
          input: 'ov',
          dictionary: 'Condition'
        });

        expect(result).toContain('**Error:** Unknown error occurred');
        global.fetch = originalFetch;
      });
    });

    describe('URL encoding', () => {
      it('should properly encode special characters in input', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        global.fetch = ((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['Test Result'])
          } as Response);
        }) as typeof fetch;

        await handler({
          input: 'test & trial',
          dictionary: 'Condition'
        });

        expect(capturedUrl).toBe('https://clinicaltrials.gov/api/int/suggest?input=test+%26+trial&dictionary=Condition');
        global.fetch = originalFetch;
      });
    });
  });
}); 