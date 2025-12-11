/// <reference types="jest" />
import { definition, handler } from '../../src/tools/ct-gov-unified-tool.js';

describe('CT.gov Unified Tool', () => {
  describe('Tool Definition', () => {
    test('should have correct name and description', () => {
      expect(definition.name).toBe('ct_gov_studies');
      expect(definition.description).toContain('Unified tool for ClinicalTrials.gov operations');
      expect(definition.description).toContain('search clinical trials');
      expect(definition.description).toContain('get term suggestions');
      expect(definition.description).toContain('retrieve detailed study information');
    });

    test('should have method parameter with correct enums', () => {
      const properties = definition.inputSchema.properties;
      expect(properties).toHaveProperty('method');
      expect(properties.method.type).toBe('string');
      expect(properties.method.enum).toEqual(['search', 'suggest', 'get']);
      expect(properties.method.description).toContain('search (find clinical trials)');
      expect(properties.method.description).toContain('suggest (get term suggestions)');
      expect(properties.method.description).toContain('get (get detailed study information)');
    });

    test('should have all search parameters', () => {
      const properties = definition.inputSchema.properties;
      expect(properties).toHaveProperty('condition');
      expect(properties).toHaveProperty('term');
      expect(properties).toHaveProperty('intervention');
      expect(properties).toHaveProperty('phase');
      expect(properties).toHaveProperty('status');
      expect(properties).toHaveProperty('limit');
      expect(properties).toHaveProperty('complexQuery');
      expect(properties).toHaveProperty('pageSize');
      expect(properties).toHaveProperty('pageToken');
      expect(properties).toHaveProperty('countTotal');
    });

    test('should have all suggest parameters', () => {
      const properties = definition.inputSchema.properties;
      expect(properties).toHaveProperty('input');
      expect(properties).toHaveProperty('dictionary');
      expect(properties.input.minLength).toBe(2);
      expect(properties.dictionary.enum).toEqual(['Condition', 'InterventionName', 'LeadSponsorName', 'LocationFacility']);
    });

    test('should have all get study parameters', () => {
      const properties = definition.inputSchema.properties;
      expect(properties).toHaveProperty('nctId');
      expect(properties).toHaveProperty('format');
      expect(properties).toHaveProperty('markupFormat');
      expect(properties).toHaveProperty('fields');
    });
  });

  describe('Handler Function', () => {
    test('should throw error for missing method parameter', async () => {
      await expect(handler({})).rejects.toThrow('Invalid method: undefined. Must be one of: search, suggest, get');
    });

    test('should throw error for invalid method', async () => {
      await expect(handler({ method: 'invalid' })).rejects.toThrow('Invalid method');
    });

    describe('Search Method', () => {
      test('should handle search with no parameters provided', async () => {
        const originalFetch = global.fetch;
        const mockResponse = {
          studies: [],
          totalCount: 542465,
          nextPageToken: null
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockResponse
        } as Response);

        try {
          const result = await handler({ method: 'search' });
          expect(result).toContain('542,465 studies found');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle successful search with condition', async () => {
        const originalFetch = global.fetch;
        const mockResponse = {
          studies: [
            {
                protocolSection: {
                  identificationModule: {
                  nctId: 'NCT12345678',
                  briefTitle: 'Test Study for Diabetes',
                  organization: { fullName: 'Test Organization', class: 'OTHER' }
                  },
                  statusModule: {
                  overallStatus: 'RECRUITING',
                    studyFirstSubmitDate: '2024-01-01'
                  }
              },
              hasResults: false
            }
          ],
          totalCount: 100,
          nextPageToken: null
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockResponse
        } as Response);

        try {
          const result = await handler({ method: 'search', condition: 'diabetes' });
          expect(result).toContain('1 of 100 studies found');
          expect(result).toContain('Test Study for Diabetes');
          expect(result).toContain('NCT12345678');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle search API error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        } as Response);

        try {
          await expect(handler({ method: 'search', condition: 'diabetes' }))
            .rejects.toThrow('API request failed: 500 Internal Server Error');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle network error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject(new Error('Network error'));

        try {
          await expect(handler({ method: 'search', condition: 'diabetes' }))
            .rejects.toThrow('Network error');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle search with multiple parameters and filters', async () => {
        const originalFetch = global.fetch;
        const mockResponse = {
          studies: [],
          totalCount: 50,
          nextPageToken: null
        };

        let capturedUrl = '';
        let capturedParams = '';
        global.fetch = ((url: RequestInfo | URL, _options?: RequestInit) => {
          capturedUrl = url.toString();
          capturedParams = url.toString().split('?')[1] || '';
          return Promise.resolve({
            ok: true,
            json: async () => mockResponse
          } as Response);
        });

        try {
          const result = await handler({
            method: 'search',
            condition: 'cancer',
            intervention: 'immunotherapy',
            phase: 'PHASE2',
            status: 'rec',
            ages: 'adult',
            pageSize: 5
          });

          expect(result).toContain('0 of 50 studies found');
          expect(capturedUrl).toContain('https://clinicaltrials.gov/api/v2/studies');
          expect(capturedParams).toContain('query.cond=cancer');
          expect(capturedParams).toContain('query.intr=immunotherapy');
          expect(capturedParams).toContain('pageSize=5');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle search with all advanced filter parameters', async () => {
        const originalFetch = global.fetch;
        const mockResponse = {
          studies: [],
          totalCount: 5,
          nextPageToken: null
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockResponse
        } as Response);

        try {
          const result = await handler({
            method: 'search',
            condition: 'diabetes',
            sex: 'all',
            studyType: 'interventional OR observational',
            funderType: 'nih OR fed OR industry',
            results: 'with without',
            docs: 'prot sap icf',
            healthy: 'y',
            violation: 'y',
            allocation: 'randomized OR nonrandomized',
            masking: 'double OR triple',
            assignment: 'parallel OR crossover',
            purpose: 'treatment OR prevention',
            model: 'cohort OR casecontrol',
            interventionType: 'drug OR device',
            timePerspective: 'prospective OR retrospective',
            whoMasked: 'participant OR investigator',
            start: '2024-01-01_2024-12-31',
            primComp: '2025-01-01_2025-12-31',
            firstPost: '2024-01-01_2024-12-31',
            resFirstPost: '2024-01-01_2024-12-31',
            lastUpdPost: '2024-01-01_2024-12-31',
            studyComp: '2025-01-01_2025-12-31',
            sort: '@relevance'
          });

          expect(result).toContain('0 of 5 studies found');
        } finally {
          global.fetch = originalFetch;
        }
      });
    });

    describe('Suggest Method', () => {
      test('should throw error when input parameter is missing', async () => {
        await expect(handler({ method: 'suggest' })).rejects.toThrow('input parameter is required for suggest method');
      });

      test('should throw error when dictionary parameter is missing', async () => {
        await expect(handler({ method: 'suggest', input: 'diabetes' })).rejects.toThrow('dictionary parameter is required for suggest method');
      });

      test('should throw error for input too short', async () => {
        await expect(handler({ method: 'suggest', input: 'a', dictionary: 'Condition' }))
          .rejects.toThrow('Input must be at least 2 characters long');
      });

      test('should handle successful suggest request', async () => {
        const originalFetch = global.fetch;
        const mockSuggestions = ['Diabetes Mellitus', 'Diabetes Mellitus, Type 2', 'Diabetes Complications'];
        
        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockSuggestions
        } as Response);

        try {
          const result = await handler({
            method: 'suggest',
            input: 'diabetes',
            dictionary: 'Condition'
          });

          expect(result).toContain('3 suggestions found');
          expect(result).toContain('Diabetes Mellitus');
          expect(result).toContain('Diabetes Mellitus, Type 2');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle empty suggestions', async () => {
        const originalFetch = global.fetch;
        
        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => []
        } as Response);

        try {
          const result = await handler({
            method: 'suggest',
            input: 'nonexistentterm',
            dictionary: 'Condition'
          });

          expect(result).toContain('0 suggestions found');
          expect(result).toContain('No suggestions found');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle suggest API error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        } as Response);

        try {
          const result = await handler({
            method: 'suggest',
            input: 'diabetes',
            dictionary: 'Condition'
          });
          expect(result).toContain('Failed to get suggestions');
          expect(result).toContain('API request failed: 404 Not Found');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle suggest network error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject(new Error('Connection timeout'));

        try {
          const result = await handler({
            method: 'suggest',
            input: 'diabetes',
            dictionary: 'Condition'
          });
          expect(result).toContain('Failed to get suggestions');
          expect(result).toContain('Connection timeout');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle different dictionary types', async () => {
        const originalFetch = global.fetch;
        const mockSuggestions = ['Test Intervention'];
        
        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockSuggestions
        } as Response);

        try {
          // Test InterventionName dictionary
          const result1 = await handler({
            method: 'suggest',
            input: 'test',
            dictionary: 'InterventionName'
          });
          expect(result1).toContain('Interventions & Treatments');

          // Test LeadSponsorName dictionary
          const result2 = await handler({
            method: 'suggest',
            input: 'test',
            dictionary: 'LeadSponsorName'
          });
          expect(result2).toContain('Lead Sponsors');

          // Test LocationFacility dictionary
          const result3 = await handler({
            method: 'suggest',
            input: 'test',
            dictionary: 'LocationFacility'
          });
          expect(result3).toContain('Medical Facilities');
        } finally {
          global.fetch = originalFetch;
        }
      });
    });

    describe('Get Method', () => {
      test('should throw error when nctId parameter is missing', async () => {
        await expect(handler({ method: 'get' })).rejects.toThrow('nctId parameter is required for get method');
      });

      test('should throw error for invalid NCT ID format', async () => {
        await expect(handler({ method: 'get', nctId: 'INVALID123' }))
          .rejects.toThrow('Invalid NCT ID format. Must be in format NCT followed by 8 digits');
      });

      test('should handle successful study retrieval with complete data', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study for Cancer Treatment',
              officialTitle: 'A Phase 3 Study of Test Treatment',
              acronym: 'TEST123',
              organization: {
                fullName: 'Test University',
                class: 'OTHER'
              }
            },
            statusModule: {
              overallStatus: 'Recruiting',
              statusVerifiedDate: '2024-01-01',
              startDateStruct: {
                date: '2024-02-01',
                type: 'Actual'
              },
              primaryCompletionDateStruct: {
                date: '2025-12-31',
                type: 'Anticipated'
              },
              completionDateStruct: {
                date: '2026-06-30',
                type: 'Anticipated'
              }
            },
            sponsorCollaboratorsModule: {
              leadSponsor: {
                name: 'Test Sponsor',
                class: 'INDUSTRY'
              },
              collaborators: [
                { name: 'Collaborator 1', class: 'OTHER' },
                { name: 'Collaborator 2', class: 'INDUSTRY' }
              ]
            },
            descriptionModule: {
              briefSummary: 'This is a test study for cancer treatment.'
            },
            conditionsModule: {
              conditions: ['Cancer', 'Solid Tumor']
            },
            designModule: {
              studyType: 'Interventional',
              phases: ['Phase 3'],
              designInfo: {
                allocation: 'Randomized',
                interventionModel: 'Parallel Assignment',
                primaryPurpose: 'Treatment',
                maskingInfo: {
                  masking: 'Double',
                  whoMasked: ['Participant', 'Investigator']
                }
              },
              enrollmentInfo: {
                count: 100,
                type: 'Anticipated'
              }
            },
            armsInterventionsModule: {
              interventions: [
                {
                  type: 'Drug',
                  name: 'Test Drug',
                  description: 'A test drug for cancer treatment',
                  armGroupLabels: ['Experimental Group']
                },
                {
                  type: 'Other',
                  name: 'Placebo',
                  armGroupLabels: ['Control Group']
                }
              ]
            },
            outcomesModule: {
              primaryOutcomes: [
                {
                  measure: 'Overall Survival',
                  description: 'Time from randomization to death',
                  timeFrame: '5 years'
                },
                {
                  measure: 'Progression Free Survival',
                  timeFrame: '3 years'
                }
              ]
            },
            eligibilityModule: {
              sex: 'All',
              minimumAge: '18 years',
              maximumAge: '75 years',
              healthyVolunteers: false,
              eligibilityCriteria: 'Inclusion criteria: Age 18-75, confirmed cancer diagnosis'
            },
            contactsLocationsModule: {
              locations: [
                {
                  facility: 'Test Hospital',
                  city: 'Boston',
                  state: 'Massachusetts',
                  country: 'United States',
                  status: 'Recruiting'
                },
                {
                  facility: 'Research Center',
                  country: 'Canada'
                }
              ]
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Test Study for Cancer Treatment');
          expect(result).toContain('A Phase 3 Study of Test Treatment');
          expect(result).toContain('TEST123');
          expect(result).toContain('NCT12345678');
          expect(result).toContain('Recruiting');
          expect(result).toContain('Test Sponsor');
          expect(result).toContain('Collaborator 1, Collaborator 2');
          expect(result).toContain('February 1, 2024');
          expect(result).toContain('December 31, 2025');
          expect(result).toContain('June 30, 2026');
          expect(result).toContain('Randomized');
          expect(result).toContain('Parallel assignment');
          expect(result).toContain('Double');
          expect(result).toContain('Participant, Investigator');
          expect(result).toContain('100 participants');
          expect(result).toContain('Cancer');
          expect(result).toContain('Solid Tumor');
          expect(result).toContain('Test Drug');
          expect(result).toContain('Overall Survival');
          expect(result).toContain('Time from randomization to death');
          expect(result).toContain('18 years to 75 years');
          expect(result).toContain('Healthy Volunteers:** No');
          expect(result).toContain('Test Hospital');
          expect(result).toContain('Boston, Massachusetts, United States');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle study with minimal data', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Minimal Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Completed' }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Minimal Study');
          expect(result).toContain('Completed');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle study with partial eligibility data', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            eligibilityModule: {
              sex: 'Female',
              minimumAge: '21 years',
              healthyVolunteers: true
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Female');
          expect(result).toContain('21 years to No maximum');
          expect(result).toContain('Healthy Volunteers:** Yes');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle study with partial eligibility data (max age only)', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            eligibilityModule: {
              maximumAge: '65 years'
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('No minimum to 65 years');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle 404 error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        } as Response);

        try {
          await expect(handler({
            method: 'get',
            nctId: 'NCT12345678'
          })).rejects.toThrow('Study not found: NCT12345678. Please verify the NCT ID is correct.');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle 301 redirect error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.resolve({
          ok: false,
          status: 301,
          statusText: 'Moved Permanently'
        } as Response);

        try {
          await expect(handler({
            method: 'get',
            nctId: 'NCT12345678'
          })).rejects.toThrow('Study NCT12345678 has been redirected. This may be an alias - try the canonical NCT ID.');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle get study network error', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject(new Error('Timeout'));

        try {
          await expect(handler({
            method: 'get',
            nctId: 'NCT12345678'
          })).rejects.toThrow('Timeout');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle different format options', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' }
          },
          hasResults: false
        };

        let capturedUrl = '';
        global.fetch = ((url: RequestInfo | URL) => {
          capturedUrl = url.toString();
          return Promise.resolve({
            ok: true,
            json: async () => mockStudy
          } as Response);
        });

        try {
          await handler({
            method: 'get',
            nctId: 'NCT12345678',
            format: 'json',
            markupFormat: 'markdown',
            fields: ['identificationModule', 'statusModule']
          });

          expect(capturedUrl).toContain('fields=identificationModule%2CstatusModule');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle non-JSON format', async () => {
        const originalFetch = global.fetch;
        const mockData = 'CSV data here';

        global.fetch = () => Promise.resolve({
          ok: true,
          text: async () => mockData
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678',
            format: 'csv'
          });

          expect(result).toContain('Clinical Trial Data: NCT12345678');
          expect(result).toContain('**Format:** CSV');
          expect(result).toContain('CSV data here');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle generic error in get study', async () => {
        const originalFetch = global.fetch;
        global.fetch = () => Promise.reject('Generic error string');

        try {
          await expect(handler({
            method: 'get',
            nctId: 'NCT12345678'
          })).rejects.toThrow('Failed to retrieve study data: Generic error string');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle empty enum values', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: {
              overallStatus: '',
              startDateStruct: {
                date: '2024-01-15',
                type: ''
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Test Study');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle study with no design but enrollment info', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            designModule: {
              studyType: 'Interventional',
              enrollmentInfo: {
                count: 50,
                type: 'Actual'
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('50 participants');
          expect(result).toContain('Study Design');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle intervention without description', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            armsInterventionsModule: {
              interventions: [
                {
                  type: 'Drug',
                  name: 'Test Drug',
                  armGroupLabels: ['Group A']
                }
              ]
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Drug: Test Drug');
          expect(result).toContain('Used in:** Group A');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle outcome without description but with timeframe', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            outcomesModule: {
              primaryOutcomes: [
                {
                  measure: 'Response Rate',
                  timeFrame: '12 months'
                }
              ]
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Response Rate');
          expect(result).toContain('Time Frame:** 12 months');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle location without city/state/country', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            contactsLocationsModule: {
              locations: [
                {
                  facility: 'Remote Study',
                  status: 'Recruiting'
                }
              ]
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Remote Study (Recruiting)');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle location without status', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'Recruiting' },
            contactsLocationsModule: {
              locations: [
                {
                  facility: 'Test Hospital',
                  city: 'New York',
                  state: 'NY'
                }
              ]
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Test Hospital, New York, NY');
          expect(result).not.toContain('(Recruiting)');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle underscore in enum values', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: { overallStatus: 'NOT_YET_RECRUITING' },
            designModule: {
              studyType: 'INTERVENTIONAL',
              designInfo: {
                allocation: 'RANDOMIZED',
                interventionModel: 'PARALLEL_ASSIGNMENT',
                primaryPurpose: 'BASIC_SCIENCE'
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Not Yet Recruiting');
          expect(result).toContain('Parallel Assignment');
          expect(result).toContain('Basic Science');
        } finally {
          global.fetch = originalFetch;
        }
      });
    });

    describe('Utility Functions', () => {
      test('should format dates correctly', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: {
              overallStatus: 'Recruiting',
              startDateStruct: {
                date: '2024-01-15',
                type: 'Actual'
              },
              primaryCompletionDateStruct: {
                date: '2025-12-31',
                type: 'Anticipated'
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('January 15, 2024');
          expect(result).toContain('December 31, 2025');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle invalid date formats', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: {
              overallStatus: 'Recruiting',
              startDateStruct: {
                date: 'invalid-date',
                type: 'Actual'
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Invalid Date');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should format enum values correctly', async () => {
        const originalFetch = global.fetch;
        const mockResponse = {
          studies: [
            {
                protocolSection: {
                  identificationModule: {
                  nctId: 'NCT12345678',
                  briefTitle: 'Test Study',
                  organization: { fullName: 'Test Organization', class: 'OTHER' }
                  },
                  statusModule: {
                  overallStatus: 'RECRUITING',
                    studyFirstSubmitDate: '2024-01-01'
                  }
              },
              hasResults: false
            }
          ],
          totalCount: 1,
          nextPageToken: null
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockResponse
        } as Response);

        try {
          const result = await handler({
            method: 'search',
            condition: 'diabetes',
            phase: 'EARLY_PHASE1',
            status: 'not',
            ages: 'child'
          });

          expect(result).toContain('1 of 1 studies found');
        } finally {
          global.fetch = originalFetch;
        }
      });

      test('should handle empty enum values', async () => {
        const originalFetch = global.fetch;
        const mockStudy = {
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Study',
              organization: { fullName: 'Test Org', class: 'OTHER' }
            },
            statusModule: {
              overallStatus: '',
              startDateStruct: {
                date: '2024-01-15',
                type: ''
              }
            }
          },
          hasResults: false
        };

        global.fetch = () => Promise.resolve({
          ok: true,
          json: async () => mockStudy
        } as Response);

        try {
          const result = await handler({
            method: 'get',
            nctId: 'NCT12345678'
          });

          expect(result).toContain('Test Study');
        } finally {
          global.fetch = originalFetch;
        }
      });
    });
  });
}); 