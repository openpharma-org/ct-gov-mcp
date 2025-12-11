/// <reference types="jest" />
import { definition, handler } from '../../src/tools/ct-gov-search-tool.js';

describe('CT.gov Search Tool', () => {
  describe('Tool Definition', () => {
    test('should have correct name and description', () => {
      expect(definition.name).toBe('ct_gov_search_studies');
      expect(definition.description).toContain('ClinicalTrials.gov');
      expect(definition.description).toContain('expanded access');
      expect(definition.description).toContain('healthy volunteer');
    });

    test('should have all required input properties', () => {
      const properties = definition.inputSchema.properties;
      expect(properties).toHaveProperty('condition');
      expect(properties).toHaveProperty('term');
      expect(properties).toHaveProperty('intervention');
      expect(properties).toHaveProperty('titles');
      expect(properties).toHaveProperty('outc');
      expect(properties).toHaveProperty('id');
      expect(properties).toHaveProperty('phase');
      expect(properties).toHaveProperty('status');
      expect(properties).toHaveProperty('ages');
      expect(properties).toHaveProperty('ageRange');
      expect(properties).toHaveProperty('sex');
      expect(properties).toHaveProperty('location');
      expect(properties).toHaveProperty('lead');
      expect(properties).toHaveProperty('healthy');
      expect(properties).toHaveProperty('studyType');
      expect(properties).toHaveProperty('funderType');
      expect(properties).toHaveProperty('results');
      expect(properties).toHaveProperty('docs');
      expect(properties).toHaveProperty('violation');
      expect(properties).toHaveProperty('start');
      expect(properties).toHaveProperty('primComp');
      expect(properties).toHaveProperty('firstPost');
      expect(properties).toHaveProperty('resFirstPost');
      expect(properties).toHaveProperty('lastUpdPost');
      expect(properties).toHaveProperty('studyComp');
      expect(properties).toHaveProperty('sort');
      expect(properties).toHaveProperty('limit');
    });

    test('should include expanded access status codes', () => {
      const statusEnum = definition.inputSchema.properties.status.enum;
      expect(statusEnum).toContain('ava');
      expect(statusEnum).toContain('nla');
      expect(statusEnum).toContain('tna');
      expect(statusEnum).toContain('afm');
      expect(statusEnum).toContain('ava nla tna afm');
    });

    test('should have healthy volunteers parameter', () => {
      const healthy = definition.inputSchema.properties.healthy;
      expect(healthy.type).toBe('string');
      expect(healthy.enum).toContain('y');
      expect(healthy.description).toContain('healthy volunteers');
    });

    test('should have study type parameter with all options', () => {
      const studyType = definition.inputSchema.properties.studyType;
      expect(studyType.enum).toContain('int');
      expect(studyType.enum).toContain('obs');
      expect(studyType.enum).toContain('obs_patreg');
      expect(studyType.enum).toContain('exp');
      expect(studyType.enum).toContain('exp_indiv');
      expect(studyType.enum).toContain('exp_inter');
      expect(studyType.enum).toContain('exp_treat');
    });

    test('should have enhanced funder type parameter with combinations', () => {
      const funderType = definition.inputSchema.properties.funderType;
      expect(funderType.enum).toContain('nih');
      expect(funderType.enum).toContain('fed');
      expect(funderType.enum).toContain('industry');
      expect(funderType.enum).toContain('other');
      expect(funderType.enum).toContain('nih OR fed');
      expect(funderType.enum).toContain('nih OR fed OR industry OR other');
      expect(funderType.enum).toContain('industry OR other');
    });

    test('should have enhanced results parameter with combinations', () => {
      const results = definition.inputSchema.properties.results;
      expect(results.enum).toContain('with');
      expect(results.enum).toContain('without');
      expect(results.enum).toContain('with without');
    });

    test('should have violation parameter', () => {
      const violation = definition.inputSchema.properties.violation;
      expect(violation.type).toBe('string');
      expect(violation.enum).toContain('y');
      expect(violation.description).toContain('FDA violations');
    });

    test('should have results and docs parameters', () => {
      const results = definition.inputSchema.properties.results;
      expect(results.enum).toContain('with');
      expect(results.enum).toContain('without');

      const docs = definition.inputSchema.properties.docs;
      expect(docs.enum).toContain('prot');
      expect(docs.enum).toContain('sap');
      expect(docs.enum).toContain('icf');
    });

    test('should have ageRange parameter with proper description', () => {
      const ageRange = definition.inputSchema.properties.ageRange;
      expect(ageRange.type).toBe('string');
      expect(ageRange.description).toContain('minAge_maxAge');
      expect(ageRange.description).toContain('16y_34y');
    });

    test('should have enhanced location description', () => {
      const location = definition.inputSchema.properties.location;
      expect(location.description).toContain('addresses, cities, states, countries');
      expect(location.description).toContain('Houston');
    });

    test('should have titles and outcomes parameters with proper descriptions', () => {
      const titles = definition.inputSchema.properties.titles;
      expect(titles.type).toBe('string');
      expect(titles.description).toContain('Search in study titles and acronyms');

      const outc = definition.inputSchema.properties.outc;
      expect(outc.type).toBe('string');
      expect(outc.description).toContain('Search in study outcomes');

      const id = definition.inputSchema.properties.id;
      expect(id.type).toBe('string');
      expect(id.description).toContain('Search by study identifiers');
      expect(id.description).toContain('NCT ID');
      expect(id.description).toContain('acronym');
    });

    test('should have date range parameters with proper descriptions', () => {
      const start = definition.inputSchema.properties.start;
      expect(start.type).toBe('string');
      expect(start.description).toContain('YYYY-MM-DD_YYYY-MM-DD');
      expect(start.description).toContain('2024-01-01_2025-03-12');

      const primComp = definition.inputSchema.properties.primComp;
      expect(primComp.type).toBe('string');
      expect(primComp.description).toContain('YYYY-MM-DD_YYYY-MM-DD');
      expect(primComp.description).toContain('2025-11-01_2025-12-12');

      const firstPost = definition.inputSchema.properties.firstPost;
      expect(firstPost.type).toBe('string');
      expect(firstPost.description).toContain('Study first posted');
      expect(firstPost.description).toContain('2025-01-01_2025-12-12');

      const resFirstPost = definition.inputSchema.properties.resFirstPost;
      expect(resFirstPost.type).toBe('string');
      expect(resFirstPost.description).toContain('Results first posted');
      expect(resFirstPost.description).toContain('2025-01-02_2025-11-11');

      const lastUpdPost = definition.inputSchema.properties.lastUpdPost;
      expect(lastUpdPost.type).toBe('string');
      expect(lastUpdPost.description).toContain('Last update posted');
      expect(lastUpdPost.description).toContain('2025-03-03_2025-10-10');

      const studyComp = definition.inputSchema.properties.studyComp;
      expect(studyComp.type).toBe('string');
      expect(studyComp.description).toContain('Study completion');
      expect(studyComp.description).toContain('2025-11-01_');
    });

    test('should have sort parameter with proper description and options', () => {
      const sort = definition.inputSchema.properties.sort;
      expect(sort.type).toBe('string');
      expect(sort.description).toContain('Sort order for search results');
      expect(sort.enum).toContain('@relevance');
      expect(sort.enum).toContain('StudyFirstPostDate');
      expect(sort.enum).toContain('LastUpdatePostDate');

      expect(sort.enum).toContain('StartDate');
      expect(sort.enum).toContain('PrimaryCompletionDate');
      expect(sort.enum).toContain('CompletionDate');
      expect(sort.enum).toContain('EnrollmentCount');
    });

    test('should have study design parameters with proper descriptions and enums', () => {
      const allocation = definition.inputSchema.properties.allocation;
      expect(allocation.type).toBe('string');
      expect(allocation.description).toContain('Study design allocation method');
      expect(allocation.enum).toContain('randomized');
      expect(allocation.enum).toContain('nonrandomized');
      expect(allocation.enum).toContain('na');

      const masking = definition.inputSchema.properties.masking;
      expect(masking.type).toBe('string');
      expect(masking.description).toContain('Study blinding/masking design');
      expect(masking.enum).toContain('none');
      expect(masking.enum).toContain('single');
      expect(masking.enum).toContain('double');
      expect(masking.enum).toContain('triple');
      expect(masking.enum).toContain('quadruple');

      const assignment = definition.inputSchema.properties.assignment;
      expect(assignment.type).toBe('string');
      expect(assignment.description).toContain('Intervention assignment strategy');
      expect(assignment.enum).toContain('single');
      expect(assignment.enum).toContain('parallel');
      expect(assignment.enum).toContain('crossover');
      expect(assignment.enum).toContain('factorial');
      expect(assignment.enum).toContain('sequential');

      const purpose = definition.inputSchema.properties.purpose;
      expect(purpose.type).toBe('string');
      expect(purpose.description).toContain('Primary purpose of the study');
      expect(purpose.enum).toContain('treatment');
      expect(purpose.enum).toContain('prevention');
      expect(purpose.enum).toContain('diagnostic');
      expect(purpose.enum).toContain('supportive');
      expect(purpose.enum).toContain('screening');

      const model = definition.inputSchema.properties.model;
      expect(model.type).toBe('string');
      expect(model.description).toContain('Observational study model');
      expect(model.enum).toContain('cohort');
      expect(model.enum).toContain('casecontrol');
      expect(model.enum).toContain('caseonly');
      expect(model.enum).toContain('casecrossover');
    });

    test('should have intervention and perspective parameters with proper descriptions and enums', () => {
      const interventionType = definition.inputSchema.properties.interventionType;
      expect(interventionType.type).toBe('string');
      expect(interventionType.description).toContain('Type of intervention being studied');
      expect(interventionType.enum).toContain('drug');
      expect(interventionType.enum).toContain('device');
      expect(interventionType.enum).toContain('biological');
      expect(interventionType.enum).toContain('procedure');
      expect(interventionType.enum).toContain('behavioral');

      const timePerspective = definition.inputSchema.properties.timePerspective;
      expect(timePerspective.type).toBe('string');
      expect(timePerspective.description).toContain('Time perspective for observational studies');
      expect(timePerspective.enum).toContain('retrospective');
      expect(timePerspective.enum).toContain('prospective');
      expect(timePerspective.enum).toContain('crosssectional');

      const whoMasked = definition.inputSchema.properties.whoMasked;
      expect(whoMasked.type).toBe('string');
      expect(whoMasked.description).toContain('Who is masked/blinded in the study');
      expect(whoMasked.enum).toContain('participant');
      expect(whoMasked.enum).toContain('careprovider');
      expect(whoMasked.enum).toContain('investigator');
      expect(whoMasked.enum).toContain('outcomesassessor');
    });
  });

  describe('Handler Function', () => {
    const mockResponse = {
      total: 5,
      hits: [
        {
          id: 'NCT12345678',
          study: {
            protocolSection: {
              identificationModule: {
                briefTitle: 'Test Clinical Trial for Diabetes'
              },
              statusModule: {
                overallStatus: 'RECRUITING',
                studyFirstSubmitDate: '2024-01-15'
              }
            }
          }
        }
      ],
      from: 0,
      limit: 10,
      terms: []
    };

    test('should search by condition', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ condition: 'Diabetes' });
        expect(result).toContain('Clinical Trials Search Results');
        expect(result).toContain('Condition: Diabetes');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search by titles', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ titles: 'tr' });
        expect(capturedUrl).toContain('titles=tr');
        expect(result).toContain('Titles: tr');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search by outcomes', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ outc: 'ac' });
        expect(capturedUrl).toContain('outc=ac');
        expect(result).toContain('Outcomes: ac');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search by study ID', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ id: 'ab' });
        expect(capturedUrl).toContain('id=ab');
        expect(result).toContain('ID: ab');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with custom sort order', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ condition: 'Obesity', sort: 'StudyFirstPostDate' });
        expect(capturedUrl).toContain('sort=StudyFirstPostDate');
        expect(result).toContain('Sort: StudyFirstPostDate');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with violation filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ violation: 'y' });
        expect(capturedUrl).toContain('violation%3Ay');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with combined funder types', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ funderType: 'nih OR fed OR industry OR other' });
        expect(capturedUrl).toContain('funderType%3Anih');
        expect(capturedUrl).toContain('fed');
        expect(capturedUrl).toContain('industry');
        expect(capturedUrl).toContain('other');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with combined results filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ results: 'with without' });
        expect(capturedUrl).toContain('results%3Awith');
        expect(capturedUrl).toContain('without');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with comprehensive documentation filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ docs: 'prot sap icf' });
        expect(capturedUrl).toContain('docs%3Aprot');
        expect(capturedUrl).toContain('sap');
        expect(capturedUrl).toContain('icf');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with healthy volunteers filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ healthy: 'y' });
        expect(capturedUrl).toContain('aggFilters=healthy%3Ay');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with study type filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ studyType: 'interventional OR observational' });
        expect(capturedUrl).toContain('studyType%3Aint');
        expect(capturedUrl).toContain('obs');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with funder type filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ funderType: 'nih' });
        expect(capturedUrl).toContain('funderType%3Anih');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with results availability filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ results: 'with' });
        expect(capturedUrl).toContain('results%3Awith');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with document availability filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ docs: 'prot sap' });
        expect(capturedUrl).toContain('docs%3Aprot');
        expect(capturedUrl).toContain('sap');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with expanded access status', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ status: 'ava nla tna afm' });
        expect(capturedUrl).toContain('aggFilters=status%3Aava');
        expect(capturedUrl).toContain('nla');
        expect(capturedUrl).toContain('tna');
        expect(capturedUrl).toContain('afm');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with custom age range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ ageRange: '16y_34y' });
        expect(capturedUrl).toContain('ageRange=16y_34y');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with location using locn parameter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ location: 'Houston' });
        expect(capturedUrl).toContain('locn=Houston');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with start date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ start: '2024-01-01_2025-03-12' });
        expect(capturedUrl).toContain('start=2024-01-01_2025-03-12');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with primary completion date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ primComp: '2025-11-01_2025-12-12' });
        expect(capturedUrl).toContain('primComp=2025-11-01_2025-12-12');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with both date ranges', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ 
          start: '2024-01-01_2025-03-12',
          primComp: '2025-11-01_2025-12-12'
        });
        expect(capturedUrl).toContain('start=2024-01-01_2025-03-12');
        expect(capturedUrl).toContain('primComp=2025-11-01_2025-12-12');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with first post date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ firstPost: '2025-01-01_2025-12-12' });
        expect(capturedUrl).toContain('firstPost=2025-01-01_2025-12-12');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with results first post date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ resFirstPost: '2025-01-02_2025-11-11' });
        expect(capturedUrl).toContain('resFirstPost=2025-01-02_2025-11-11');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with last update post date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ lastUpdPost: '2025-03-03_2025-10-10' });
        expect(capturedUrl).toContain('lastUpdPost=2025-03-03_2025-10-10');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with study completion date range', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ studyComp: '2025-11-01_2025-12-31' });
        expect(capturedUrl).toContain('studyComp=2025-11-01_2025-12-31');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with study completion on or after date', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ studyComp: '2025-11-01_' });
        expect(capturedUrl).toContain('studyComp=2025-11-01_');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with all posting date parameters', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        await handler({ 
          firstPost: '2025-01-01_2025-12-12',
          resFirstPost: '2025-01-02_2025-11-11',
          lastUpdPost: '2025-03-03_2025-10-10',
          studyComp: '2025-11-01_'
        });
        expect(capturedUrl).toContain('firstPost=2025-01-01_2025-12-12');
        expect(capturedUrl).toContain('resFirstPost=2025-01-02_2025-11-11');
        expect(capturedUrl).toContain('lastUpdPost=2025-03-03_2025-10-10');
        expect(capturedUrl).toContain('studyComp=2025-11-01_');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should combine multiple new filters including violation and new search parameters', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

              try {
          await handler({ 
            titles: 'tr',
            outc: 'ac',
            id: 'ab',
            healthy: 'y',
            studyType: 'int',
            funderType: 'nih OR fed OR industry OR other',
            results: 'with without',
            docs: 'prot sap icf',
            violation: 'y',
            start: '2024-01-01_2025-03-12',
            primComp: '2025-11-01_2025-12-12',
            firstPost: '2025-01-01_2025-12-12',
            resFirstPost: '2025-01-02_2025-11-11',
            lastUpdPost: '2025-03-03_2025-10-10',
            studyComp: '2025-11-01_',
            sort: 'StudyFirstPostDate'
          });
          
          expect(capturedUrl).toContain('titles=tr');
          expect(capturedUrl).toContain('outc=ac');
          expect(capturedUrl).toContain('id=ab');
          expect(capturedUrl).toContain('healthy%3Ay');
          expect(capturedUrl).toContain('studyType%3Aint');
          expect(capturedUrl).toContain('funderType%3Anih');
          expect(capturedUrl).toContain('results%3Awith');
          expect(capturedUrl).toContain('docs%3Aprot');
          expect(capturedUrl).toContain('violation%3Ay');
          expect(capturedUrl).toContain('start=2024-01-01_2025-03-12');
          expect(capturedUrl).toContain('primComp=2025-11-01_2025-12-12');
          expect(capturedUrl).toContain('firstPost=2025-01-01_2025-12-12');
          expect(capturedUrl).toContain('resFirstPost=2025-01-02_2025-11-11');
          expect(capturedUrl).toContain('lastUpdPost=2025-03-03_2025-10-10');
          expect(capturedUrl).toContain('studyComp=2025-11-01_');
          expect(capturedUrl).toContain('sort=StudyFirstPostDate');
        } finally {
          global.fetch = originalFetch;
        }
    });

    test('should format results with new parameters in criteria including violation and search parameters', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

              try {
          const result = await handler({ 
            titles: 'tr',
            outc: 'ac',
            id: 'ab',
            healthy: 'y',
            studyType: 'int',
            funderType: 'nih OR fed OR industry OR other',
            results: 'with without',
            docs: 'prot sap icf',
            violation: 'y',
            start: '2024-01-01_2025-03-12',
            primComp: '2025-11-01_2025-12-12',
            firstPost: '2025-01-01_2025-12-12',
            resFirstPost: '2025-01-02_2025-11-11',
            lastUpdPost: '2025-03-03_2025-10-10',
            studyComp: '2025-11-01_',
            sort: 'StudyFirstPostDate'
          });
          
          expect(result).toContain('Titles: tr');
          expect(result).toContain('Outcomes: ac');
          expect(result).toContain('ID: ab');
          expect(result).toContain('Healthy Volunteers: Yes');
          expect(result).toContain('Study Type: Interventional');
          expect(result).toContain('Funding: NIH, Federal, Industry, Other');
          expect(result).toContain('Results Available: with without');
          expect(result).toContain('Documents: Protocol, Statistical Analysis Plan, Informed Consent Form');
          expect(result).toContain('FDA Violations: Tracked');
          expect(result).toContain('Start Date: 2024-01-01_2025-03-12');
          expect(result).toContain('Primary Completion: 2025-11-01_2025-12-12');
          expect(result).toContain('First Posted: 2025-01-01_2025-12-12');
          expect(result).toContain('Results Posted: 2025-01-02_2025-11-11');
          expect(result).toContain('Last Updated: 2025-03-03_2025-10-10');
          expect(result).toContain('Study Completion: 2025-11-01_');
          expect(result).toContain('Sort: StudyFirstPostDate');
        } finally {
          global.fetch = originalFetch;
        }
    });

    test('should include document information in results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ docs: 'prot sap icf' });
        
        expect(result).toContain('Document Information:**');
        expect(result).toContain('Protocol documents provide detailed study procedures');
        expect(result).toContain('Statistical Analysis Plans outline how study data');
        expect(result).toContain('Informed Consent Forms show what participants');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should include FDA violation warning in results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ violation: 'y' });
        
        expect(result).toContain('FDA Compliance:**');
        expect(result).toContain('reported FDA violations or compliance issues');
        expect(result).toContain('Review study details carefully');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should include healthy volunteers information in results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ healthy: 'y' });
        
        expect(result).toContain('Healthy Volunteers:**');
        expect(result).toContain('do not have the condition being studied');
        expect(result).toContain('help researchers learn more');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should include study type information in results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ studyType: 'int' });
        
        expect(result).toContain('Study Type Information:**');
        expect(result).toContain('Interventional studies test new treatments');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with allocation filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ allocation: 'randomized' });
        expect(capturedUrl).toContain('allocation%3Arandomized');
        expect(result).toContain('Allocation: Randomized');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with masking filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ masking: 'double' });
        expect(capturedUrl).toContain('masking%3Adouble');
        expect(result).toContain('Masking: Double Blind');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with assignment filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ assignment: 'parallel' });
        expect(capturedUrl).toContain('assignment%3Aparallel');
        expect(result).toContain('Assignment: Parallel Assignment');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with purpose filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ purpose: 'treatment' });
        expect(capturedUrl).toContain('purpose%3Atreatment');
        expect(result).toContain('Purpose: Treatment');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with observational model filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ model: 'cohort' });
        expect(capturedUrl).toContain('model%3Acohort');
        expect(result).toContain('Model: Cohort');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with combined design parameters', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ 
          allocation: 'randomized nonrandomized',
          masking: 'double triple',
          assignment: 'parallel crossover',
          purpose: 'treatment prevention',
          model: 'cohort casecontrol'
        });
        
        expect(capturedUrl).toContain('allocation%3Arandomized');
        expect(capturedUrl).toContain('nonrandomized');
        expect(capturedUrl).toContain('masking%3Adouble');
        expect(capturedUrl).toContain('triple');
        expect(capturedUrl).toContain('assignment%3Aparallel');
        expect(capturedUrl).toContain('crossover');
        expect(capturedUrl).toContain('purpose%3Atreatment');
        expect(capturedUrl).toContain('prevention');
        expect(capturedUrl).toContain('model%3Acohort');
        expect(capturedUrl).toContain('casecontrol');
        
        expect(result).toContain('Allocation: Randomized, Non-Randomized');
        expect(result).toContain('Masking: Double Blind, Triple Blind');
        expect(result).toContain('Assignment: Parallel Assignment, Crossover Assignment');
        expect(result).toContain('Purpose: Treatment, Prevention');
        expect(result).toContain('Model: Cohort, Case-Control');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with intervention type filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ interventionType: 'drug' });
        expect(capturedUrl).toContain('interventionType%3Adrug');
        expect(result).toContain('Intervention Type: Drug');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with time perspective filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ timePerspective: 'prospective' });
        expect(capturedUrl).toContain('timePerspective%3Aprospective');
        expect(result).toContain('Time Perspective: Prospective');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with who masked filter', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ whoMasked: 'participant careprovider' });
        expect(capturedUrl).toContain('whoMasked%3Aparticipant');
        expect(capturedUrl).toContain('careprovider');
        expect(result).toContain('Who Masked: Participant, Care Provider');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should search with combined intervention and perspective parameters', async () => {
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = ((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });
      }) as typeof fetch;

      try {
        const result = await handler({ 
          interventionType: 'drug device biological',
          timePerspective: 'retrospective prospective',
          whoMasked: 'participant careprovider investigator outcomesassessor'
        });
        
        expect(capturedUrl).toContain('interventionType%3Adrug');
        expect(capturedUrl).toContain('device');
        expect(capturedUrl).toContain('biological');
        expect(capturedUrl).toContain('timePerspective%3Aretrospective');
        expect(capturedUrl).toContain('prospective');
        expect(capturedUrl).toContain('whoMasked%3Aparticipant');
        expect(capturedUrl).toContain('careprovider');
        expect(capturedUrl).toContain('investigator');
        expect(capturedUrl).toContain('outcomesassessor');
        
        expect(result).toContain('Intervention Type: Drug, Device, Biological/Vaccine');
        expect(result).toContain('Time Perspective: Retrospective, Prospective');
        expect(result).toContain('Who Masked: Participant, Care Provider, Investigator, Outcomes Assessor');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should validate age range format', async () => {
      await expect(handler({ ageRange: 'invalid-format' })).rejects.toThrow(
        'Age range must be in format "minAge_maxAge"'
      );
    });

    test('should accept valid age range formats', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        // Test different valid formats
        await handler({ ageRange: '16y_34y' });
        await handler({ ageRange: '2m_12m' });
        await handler({ ageRange: '65y_85y' });
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should validate date range formats', async () => {
      // Invalid start date format
      await expect(handler({ start: 'invalid-date' })).rejects.toThrow(
        'Start date range must be in format "YYYY-MM-DD_YYYY-MM-DD"'
      );

      // Invalid primary completion date format
      await expect(handler({ primComp: '2025/01/01_2025/12/31' })).rejects.toThrow(
        'Primary completion date range must be in format "YYYY-MM-DD_YYYY-MM-DD"'
      );

      // Invalid first post date format
      await expect(handler({ firstPost: 'invalid-format' })).rejects.toThrow(
        'First post date range must be in format "YYYY-MM-DD_YYYY-MM-DD"'
      );

      // Invalid results first post date format
      await expect(handler({ resFirstPost: '2025-1-1_2025-12-31' })).rejects.toThrow(
        'Results first post date range must be in format "YYYY-MM-DD_YYYY-MM-DD"'
      );

      // Invalid last update post date format
      await expect(handler({ lastUpdPost: '2025-01-01' })).rejects.toThrow(
        'Last update post date range must be in format "YYYY-MM-DD_YYYY-MM-DD"'
      );

      // Invalid study completion date format
      await expect(handler({ studyComp: 'invalid' })).rejects.toThrow(
        'Study completion date must be in format "YYYY-MM-DD_YYYY-MM-DD" or "YYYY-MM-DD_"'
      );
    });

    test('should accept valid date range formats', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

              try {
          // Test different valid date formats
          await handler({ start: '2024-01-01_2025-12-31' });
          await handler({ primComp: '2025-06-15_2025-12-15' });
          await handler({ firstPost: '2025-01-01_2025-12-12' });
          await handler({ resFirstPost: '2025-01-02_2025-11-11' });
          await handler({ lastUpdPost: '2025-03-03_2025-10-10' });
          await handler({ studyComp: '2025-11-01_2025-12-31' });
          await handler({ studyComp: '2025-11-01_' });
          await handler({ 
            start: '2023-01-01_2024-01-01',
            primComp: '2024-06-01_2024-12-01',
            firstPost: '2024-01-01_2024-12-31',
            studyComp: '2024-12-01_'
          });
        } finally {
          global.fetch = originalFetch;
        }
    });

    test('should handle expanded access in response formatting', async () => {
      const expandedAccessResponse = {
        ...mockResponse,
        hits: [{
          id: 'NCT12345678',
          study: {
            protocolSection: {
              identificationModule: {
                briefTitle: 'Expanded Access Program for Cancer Drug'
              },
              statusModule: {
                overallStatus: 'AVAILABLE',
                studyFirstSubmitDate: '2024-01-15'
              }
            }
          }
        }]
      };

      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(expandedAccessResponse)
      } as Response);

      try {
        const result = await handler({ status: 'ava' });
        
        expect(result).toContain('Clinical Trials Search Results');
        expect(result).toContain('Expanded Access Program for Cancer Drug');
        expect(result).toContain('Expanded Access Information');
        expect(result).toContain('compassionate use');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should require at least one search parameter including new ones', async () => {
      await expect(handler({})).rejects.toThrow(
        'At least one search parameter must be provided'
      );
    });

    test('should accept new parameters as standalone search criteria', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        await handler({ titles: 'tr' });
        await handler({ outc: 'ac' });
        await handler({ id: 'ab' });
        await handler({ healthy: 'y' });
        await handler({ studyType: 'int' });
        await handler({ funderType: 'nih' });
        await handler({ results: 'with' });
        await handler({ docs: 'prot' });
        await handler({ violation: 'y' });
        await handler({ start: '2024-01-01_2025-12-31' });
        await handler({ primComp: '2025-06-01_2025-12-31' });
        await handler({ firstPost: '2025-01-01_2025-12-12' });
        await handler({ resFirstPost: '2025-01-02_2025-11-11' });
        await handler({ lastUpdPost: '2025-03-03_2025-10-10' });
        await handler({ studyComp: '2025-11-01_' });
        await handler({ sort: 'StudyFirstPostDate' });
        await handler({ allocation: 'randomized' });
        await handler({ masking: 'double' });
        await handler({ assignment: 'parallel' });
        await handler({ purpose: 'treatment' });
        await handler({ model: 'cohort' });
        await handler({ interventionType: 'drug' });
        await handler({ timePerspective: 'prospective' });
        await handler({ whoMasked: 'participant' });
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should include temporal filtering information in results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          start: '2024-01-01_2025-03-12',
          primComp: '2025-11-01_2025-12-12'
        });
        
        expect(result).toContain('Temporal Filtering:**');
        expect(result).toContain('Studies starting between 2024-01-01 and 2025-03-12');
        expect(result).toContain('Primary completion between 2025-11-01 and 2025-12-12');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should include comprehensive temporal filtering information', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          firstPost: '2025-01-01_2025-12-12',
          resFirstPost: '2025-01-02_2025-11-11',
          lastUpdPost: '2025-03-03_2025-10-10',
          studyComp: '2025-11-01_'
        });
        
        expect(result).toContain('Temporal Filtering:**');
        expect(result).toContain('First posted between 2025-01-01 and 2025-12-12');
        expect(result).toContain('Results first posted between 2025-01-02 and 2025-11-11');
        expect(result).toContain('Last updated between 2025-03-03 and 2025-10-10');
        expect(result).toContain('Study completion on or after 2025-11-01');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle API errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      try {
        await expect(handler({ condition: 'Diabetes' })).rejects.toThrow(
          'ClinicalTrials.gov API error: 500 Internal Server Error'
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle network errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));

      try {
        await expect(handler({ condition: 'Diabetes' })).rejects.toThrow(
          'Failed to search clinical trials: Network error'
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should validate limit parameter', async () => {
      await expect(handler({ condition: 'Diabetes', limit: 0 })).rejects.toThrow(
        'Limit must be a number between 1 and 100'
      );

      await expect(handler({ condition: 'Diabetes', limit: 101 })).rejects.toThrow(
        'Limit must be a number between 1 and 100'
      );
    });

    test('should include NCT ID links in formatted results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ condition: 'Diabetes' });
        expect(result).toContain('[NCT12345678](https://clinicaltrials.gov/study/NCT12345678)');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle empty search results', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 0,
          limit: 10,
          total: 0,
          terms: [],
          hits: []
        })
      } as Response);

      try {
        const result = await handler({ condition: 'Nonexistent Disease' });
        
        expect(result).toContain('## No Studies Found');
        expect(result).toContain('No clinical trials match your search criteria');
        expect(result).toContain('Using broader search terms');
        expect(result).toContain('Removing some filters');
        expect(result).toContain('Checking spelling of medical conditions');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle docs filter with multiple types', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          condition: 'Diabetes',
          docs: 'prot sap icf'
        });
        
        expect(result).toContain('Documents: Protocol, Statistical Analysis Plan, Informed Consent Form');
        expect(result).toContain('Protocol documents provide detailed study procedures');
        expect(result).toContain('Statistical Analysis Plans outline how study data will be analyzed');
        expect(result).toContain('Informed Consent Forms show what participants are told');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle specific study type descriptions', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          condition: 'Diabetes',
          studyType: 'obs_patreg'
        });
        
        expect(result).toContain('Study Type: Observational (Patient Registry)');
        expect(result).toContain('Patient registry studies collect data about participants over time');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle study completion date with open end', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          condition: 'Diabetes',
          studyComp: '2024-01-01_'
        });
        
        expect(result).toContain('Study completion on or after 2024-01-01');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should filter docs descriptions properly', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          condition: 'Diabetes',
          docs: 'unknown_doc prot'
        });
        
        // Should include all doc types in criteria but filter unknown ones from description
        expect(result).toContain('Protocol documents provide detailed study procedures');
        expect(result).toContain('Documents: unknown_doc, Protocol'); // This appears in criteria
        // But the document information section should only contain known descriptions
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('should handle unknown enum values in formatting', async () => {
      const originalFetch = global.fetch;
      global.fetch = () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      try {
        const result = await handler({ 
          condition: 'Diabetes',
          phase: 'unknown_phase 2',
          status: 'unknown_status rec',
          studyType: 'unknown_type int',
          funderType: 'unknown_funder fed',
          allocation: 'unknown_alloc randomized',
          masking: 'unknown_mask double',
          assignment: 'unknown_assign parallel',
          purpose: 'unknown_purpose treatment',
          model: 'unknown_model cohort',
          interventionType: 'unknown_intervention drug',
          timePerspective: 'unknown_perspective prospective',
          whoMasked: 'unknown_who participant'
        });
        
        // Should include unknown values as-is in the criteria
        expect(result).toContain('Phase: unknown_phase, Phase 2 (Efficacy)');
        expect(result).toContain('Status: unknown_status, Recruiting');
        expect(result).toContain('Study Type: unknown_type, Interventional');
        expect(result).toContain('Funding: unknown_funder, Federal');
        expect(result).toContain('Allocation: unknown_alloc, Randomized');
        expect(result).toContain('Masking: unknown_mask, Double');
        expect(result).toContain('Assignment: unknown_assign, Parallel');
        expect(result).toContain('Purpose: unknown_purpose, Treatment');
        expect(result).toContain('Model: unknown_model, Cohort');
        expect(result).toContain('Intervention Type: unknown_intervention, Drug');
        expect(result).toContain('Time Perspective: unknown_perspective, Prospective');
        expect(result).toContain('Who Masked: unknown_who, Participant');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
}); 