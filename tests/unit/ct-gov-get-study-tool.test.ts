import { definition, handler } from '../../src/tools/ct-gov-get-study-tool.js';

// Mock response data matching the API schema
const mockStudyResponse = {
  protocolSection: {
    identificationModule: {
      nctId: "NCT00841061",
      briefTitle: "Cereals as a Source of Iron for Breastfed Infants",
      officialTitle: "Breast Feeding and Iron: Comparison of Cereals Fortified With Different Forms of Iron",
      organization: {
        fullName: "Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD)",
        class: "NIH"
      }
    },
    statusModule: {
      overallStatus: "COMPLETED",
      startDateStruct: { date: "2003-07", type: "ACTUAL" },
      primaryCompletionDateStruct: { date: "2006-05", type: "ACTUAL" },
      expandedAccessInfo: { hasExpandedAccess: false }
    },
    sponsorCollaboratorsModule: {
      leadSponsor: { name: "National Institutes of Health (NIH)", class: "NIH" }
    },
    descriptionModule: {
      briefSummary: "Study of iron in infant cereals."
    },
    conditionsModule: {
      conditions: ["Iron Deficiency"]
    },
    designModule: {
      studyType: "INTERVENTIONAL",
      phases: ["NA"],
      designInfo: {
        allocation: "RANDOMIZED",
        interventionModel: "PARALLEL",
        primaryPurpose: "PREVENTION",
        maskingInfo: {
          masking: "QUADRUPLE",
          whoMasked: ["PARTICIPANT", "CARE_PROVIDER", "INVESTIGATOR", "OUTCOMES_ASSESSOR"]
        }
      },
      enrollmentInfo: { count: 111, type: "ACTUAL" }
    },
    outcomesModule: {
      primaryOutcomes: [
        {
          measure: "plasma ferritin",
          timeFrame: "280 days"
        }
      ]
    },
    contactsLocationsModule: {
      locations: [
        {
          facility: "University of Iowa",
          city: "Iowa City",
          state: "Iowa",
          country: "United States"
        }
      ]
    }
  },
  hasResults: false
};

// Enhanced mock response with all optional fields
const comprehensiveMockResponse = {
  protocolSection: {
    identificationModule: {
      nctId: "NCT00841061",
      orgStudyIdInfo: { id: "STUDY-123" },
      briefTitle: "Comprehensive Study Title",
      officialTitle: "Official Comprehensive Study Title",
      acronym: "CST",
      organization: {
        fullName: "Test Organization",
        class: "INDUSTRY"
      }
    },
    statusModule: {
      overallStatus: "ACTIVE_NOT_RECRUITING",
      statusVerifiedDate: "2024-01-15",
      startDateStruct: { date: "2024-01-01", type: "ACTUAL" },
      primaryCompletionDateStruct: { date: "2025-01-01", type: "ESTIMATED" },
      completionDateStruct: { date: "2025-06-01", type: "ESTIMATED" },
      expandedAccessInfo: { hasExpandedAccess: true }
    },
    sponsorCollaboratorsModule: {
      leadSponsor: { name: "Test Pharma Inc", class: "INDUSTRY" },
      collaborators: [
        { name: "University Partner", class: "OTHER" },
        { name: "NIH", class: "NIH" }
      ],
      responsibleParty: {
        type: "PRINCIPAL_INVESTIGATOR",
        investigatorFullName: "Dr. Jane Smith",
        investigatorTitle: "Principal Investigator",
        investigatorAffiliation: "Test University"
      }
    },
    descriptionModule: {
      briefSummary: "This is a brief summary of the study.",
      detailedDescription: "This is a detailed description with comprehensive information about the study methodology, objectives, and expected outcomes."
    },
    conditionsModule: {
      conditions: ["Multiple Sclerosis", "Relapsing Multiple Sclerosis"],
      keywords: ["neurological", "autoimmune", "inflammation", "demyelination"]
    },
    designModule: {
      studyType: "INTERVENTIONAL",
      phases: ["PHASE2", "PHASE3"],
      designInfo: {
        allocation: "RANDOMIZED",
        interventionModel: "PARALLEL",
        primaryPurpose: "TREATMENT",
        maskingInfo: {
          masking: "DOUBLE",
          whoMasked: ["PARTICIPANT", "INVESTIGATOR"]
        }
      },
      enrollmentInfo: { count: 500, type: "ESTIMATED" }
    },
    armsInterventionsModule: {
      armGroups: [
        {
          label: "Experimental Arm",
          type: "EXPERIMENTAL",
          description: "Participants receive the experimental drug",
          interventionNames: ["Drug X", "Standard Care"]
        },
        {
          label: "Control Arm",
          type: "PLACEBO_COMPARATOR",
          description: "Participants receive placebo",
          interventionNames: ["Placebo", "Standard Care"]
        }
      ],
      interventions: [
        {
          type: "DRUG",
          name: "Drug X",
          description: "Novel therapeutic compound for multiple sclerosis",
          armGroupLabels: ["Experimental Arm"]
        },
        {
          type: "DRUG",
          name: "Placebo",
          description: "Matching placebo capsules",
          armGroupLabels: ["Control Arm"]
        },
        {
          type: "OTHER",
          name: "Standard Care",
          description: "Standard medical care",
          armGroupLabels: ["Experimental Arm", "Control Arm"]
        }
      ]
    },
    outcomesModule: {
      primaryOutcomes: [
        {
          measure: "Reduction in relapse rate",
          description: "Number of confirmed relapses per patient per year",
          timeFrame: "24 months"
        },
        {
          measure: "Safety assessment",
          description: "Number of adverse events",
          timeFrame: "Throughout study period"
        }
      ],
      secondaryOutcomes: [
        {
          measure: "Quality of life score",
          description: "Measured using standardized questionnaire",
          timeFrame: "At 6, 12, 18, and 24 months"
        },
        {
          measure: "Disability progression",
          description: "Change in EDSS score",
          timeFrame: "24 months"
        }
      ]
    },
    eligibilityModule: {
      eligibilityCriteria: "Inclusion Criteria:\n- Age 18-65 years\n- Confirmed diagnosis of relapsing multiple sclerosis\n\nExclusion Criteria:\n- Pregnancy\n- Severe liver disease",
      healthyVolunteers: false,
      sex: "ALL",
      minimumAge: "18 Years",
      maximumAge: "65 Years",
      stdAges: ["ADULT", "OLDER_ADULT"]
    },
    contactsLocationsModule: {
      overallOfficials: [
        {
          name: "Dr. Jane Smith",
          affiliation: "Test University Medical Center",
          role: "PRINCIPAL_INVESTIGATOR"
        },
        {
          name: "Dr. Bob Johnson",
          affiliation: "Another Medical Center",
          role: "STUDY_DIRECTOR"
        }
      ],
      locations: [
        {
          facility: "Test University Medical Center",
          city: "New York",
          state: "New York",
          country: "United States",
          status: "RECRUITING"
        },
        {
          facility: "European Research Center",
          city: "London",
          country: "United Kingdom",
          status: "ACTIVE_NOT_RECRUITING"
        }
      ]
    },
    referencesModule: {
      references: [
        {
          pmid: "12345678",
          type: "BACKGROUND",
          citation: "Smith J, et al. Novel approaches to multiple sclerosis treatment. J Neurol. 2023;270(1):123-456."
        },
        {
          type: "RESULT",
          citation: "Johnson B, et al. Safety results from phase II study. Mult Scler J. 2024;30(2):789-012."
        }
      ]
    }
  },
  derivedSection: {
    conditionBrowseModule: {
      meshes: [
        { id: "D000009103", term: "Multiple Sclerosis" }
      ],
      browseLeaves: [
        { name: "Multiple Sclerosis", asFound: "Multiple Sclerosis", relevance: "HIGH" }
      ]
    },
    interventionBrowseModule: {
      meshes: [
        { id: "D000000001", term: "Drug" }
      ],
      browseLeaves: [
        { name: "Drug", asFound: "Drug", relevance: "HIGH" }
      ]
    }
  },
  hasResults: true
};

describe('CT.gov Get Study Tool', () => {
  describe('Tool Definition', () => {
    test('should have correct name and description', () => {
      expect(definition.name).toBe('ct_gov_get_study');
      expect(definition.description).toContain('Retrieve detailed information for a single clinical trial');
      expect(definition.description).toContain('NCT ID');
    });

    test('should have required nctId parameter', () => {
      expect(definition.inputSchema.required).toContain('nctId');
      const nctId = definition.inputSchema.properties.nctId;
      expect(nctId.type).toBe('string');
      expect(nctId.pattern).toBe('^[Nn][Cc][Tt]0*[1-9]\\d{0,7}$');
    });

    test('should have optional format parameter with valid enums', () => {
      const format = definition.inputSchema.properties.format;
      expect(format.type).toBe('string');
      expect(format.enum).toEqual(['json', 'csv', 'json.zip', 'fhir.json', 'ris']);
      expect(format.default).toBe('json');
    });

    test('should have optional fields parameter as array', () => {
      const fields = definition.inputSchema.properties.fields;
      expect(fields.type).toBe('array');
      expect(fields.items.type).toBe('string');
      expect(fields.minItems).toBe(1);
    });

    test('should have optional markupFormat parameter', () => {
      const markupFormat = definition.inputSchema.properties.markupFormat;
      expect(markupFormat.type).toBe('string');
      expect(markupFormat.enum).toEqual(['markdown', 'legacy']);
      expect(markupFormat.default).toBe('markdown');
    });

    test('should have comprehensive examples', () => {
      expect(definition.examples).toHaveLength(2);
      expect(definition.examples?.[0].description).toContain('complete study information');
      expect(definition.examples?.[1].description).toContain('specific fields only');
    });
  });

  describe('Handler Function', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('should retrieve study by NCT ID', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudyResponse)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('# Clinical Trial Details: NCT00841061');
        expect(result).toContain('Cereals as a Source of Iron for Breastfed Infants');
        expect(result).toContain('COMPLETED');
        expect(result).toContain('INTERVENTIONAL');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle comprehensive study with all optional fields', async () => {
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(comprehensiveMockResponse)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        // Check that all sections are included
        expect(result).toContain('# Clinical Trial Details: NCT00841061');
        expect(result).toContain('## Study Overview');
        expect(result).toContain('## Study Design');
        expect(result).toContain('## Summary');
        expect(result).toContain('## Detailed Description');
        expect(result).toContain('## Conditions');
        expect(result).toContain('## Keywords');
        expect(result).toContain('## Study Arms');
        expect(result).toContain('## Interventions');
        expect(result).toContain('## Primary Outcomes');
        expect(result).toContain('## Secondary Outcomes');
        expect(result).toContain('## Eligibility Criteria');
        expect(result).toContain('## Study Officials');
        expect(result).toContain('## Locations');
        expect(result).toContain('## References');
        expect(result).toContain('## Results');
        expect(result).toContain('## Expanded Access');
        
        // Check specific content
        expect(result).toContain('Lead Sponsor:** Test Pharma Inc');
        expect(result).toContain('Collaborators:** University Partner (OTHER), NIH (NIH)');
        expect(result).toContain('Official Title:** Official Comprehensive Study Title');
        expect(result).toContain('Acronym:** CST');
        expect(result).toContain('Study Completion:** June 1, 2025');
        expect(result).toContain('This is a detailed description');
        expect(result).toContain('- neurological');
        expect(result).toContain('- autoimmune');
        expect(result).toContain('- inflammation');
        expect(result).toContain('- demyelination');
        expect(result).toContain('1. Experimental Arm (Experimental)');
        expect(result).toContain('1. Drug X (Drug)');
        expect(result).toContain('1. Quality of life score');
        expect(result).toContain('Sex:** All');
        expect(result).toContain('Age Range:** 18 Years to 65 Years');
        expect(result).toContain('Age Groups:** Adult, Older Adult');
        expect(result).toContain('Healthy Volunteers:** No');
        expect(result).toContain('Dr. Jane Smith** (Principal Investigator)');
        expect(result).toContain('European Research Center, London, United Kingdom (Active Not Recruiting)');
        expect(result).toContain('PMID: 12345678');
        expect(result).toContain('Study results are available');
        expect(result).toContain('Expanded access available');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle different formats', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('CSV,Data,Here')
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061', format: 'csv' });
        
        expect(result).toContain('**Format:** CSV');
        expect(result).toContain('CSV,Data,Here');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle fhir.json format', async () => {
      global.fetch = () => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('{"resourceType": "Bundle"}')
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061', format: 'fhir.json' });
        
        expect(result).toContain('**Format:** FHIR.JSON');
        expect(result).toContain('{"resourceType": "Bundle"}');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle json.zip format', async () => {
      global.fetch = () => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('[Binary ZIP data]')
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061', format: 'json.zip' });
        
        expect(result).toContain('**Format:** JSON.ZIP');
        expect(result).toContain('[Binary ZIP data]');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle ris format', async () => {
      global.fetch = () => Promise.resolve({
        ok: true,
        text: () => Promise.resolve('TY  - JOUR\nTI  - Study Title\nER  - ')
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061', format: 'ris' });
        
        expect(result).toContain('**Format:** RIS');
        expect(result).toContain('TY  - JOUR');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle fields parameter in URL construction', async () => {
      let capturedUrl = '';
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudyResponse)
        } as Response);
      }) as typeof fetch;

      try {
        await handler({ 
          nctId: 'NCT00841061', 
          fields: ['IdentificationModule', 'StatusModule']
        });
        
        expect(capturedUrl).toContain('fields=IdentificationModule%2CStatusModule');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle markupFormat parameter in URL construction', async () => {
      let capturedUrl = '';
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudyResponse)
        } as Response);
      }) as typeof fetch;

      try {
        await handler({ 
          nctId: 'NCT00841061', 
          markupFormat: 'legacy'
        });
        
        expect(capturedUrl).toContain('markupFormat=legacy');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should validate NCT ID format', async () => {
      await expect(handler({ nctId: 'INVALID123' }))
        .rejects.toThrow('Invalid NCT ID format');
      
      await expect(handler({ nctId: 'NCT00000000' }))
        .rejects.toThrow('Invalid NCT ID format');
    });

    test('should handle 404 not found error', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      try {
        await expect(handler({ nctId: 'NCT99999999' }))
          .rejects.toThrow('Study not found: NCT99999999');
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
        await expect(handler({ nctId: 'NCT00841061' }))
          .rejects.toThrow('Study NCT00841061 has been redirected');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle network errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));

      try {
        await expect(handler({ nctId: 'NCT00841061' }))
          .rejects.toThrow('Network error');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should format study details comprehensively', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudyResponse)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        // Check main sections
        expect(result).toContain('# Clinical Trial Details: NCT00841061');
        expect(result).toContain('## Study Overview');
        expect(result).toContain('## Study Design');
        expect(result).toContain('## Summary');
        expect(result).toContain('## Conditions');
        expect(result).toContain('## Primary Outcomes');
        expect(result).toContain('## Locations');
        expect(result).toContain('## Results');
        
        // Check specific content
        expect(result).toContain('Lead Sponsor:** National Institutes of Health (NIH)');
        expect(result).toContain('Allocation:** Randomized');
        expect(result).toContain('Masking:** Quadruple');
        expect(result).toContain('Iron Deficiency');
        expect(result).toContain('plasma ferritin');
        expect(result).toContain('University of Iowa, Iowa City, Iowa');
        expect(result).toContain('No results posted yet');
        
        // Check link
        expect(result).toContain('[NCT00841061](https://clinicaltrials.gov/study/NCT00841061)');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should format enum values properly', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudyResponse)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        // Check that enum values are formatted nicely
        expect(result).toContain('Participant, Care Provider, Investigator, Outcomes Assessor');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle studies with results', async () => {
      const studyWithResults = {
        ...mockStudyResponse,
        hasResults: true
      };

      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithResults)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('Study results are available');
        expect(result).toContain('✅');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should accept valid NCT ID formats', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStudyResponse)
      } as Response);

      try {
        // These should all be valid
        const validNCTIDs = [
          'NCT00000001',
          'NCT12345678',
          'nct00000001', // lowercase
          'NCT000000001' // extra leading zeros
        ];

        for (const nctId of validNCTIDs) {
          await expect(handler({ nctId })).resolves.not.toThrow();
        }
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle API errors gracefully', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      try {
        await expect(handler({ nctId: 'NCT00841061' }))
          .rejects.toThrow('API request failed: 500 Internal Server Error');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalResponse = {
        protocolSection: {
          identificationModule: {
            nctId: "NCT00841061",
            briefTitle: "Minimal Study",
            organization: {
              fullName: "Test Org",
              class: "OTHER"
            }
          },
          statusModule: {
            overallStatus: "RECRUITING"
          }
        },
        hasResults: false
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(minimalResponse)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('# Clinical Trial Details: NCT00841061');
        expect(result).toContain('Minimal Study');
        expect(result).toContain('RECRUITING');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle study with healthy volunteers', async () => {
      const studyWithHealthyVolunteers = {
        ...mockStudyResponse,
        protocolSection: {
          ...mockStudyResponse.protocolSection,
          eligibilityModule: {
            healthyVolunteers: true,
            sex: "FEMALE",
            minimumAge: "21 Years",
            stdAges: ["ADULT"]
          }
        }
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithHealthyVolunteers)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('Healthy Volunteers:** Yes');
        expect(result).toContain('Sex:** Female');
        expect(result).toContain('Age Range:** 21 Years');
        expect(result).toContain('Age Groups:** Adult');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle studies with collaborators and responsible party', async () => {
      const studyWithCollaborators = {
        ...mockStudyResponse,
        protocolSection: {
          ...mockStudyResponse.protocolSection,
          sponsorCollaboratorsModule: {
            leadSponsor: { name: "Main Sponsor", class: "INDUSTRY" },
            collaborators: [
              { name: "Partner 1", class: "OTHER" },
              { name: "Partner 2", class: "NIH" }
            ],
            responsibleParty: {
              type: "SPONSOR",
              investigatorFullName: "Dr. Test Name",
              investigatorTitle: "Chief Investigator",
              investigatorAffiliation: "Test Institution"
            }
          }
        }
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithCollaborators)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('Collaborators:** Partner 1 (OTHER), Partner 2 (NIH)');
        // Note: Responsible party information is not displayed in current formatting
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle date formatting edge cases', async () => {
      const studyWithInvalidDate = {
        ...mockStudyResponse,
        protocolSection: {
          ...mockStudyResponse.protocolSection,
          statusModule: {
            ...mockStudyResponse.protocolSection.statusModule,
            statusVerifiedDate: "invalid-date",
            startDateStruct: { date: "malformed", type: "ACTUAL" }
          }
        }
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithInvalidDate)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        // Should handle invalid dates gracefully by showing Invalid Date
        expect(result).toContain('Invalid Date');
        expect(result).toContain('Invalid Date');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle locations without status', async () => {
      const studyWithLocationNoStatus = {
        ...mockStudyResponse,
        protocolSection: {
          ...mockStudyResponse.protocolSection,
          contactsLocationsModule: {
            locations: [
              {
                facility: "Test Facility",
                city: "Test City"
                // No status field
              }
            ]
          }
        }
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithLocationNoStatus)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('Test Facility, Test City');
        // Should not have status in parentheses
        expect(result).not.toMatch(/Test Facility, Test City \([^)]+\)/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle references without PMID', async () => {
      const studyWithReferencesNoPMID = {
        ...mockStudyResponse,
        protocolSection: {
          ...mockStudyResponse.protocolSection,
          referencesModule: {
            references: [
              {
                type: "BACKGROUND",
                citation: "Test citation without PMID"
              }
            ]
          }
        }
      };

      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(studyWithReferencesNoPMID)
      } as Response);

      try {
        const result = await handler({ nctId: 'NCT00841061' });
        
        expect(result).toContain('Background:** Test citation without PMID');
        expect(result).not.toContain('PMID:');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});