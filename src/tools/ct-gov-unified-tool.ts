import { ToolDefinition, ToolHandler } from '../types.js';

// Import interfaces from the original tools
interface ClinicalTrialHit {
    protocolSection: {
      identificationModule: {
      nctId: string;
      orgStudyIdInfo?: { id: string };
      secondaryIdInfos?: Array<{ id: string; type: string; domain?: string }>;
      organization: { fullName: string; class: string };
        briefTitle: string;
      officialTitle?: string;
      acronym?: string;
      };
      statusModule: {
        overallStatus: string;
      whyStopped?: string;
      studyFirstSubmitDate?: string;
      statusVerifiedDate?: string;
      startDateStruct?: { date: string; type?: string };
      primaryCompletionDateStruct?: { date: string; type?: string };
      completionDateStruct?: { date: string; type?: string };
      expandedAccessInfo?: { hasExpandedAccess: boolean };
    };
    designModule?: {
      studyType?: string;
      phases?: string[];
      enrollmentInfo?: {
        count?: number;
        type?: string;
      };
    };
    conditionsModule?: {
      conditions?: string[];
      keywords?: string[];
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: {
        name: string;
        class: string;
      };
      collaborators?: Array<{
        name: string;
        class: string;
      }>;
    };
  };
  derivedSection?: any;
  hasResults: boolean;
}

interface ClinicalTrialSearchResponse {
  studies: ClinicalTrialHit[];
  totalCount?: number;
  nextPageToken?: string;
}

interface StudyResponse {
  protocolSection: {
    identificationModule: {
      nctId: string;
      orgStudyIdInfo?: { id: string };
      briefTitle: string;
      officialTitle?: string;
      acronym?: string;
      organization: { fullName: string; class: string };
    };
    statusModule: {
      overallStatus: string;
      whyStopped?: string;
      statusVerifiedDate?: string;
      startDateStruct?: { date: string; type?: string };
      primaryCompletionDateStruct?: { date: string; type?: string };
      completionDateStruct?: { date: string; type?: string };
      expandedAccessInfo?: { hasExpandedAccess: boolean };
    };
    sponsorCollaboratorsModule?: {
      leadSponsor: { name: string; class: string };
      collaborators?: Array<{ name: string; class: string }>;
      responsibleParty?: {
        type?: string;
        investigatorFullName?: string;
        investigatorTitle?: string;
        investigatorAffiliation?: string;
      };
    };
    descriptionModule?: {
      briefSummary?: string;
      detailedDescription?: string;
    };
    conditionsModule?: {
      conditions?: string[];
      keywords?: string[];
    };
    designModule?: {
      studyType: string;
      phases?: string[];
      designInfo?: {
        allocation?: string;
        interventionModel?: string;
        primaryPurpose?: string;
        maskingInfo?: {
          masking?: string;
          whoMasked?: string[];
        };
      };
      enrollmentInfo?: {
        count: number;
        type: string;
      };
    };
    armsInterventionsModule?: {
      armGroups?: Array<{
        label: string;
        type: string;
        description?: string;
        interventionNames?: string[];
      }>;
      interventions?: Array<{
        type: string;
        name: string;
        description?: string;
        armGroupLabels?: string[];
      }>;
    };
    outcomesModule?: {
      primaryOutcomes?: Array<{
        measure: string;
        description?: string;
        timeFrame?: string;
      }>;
      secondaryOutcomes?: Array<{
        measure: string;
        description?: string;
        timeFrame?: string;
      }>;
    };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      healthyVolunteers?: boolean;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
      stdAges?: string[];
    };
    contactsLocationsModule?: {
      overallOfficials?: Array<{
        name: string;
        affiliation?: string;
        role: string;
      }>;
      locations?: Array<{
        facility: string;
        city?: string;
        state?: string;
        country?: string;
        status?: string;
        geoPoint?: { lat: number; lon: number };
      }>;
    };
    referencesModule?: {
      references?: Array<{
        pmid?: string;
        type: string;
        citation: string;
      }>;
    };
    oversightModule?: {
      oversightHasDmc?: boolean;
      isFdaRegulatedDrug?: boolean;
      isFdaRegulatedDevice?: boolean;
      isUnapprovedDevice?: boolean;
    };
  };
  derivedSection?: {
    conditionBrowseModule?: {
      meshes?: Array<{ id: string; term: string }>;
      browseLeaves?: Array<{ name: string; asFound?: string; relevance: string }>;
    };
    interventionBrowseModule?: {
      meshes?: Array<{ id: string; term: string }>;
      browseLeaves?: Array<{ name: string; asFound?: string; relevance: string }>;
    };
  };
  hasResults: boolean;
}

interface CtGovUnifiedParams {
  method: 'search' | 'suggest' | 'get';
  
  // Search studies parameters
  condition?: string;
  term?: string;
  intervention?: string;
  titles?: string;
  outc?: string;
  id?: string;
  complexQuery?: string;
  phase?: string;
  status?: string;
  ages?: string;
  ageRange?: string;
  sex?: string;
  location?: string;
  lead?: string;
  healthy?: string;
  studyType?: string;
  funderType?: string;
  results?: string;
  docs?: string;
  violation?: string;
  allocation?: string;
  masking?: string;
  assignment?: string;
  purpose?: string;
  model?: string;
  interventionType?: string;
  timePerspective?: string;
  whoMasked?: string;
  start?: string;
  primComp?: string;
  firstPost?: string;
  resFirstPost?: string;
  lastUpdPost?: string;
  studyComp?: string;
  sort?: string;
  limit?: number;
  
  // Pagination parameters
  pageToken?: string;
  pageSize?: number;
  countTotal?: boolean;
  
  // Suggest parameters
  input?: string;
  dictionary?: 'Condition' | 'InterventionName' | 'LeadSponsorName' | 'LocationFacility';
  
  // Get study parameters
  nctId?: string;
  format?: 'json' | 'csv' | 'json.zip' | 'fhir.json' | 'ris';
  markupFormat?: 'markdown' | 'legacy';
  fields?: string[];
}

export const definition: ToolDefinition = {
  name: 'ct_gov_studies',
  description: 'Unified tool for ClinicalTrials.gov operations: search clinical trials, get term suggestions, and retrieve detailed study information. Supports both simple parameter searches and advanced complex queries using CT.gov search operators. Use the method parameter to specify the operation type.',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['search', 'suggest', 'get'],
        description: 'The operation to perform: search (find clinical trials), suggest (get term suggestions), or get (get detailed study information)'
      },
      
      // Search parameters
      condition: {
        type: 'string',
        description: 'For search: Primary condition to search for (e.g., "Diabetes Mellitus Type 2", "Heart Failure", "Cancer"). Use OR operator to combine multiple conditions (e.g., "obesity OR weight loss").'
      },
      term: {
        type: 'string',
        description: 'For search: Additional search terms (e.g., "Hypertension", "Diabetes", "Expanded Access"). Use OR operator to combine multiple terms (e.g., "diabetes OR hypertension").'
      },
      intervention: {
        type: 'string',
        description: 'For search: Intervention or treatment being studied (e.g., "Aspirin", "Ibuprofen", "Immunotherapy"). Use OR operator to combine multiple interventions (e.g., "semaglutide OR liraglutide").'
      },
      titles: {
        type: 'string',
        description: 'For search: Search in study titles and acronyms. Use OR operator to combine multiple terms.'
      },
      outc: {
        type: 'string',
        description: 'For search: Search in study outcomes and endpoints. Use OR operator to combine multiple terms.'
      },
      id: {
        type: 'string',
        description: 'For search: Search by study identifiers: NCT ID, organization study ID, secondary ID, or study acronym. Use OR operator to combine multiple IDs.'
      },
      complexQuery: {
        type: 'string',
        description: 'For search: Advanced search expression using CT.gov operators (AND, OR, NOT, AREA[], RANGE[], etc.). When provided, this takes precedence over individual search parameters. Boolean Operators: AND, OR, NOT, parentheses () for grouping. Context Operators: AREA[field] (search specific fields), SEARCH[context] (nested search contexts). Range Operators: RANGE[start, end] (date/number ranges, use MAX/MIN for open ranges). Source Operators: EXPANSION[source] (concept expansion), TILT[field] (tilted search), etc. Special Operators: MISSING (null values), quotes for exact phrases. Available AREA fields: Phase, StdAge, DesignAllocation, DesignMasking, DesignInterventionModel, DesignPrimaryPurpose, StudyType, InterventionType, LeadSponsorClass, InterventionName, DesignObservationalModel, DesignTimePerspective, DesignWhoMasked, StudyFirstPostDate, etc.'
      },
      phase: {
        type: 'string',
        description: 'For search: Clinical trial phases based on official CT.gov API v2 format',
        enum: ['PHASE0', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4', 'EARLY_PHASE1', 'NA']
      },
      status: {
        type: 'string',
        description: 'For search: Study recruitment and completion status. Use full status names like "recruiting", "completed", "not_yet_recruiting", etc. Use OR operator to combine multiple values (e.g., "recruiting OR active_not_recruiting"). Also supports expanded access program statuses like "available".',
        enum: [
          'not_yet_recruiting', 'recruiting', 'active_not_recruiting', 'completed', 'terminated', 'enrolling_by_invitation', 'suspended', 'withdrawn', 'unknown',
          'recruiting OR active_not_recruiting', 'not_yet_recruiting OR recruiting OR active_not_recruiting',
          'available', 'no_longer_available', 'temporarily_not_available', 'approved_for_marketing',
          'available OR no_longer_available', 'available OR temporarily_not_available', 'no_longer_available OR temporarily_not_available', 'available OR no_longer_available OR temporarily_not_available', 'available OR no_longer_available OR temporarily_not_available OR approved_for_marketing'
        ]
      },
      ages: {
        type: 'string',
        description: 'For search: Predefined age groups for study eligibility. Use "child", "adult", or "older_adult". Use OR operator to combine multiple values (e.g., "child OR adult").',
        enum: ['child', 'adult', 'older_adult', 'child OR adult', 'adult OR older_adult', 'child OR adult OR older_adult']
      },
      ageRange: {
        type: 'string',
        description: 'For search: Custom age range in format "minAge_maxAge" (e.g., "16y_34y", "65y_85y", "18y_65y")'
      },
      sex: {
        type: 'string',
        description: 'For search: Sex/gender eligibility filter',
        enum: ['all', 'm', 'f']
      },
      location: {
        type: 'string',
        description: 'For search: Geographic location filter (e.g., "Houston", "Texas", "United States", "US"). Use OR operator to combine multiple locations (e.g., "Texas OR California").'
      },
      lead: {
        type: 'string',
        description: 'For search: Lead sponsor or principal organization conducting the study. Use OR operator to combine multiple sponsors (e.g., "Pfizer OR Merck").'
      },
      healthy: {
        type: 'string',
        description: 'For search: Include studies that accept healthy volunteers',
        enum: ['y']
      },
      studyType: {
        type: 'string',
        description: 'For search: Type of clinical study. Use full names: "interventional" for randomized trials, "observational" for studies without intervention, or "expanded_access" for compassionate use programs. Use OR operator to combine multiple values (e.g., "interventional OR observational").',
        enum: ['interventional', 'observational', 'expanded_access', 'observational_patient_registry', 'expanded_access_individual', 'expanded_access_intermediate', 'expanded_access_treatment', 'interventional OR observational', 'interventional OR expanded_access', 'observational OR expanded_access', 'interventional OR observational OR expanded_access']
      },
      funderType: {
        type: 'string',
        description: 'For search: Funding organization type. Use OR operator to combine multiple values (e.g., "nih OR fed").',
        enum: ['nih', 'fed', 'industry', 'other', 'indiv', 'network', 'nih OR fed', 'nih OR industry', 'fed OR industry', 'industry OR other', 'nih OR fed OR industry', 'nih OR fed OR other', 'fed OR industry OR other', 'nih OR fed OR industry OR other']
      },
      results: {
        type: 'string',
        description: 'For search: Filter by availability of study results',
        enum: ['with', 'without', 'with without']
      },
      docs: {
        type: 'string',
        description: 'For search: Filter by availability of study documents',
        enum: ['prot', 'sap', 'icf', 'csr', 'prot sap', 'prot icf', 'sap icf', 'prot csr', 'prot sap icf', 'prot sap csr', 'sap icf csr', 'prot sap icf csr']
      },
      violation: {
        type: 'string',
        description: 'For search: Filter studies with FDA violations',
        enum: ['y']
      },
      allocation: {
        type: 'string',
        description: 'For search: Study design allocation method. Use OR operator to combine multiple values (e.g., "randomized OR nonrandomized").',
        enum: ['randomized', 'nonrandomized', 'na', 'randomized OR nonrandomized', 'randomized OR na', 'nonrandomized OR na', 'randomized OR nonrandomized OR na']
      },
      masking: {
        type: 'string',
        description: 'For search: Study blinding/masking design. Use OR operator to combine multiple values (e.g., "single OR double").',
        enum: ['none', 'single', 'double', 'triple', 'quadruple', 'single OR double', 'double OR triple', 'triple OR quadruple', 'single OR double OR triple', 'double OR triple OR quadruple', 'single OR double OR triple OR quadruple']
      },
      assignment: {
        type: 'string',
        description: 'For search: Intervention assignment strategy. Use OR operator to combine multiple values (e.g., "parallel OR crossover").',
        enum: ['single', 'parallel', 'crossover', 'factorial', 'sequential', 'single OR parallel', 'parallel OR crossover', 'crossover OR factorial', 'single OR parallel OR crossover', 'parallel OR crossover OR factorial', 'single OR parallel OR crossover OR factorial OR sequential']
      },
      purpose: {
        type: 'string',
        description: 'For search: Primary purpose of the study. Use OR operator to combine multiple values (e.g., "treatment OR prevention").',
        enum: ['treatment', 'prevention', 'diagnostic', 'supportive', 'screening', 'healthservices', 'basicscience', 'devicefeasibility', 'other', 'treatment OR prevention', 'treatment OR diagnostic', 'prevention OR diagnostic', 'treatment OR supportive', 'diagnostic OR screening', 'treatment OR prevention OR diagnostic', 'treatment OR prevention OR supportive', 'treatment OR diagnostic OR supportive', 'prevention OR diagnostic OR supportive', 'treatment OR prevention OR diagnostic OR supportive']
      },
      model: {
        type: 'string',
        description: 'For search: Observational study model. Use OR operator to combine multiple values (e.g., "cohort OR casecontrol").',
        enum: ['cohort', 'casecontrol', 'caseonly', 'casecrossover', 'ecologic', 'familybased', 'other', 'defined', 'cohort OR casecontrol', 'cohort OR caseonly', 'casecontrol OR casecrossover', 'cohort OR casecontrol OR caseonly', 'cohort OR casecontrol OR casecrossover', 'cohort OR casecontrol OR caseonly OR casecrossover']
      },
      interventionType: {
        type: 'string',
        description: 'For search: Type of intervention being studied. Use OR operator to combine multiple values (e.g., "drug OR device").',
        enum: ['drug', 'device', 'biological', 'procedure', 'behavioral', 'genetic', 'dietary', 'radiation', 'combination', 'diagnostic', 'other', 'drug OR device', 'drug OR biological', 'procedure OR behavioral', 'device OR procedure', 'biological OR procedure', 'drug OR procedure', 'behavioral OR dietary', 'drug OR device OR biological', 'procedure OR behavioral OR dietary', 'drug OR device OR procedure', 'biological OR procedure OR behavioral']
      },
      timePerspective: {
        type: 'string',
        description: 'For search: Time perspective for observational studies. Use OR operator to combine multiple values (e.g., "retrospective OR prospective").',
        enum: ['retrospective', 'prospective', 'crosssectional', 'other', 'retrospective OR prospective', 'prospective OR crosssectional', 'retrospective OR crosssectional', 'retrospective OR prospective OR crosssectional']
      },
      whoMasked: {
        type: 'string',
        description: 'For search: Who is masked/blinded in the study. Use OR operator to combine multiple values (e.g., "participant OR careprovider").',
        enum: ['participant', 'careprovider', 'investigator', 'outcomesassessor', 'participant OR careprovider', 'participant OR investigator', 'careprovider OR investigator', 'participant OR outcomesassessor', 'investigator OR outcomesassessor', 'participant OR careprovider OR investigator', 'participant OR careprovider OR outcomesassessor', 'participant OR investigator OR outcomesassessor', 'careprovider OR investigator OR outcomesassessor', 'participant OR careprovider OR investigator OR outcomesassessor']
      },
      start: {
        type: 'string',
        description: 'For search: Study start date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      primComp: {
        type: 'string',
        description: 'For search: Primary completion date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      firstPost: {
        type: 'string',
        description: 'For search: Study first posted date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      resFirstPost: {
        type: 'string',
        description: 'For search: Results first posted date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      lastUpdPost: {
        type: 'string',
        description: 'For search: Last update posted date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      studyComp: {
        type: 'string',
        description: 'For search: Study completion date range in format "YYYY-MM-DD_YYYY-MM-DD"'
      },
      sort: {
        type: 'string',
        description: 'For search: Sort order for search results',
        enum: ['@relevance', 'StudyFirstPostDate', 'LastUpdatePostDate', 'NCTId', 'StartDate', 'PrimaryCompletionDate', 'CompletionDate', 'EnrollmentCount']
      },
      limit: {
        type: 'number',
        description: 'For search: Maximum number of results to return (default: 10, max: 100) - DEPRECATED: Use pageSize instead',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      
      // Pagination parameters
      pageToken: {
        type: 'string',
        description: 'For search: Token to get a specific page of results (from previous nextPageToken)'
      },
      pageSize: {
        type: 'number',
        description: 'For search: Number of results per page (default: 10, max: 1000 per CT.gov API)',
        minimum: 1,
        maximum: 1000,  // CT.gov API supports up to 1000 per page
        default: 10
      },
      countTotal: {
        type: 'boolean',
        description: 'For search: Whether to include total count in response (default: true)',
        default: true
      },
      
      // Suggest parameters
      input: {
        type: 'string',
        description: 'For suggest: The text input to search for suggestions (minimum 2 characters)',
        minLength: 2
      },
      dictionary: {
        type: 'string',
        enum: ['Condition', 'InterventionName', 'LeadSponsorName', 'LocationFacility'],
        description: 'For suggest: The dictionary to search in (Condition, InterventionName, LeadSponsorName, LocationFacility)'
      },
      
      // Get study parameters
      nctId: {
        type: 'string',
        description: 'For get: NCT Number of the study (e.g., NCT00841061, NCT04000165)',
        pattern: '^[Nn][Cc][Tt]0*[1-9]\\d{0,7}$'
      },
      format: {
        type: 'string',
        description: 'For get: Response format',
        enum: ['json', 'csv', 'json.zip', 'fhir.json', 'ris'],
        default: 'json'
      },
      markupFormat: {
        type: 'string',
        description: 'For get: Format of markup fields (applies to json format only)',
        enum: ['markdown', 'legacy'],
        default: 'markdown'
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'For get: Specific fields to return (if unspecified, all fields returned)',
        minItems: 1
      }
    },
    required: ['method']
  },
  examples: [
    {
      description: "Search for diabetes studies",
      usage: { 
        "method": "search",
        "condition": "diabetes",
        "pageSize": 5
      }
    },
    {
      description: "Get term suggestions for conditions",
      usage: { 
        "method": "suggest",
        "input": "diab",
        "dictionary": "Condition"
      }
    },
    {
      description: "Get detailed study information",
      usage: { 
        "method": "get",
        "nctId": "NCT00841061"
      }
    },
    {
      description: "Find Phase 2 diabetes or metabolic syndrome trials using complex query",
      usage: {
        "method": "search",
        "complexQuery": "(diabetes OR \"metabolic syndrome\") AND AREA[Phase]PHASE2",
        "pageSize": 10
      }
    },
    {
      description: "Search for aspirin studies excluding placebo-only trials",
      usage: {
        "method": "search",
        "complexQuery": "AREA[InterventionName]aspirin AND NOT placebo",
        "pageSize": 15
      }
    },
    {
      description: "Find cancer studies in Boston area with location-specific search",
      usage: {
        "method": "search",
        "complexQuery": "cancer AND SEARCH[Location](AREA[LocationCity]Boston AND AREA[LocationState]Massachusetts)",
        "pageSize": 20
      }
    },
    {
      description: "Look for recent diabetes studies posted since 2020",
      usage: {
        "method": "search",
        "complexQuery": "diabetes AND AREA[StudyFirstPostDate]RANGE[2020-01-01, MAX]",
        "pageSize": 25
      }
    },
    {
      description: "Find randomized interventional heart attack studies",
      usage: {
        "method": "search",
        "complexQuery": "heart attack AND AREA[DesignAllocation]randomized AND AREA[StudyType]int",
        "pageSize": 10
      }
    },
    {
      description: "Search for Alzheimer drug trials excluding placebo or no treatment groups",
      usage: {
        "method": "search",
        "complexQuery": "alzheimer AND AREA[InterventionType]drug AND NOT (placebo OR \"no treatment\")",
        "pageSize": 15
      }
    }
  ]
};

export const handler: ToolHandler = async (args: any): Promise<string> => {
  const { method } = args;

  switch (method) {
    case 'search':
      return await handleSearchStudies(args);
    case 'suggest':
      return await handleSuggest(args);
    case 'get':
      return await handleGetStudy(args);
    default:
      throw new Error(`Invalid method: ${method}. Must be one of: search, suggest, get`);
  }
};

// Handler for search_studies method
async function handleSearchStudies(params: any): Promise<string> {
  // Extract search-specific parameters
  const searchParams = {
    condition: params.condition,
    term: params.term,
    intervention: params.intervention,
    titles: params.titles,
    outc: params.outc,
    id: params.id,
    complexQuery: params.complexQuery,
    phase: params.phase,
    status: params.status,
    ages: params.ages,
    ageRange: params.ageRange,
    sex: params.sex,
    location: params.location,
    lead: params.lead,
    healthy: params.healthy,
    studyType: params.studyType,
    funderType: params.funderType,
    results: params.results,
    docs: params.docs,
    violation: params.violation,
    allocation: params.allocation,
    masking: params.masking,
    assignment: params.assignment,
    purpose: params.purpose,
    model: params.model,
    interventionType: params.interventionType,
    timePerspective: params.timePerspective,
    whoMasked: params.whoMasked,
    start: params.start,
    primComp: params.primComp,
    firstPost: params.firstPost,
    resFirstPost: params.resFirstPost,
    lastUpdPost: params.lastUpdPost,
    studyComp: params.studyComp,
    sort: params.sort,
    // Pagination: prefer pageSize over limit, fallback to 10
    pageSize: params.pageSize || params.limit || 10,
    pageToken: params.pageToken,
    countTotal: params.countTotal !== false  // Default to true unless explicitly false
  };

  // Build query parameters for v2 API
  const queryParams = new URLSearchParams();
  
  // Handle complex search expressions - takes precedence over individual parameters
  if (searchParams.complexQuery) {
    queryParams.append('query.term', searchParams.complexQuery);
  } else {
    // Build individual query parameters when no complex query is provided
  if (searchParams.condition) {
      queryParams.append('query.cond', searchParams.condition);
  }
  
  if (searchParams.term) {
      queryParams.append('query.term', searchParams.term);
  }
  
  if (searchParams.intervention) {
      queryParams.append('query.intr', searchParams.intervention);
  }

  if (searchParams.titles) {
      queryParams.append('query.titles', searchParams.titles);
  }

  if (searchParams.outc) {
      queryParams.append('query.outc', searchParams.outc);
  }

  if (searchParams.id) {
      queryParams.append('query.id', searchParams.id);
  }

  if (searchParams.location) {
      queryParams.append('query.locn', searchParams.location);
    }
    
    if (searchParams.lead) {
      queryParams.append('query.lead', searchParams.lead);
  }

  if (searchParams.ageRange) {
    queryParams.append('ageRange', searchParams.ageRange);
  }
  
    // Build advanced filter for complex filtering
    const advancedFilters: string[] = [];
  
  if (searchParams.phase) {
      advancedFilters.push(`AREA[Phase] ${searchParams.phase}`);
  }
  
  if (searchParams.status) {
      advancedFilters.push(`AREA[OverallStatus] ${searchParams.status}`);
  }
  
  if (searchParams.ages) {
      advancedFilters.push(`AREA[StdAge] ${searchParams.ages}`);
  }
  
    // Note: Sex/Gender filtering not supported in v2 API advanced filters
    // It should be handled differently (possibly via dedicated filter parameters)
    
    // Note: HealthyVolunteers filtering not supported in v2 API advanced filters
    // This information is in study eligibility but not filterable via AREA[]

  if (searchParams.studyType) {
      advancedFilters.push(`AREA[StudyType] ${searchParams.studyType}`);
  }

  if (searchParams.funderType) {
      // Map to correct field name: LeadSponsorClass
      advancedFilters.push(`AREA[LeadSponsorClass] ${searchParams.funderType}`);
  }

    // Note: Results availability filtering not supported via AREA[] in v2 API
    // This should use dedicated filter parameters or different approach

  if (searchParams.allocation) {
      advancedFilters.push(`AREA[DesignAllocation] ${searchParams.allocation}`);
  }

  if (searchParams.masking) {
      advancedFilters.push(`AREA[DesignMasking] ${searchParams.masking}`);
  }

  if (searchParams.assignment) {
      advancedFilters.push(`AREA[DesignInterventionModel] ${searchParams.assignment}`);
  }

  if (searchParams.purpose) {
      advancedFilters.push(`AREA[DesignPrimaryPurpose] ${searchParams.purpose}`);
  }

    if (searchParams.interventionType) {
      advancedFilters.push(`AREA[InterventionType] ${searchParams.interventionType}`);
  }

    if (searchParams.model) {
      advancedFilters.push(`AREA[DesignObservationalModel] ${searchParams.model}`);
  }

  if (searchParams.timePerspective) {
      advancedFilters.push(`AREA[DesignTimePerspective] ${searchParams.timePerspective}`);
  }

  if (searchParams.whoMasked) {
      advancedFilters.push(`AREA[DesignWhoMasked] ${searchParams.whoMasked}`);
    }
    
    if (advancedFilters.length > 0) {
      queryParams.append('filter.advanced', advancedFilters.join(' AND '));
  }
  
  if (searchParams.start) {
    queryParams.append('start', searchParams.start);
  }
  
  if (searchParams.primComp) {
    queryParams.append('primComp', searchParams.primComp);
  }
  
  if (searchParams.firstPost) {
    queryParams.append('firstPost', searchParams.firstPost);
  }
  
  if (searchParams.resFirstPost) {
    queryParams.append('resFirstPost', searchParams.resFirstPost);
  }
  
  if (searchParams.lastUpdPost) {
    queryParams.append('lastUpdPost', searchParams.lastUpdPost);
  }
  
  if (searchParams.studyComp) {
    queryParams.append('studyComp', searchParams.studyComp);
  }
  
  if (searchParams.sort) {
    queryParams.append('sort', searchParams.sort);
  }
  }

  // Pagination parameters for v2 API
  queryParams.append('pageSize', searchParams.pageSize.toString());
  
  if (searchParams.pageToken) {
    queryParams.append('pageToken', searchParams.pageToken);
  }
  
  if (searchParams.countTotal) {
    queryParams.append('countTotal', 'true');
  }

  const url = `https://clinicaltrials.gov/api/v2/studies?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ct.gov-mcp-server/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: ClinicalTrialSearchResponse = await response.json();
    return formatSearchResults(data, searchParams);

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to search clinical trials: ${String(error)}`);
  }
}

// Handler for suggest method
async function handleSuggest(params: any): Promise<string> {
  const { input, dictionary } = params;

  // Validate required parameters
  if (!input) {
    throw new Error('input parameter is required for suggest method');
  }
  if (!dictionary) {
    throw new Error('dictionary parameter is required for suggest method');
  }

  // Validate input length
  if (input.length < 2) {
    throw new Error('Input must be at least 2 characters long');
  }

  try {
    const url = new URL('https://clinicaltrials.gov/api/int/suggest');
    url.searchParams.set('input', input);
    url.searchParams.set('dictionary', dictionary);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ct.gov-mcp-server'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const suggestions: string[] = await response.json();
    return formatSuggestResults(input, dictionary, suggestions);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return `# Error: ClinicalTrials.gov Suggest API\n\n❌ **Failed to get suggestions**\n\n**Error:** ${errorMessage}\n\n**Request Details:**\n- Input: "${input}"\n- Dictionary: ${dictionary}\n- API URL: https://clinicaltrials.gov/api/int/suggest\n\nPlease try again or check if the ClinicalTrials.gov API is accessible.`;
  }
}

// Handler for get_study method
async function handleGetStudy(params: any): Promise<string> {
  const { nctId, format = 'json', markupFormat = 'markdown', fields } = params;

  // Validate required parameters
  if (!nctId) {
    throw new Error('nctId parameter is required for get method');
  }

  // Validate NCT ID format
  const nctPattern = /^[Nn][Cc][Tt]0*[1-9]\d{0,7}$/;
  if (!nctPattern.test(nctId)) {
    throw new Error('Invalid NCT ID format. Must be in format NCT followed by 8 digits (e.g., NCT00841061)');
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (format !== 'json') {
    queryParams.append('format', format);
  }
  if (format === 'json' && markupFormat !== 'markdown') {
    queryParams.append('markupFormat', markupFormat);
  }
  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','));
  }

  const url = `https://clinicaltrials.gov/api/v2/studies/${nctId.toUpperCase()}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Study not found: ${nctId.toUpperCase()}. Please verify the NCT ID is correct.`);
      } else if (response.status === 301) {
        throw new Error(`Study ${nctId.toUpperCase()} has been redirected. This may be an alias - try the canonical NCT ID.`);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Handle non-JSON formats
    if (format !== 'json') {
      const data = await response.text();
      return `# Clinical Trial Data: ${nctId.toUpperCase()}\n\n**Format:** ${format.toUpperCase()}\n\n\`\`\`\n${data}\n\`\`\`\n\n**ClinicalTrials.gov Link:** [${nctId.toUpperCase()}](https://clinicaltrials.gov/study/${nctId.toUpperCase()})`;
    }

    const data: StudyResponse = await response.json();
    return formatStudyDetails(data);

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to retrieve study data: ${String(error)}`);
  }
}

// Helper functions for formatting results
function formatSearchResults(data: ClinicalTrialSearchResponse, params: any): string {
  const total = data.totalCount || 0;
  const pageSize = params.pageSize || params.limit || 10;
  const studiesCount = data.studies?.length || 0;

  let content = `# Clinical Trials Search Results\n\n`;
  
  // Search parameters summary
  content += `**Search Parameters:**\n`;
  const activeParams = Object.entries(params)
    .filter(([key, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
  
  if (activeParams) {
    content += `${activeParams}\n\n`;
  } else {
    content += `- No specific filters applied\n\n`;
  }

  content += `**Results:** ${Math.min(studiesCount, pageSize)} of ${total.toLocaleString()} studies found\n\n`;

  if (!data.studies || data.studies.length === 0) {
    content += `No clinical trials found matching your criteria.\n\n`;
    content += `**Suggestions:**\n`;
    content += `- Try broader search terms\n`;
    content += `- Remove some filters\n`;
    content += `- Check spelling of condition or intervention names\n`;
    content += `- Use the suggest method to find proper terminology\n`;
    return content;
  }

  content += `## Studies\n\n`;

  data.studies.forEach((study: ClinicalTrialHit, index: number) => {
    const identification = study.protocolSection.identificationModule;
    const status = study.protocolSection.statusModule;
    const design = study.protocolSection.designModule;
    const conditions = study.protocolSection.conditionsModule;
    const sponsor = study.protocolSection.sponsorCollaboratorsModule;

    content += `### ${index + 1}. ${identification.nctId}\n`;
    content += `**Title:** ${identification.briefTitle}\n`;
    content += `**Status:** ${formatEnumValue(status.overallStatus)}\n`;

    // Add phase information
    if (design?.phases && design.phases.length > 0) {
      content += `**Phase:** ${design.phases.map(p => formatEnumValue(p)).join(', ')}\n`;
    }

    // Add study type
    if (design?.studyType) {
      content += `**Study Type:** ${formatEnumValue(design.studyType)}\n`;
    }

    // Add enrollment information
    if (design?.enrollmentInfo?.count) {
      content += `**Enrollment:** ${design.enrollmentInfo.count.toLocaleString()} participants\n`;
    }

    // Add conditions
    if (conditions?.conditions && conditions.conditions.length > 0) {
      const conditionList = conditions.conditions.slice(0, 3).join(', ');
      const moreConditions = conditions.conditions.length > 3 ? ` (+${conditions.conditions.length - 3} more)` : '';
      content += `**Conditions:** ${conditionList}${moreConditions}\n`;
    }

    // Add lead sponsor
    if (sponsor?.leadSponsor) {
      content += `**Lead Sponsor:** ${sponsor.leadSponsor.name}\n`;
    }

    if (status.whyStopped) {
      content += `**Why Stopped:** ${status.whyStopped}\n`;
    }
    if (status.statusVerifiedDate) {
      content += `**Status Verified:** ${formatDate(status.statusVerifiedDate)}\n`;
    }
    if (status.studyFirstSubmitDate) {
      content += `**Posted:** ${formatDate(status.studyFirstSubmitDate)}\n`;
    }
    content += `**Link:** [View Study](https://clinicaltrials.gov/study/${identification.nctId})\n\n`;

    if (index < data.studies.length - 1) {
      content += `---\n\n`;
    }
  });

  // Pagination info
  if (total > pageSize) {
    content += `\n---\n\n`;
    content += `📊 **Showing ${studiesCount} of ${total.toLocaleString()} total results**\n\n`;
    
    if (data.nextPageToken) {
      content += `🔗 **Next Page Available**\n`;
      content += `To get the next page, use: \`pageToken: "${data.nextPageToken}"\`\n\n`;
      content += `**Example next page request:**\n`;
      content += `\`\`\`json\n`;
      content += `{\n`;
      content += `  "method": "search",\n`;
      if (params.condition) content += `  "condition": "${params.condition}",\n`;
      if (params.term) content += `  "term": "${params.term}",\n`;
      if (params.intervention) content += `  "intervention": "${params.intervention}",\n`;
      content += `  "pageSize": ${pageSize},\n`;
      content += `  "pageToken": "${data.nextPageToken}"\n`;
      content += `}\n`;
      content += `\`\`\`\n\n`;
    } else {
      content += `💡 **Tip:** To see more results, you can:\n`;
      content += `- Increase the \`pageSize\` parameter (max 1000)\n`;
      content += `- Use more specific search criteria to narrow results\n`;
      content += `- Use the \`sort\` parameter to change result ordering\n`;
    }
  }

  content += `\n**API Information:**\n`;
  content += `- Search performed against ClinicalTrials.gov API v2\n`;
  content += `- Data includes all registered studies regardless of status\n`;
  content += `- Results are updated daily from the official registry\n`;

  return content;
}

function formatSuggestResults(input: string, dictionary: string, suggestions: string[]): string {
  const dictionaryLabels = {
    'Condition': 'Medical Conditions',
    'InterventionName': 'Interventions & Treatments',
    'LeadSponsorName': 'Lead Sponsors',
    'LocationFacility': 'Medical Facilities'
  };

  let content = `# ClinicalTrials.gov Suggestions\n\n`;
  content += `**Dictionary:** ${dictionaryLabels[dictionary as keyof typeof dictionaryLabels]}\n`;
  content += `**Search Input:** "${input}"\n`;
  content += `**Results:** ${suggestions.length} suggestions found\n\n`;

  if (suggestions.length === 0) {
    content += `No suggestions found for "${input}" in ${dictionaryLabels[dictionary as keyof typeof dictionaryLabels]} dictionary.\n\n`;
    content += `**Tips:**\n`;
    content += `- Try a shorter or more general search term\n`;
    content += `- Check spelling\n`;
    content += `- Try searching in a different dictionary\n`;
  } else {
    content += `## Suggested Terms\n\n`;
    suggestions.forEach((suggestion, index) => {
      content += `${index + 1}. **${suggestion}**\n`;
    });
    
    content += `\n---\n\n`;
    content += `💡 **Tip:** You can use these suggested terms in the search_studies method for more accurate clinical trial searches.\n\n`;
    content += `**Dictionary Information:**\n`;
    
    switch (dictionary) {
      case 'Condition':
        content += `- Contains medical conditions, diseases, and health disorders\n`;
        content += `- Use for precise condition names in clinical trial searches\n`;
        break;
      case 'InterventionName':
        content += `- Contains treatments, drugs, procedures, and interventions\n`;
        content += `- Includes brand names, generic names, and treatment types\n`;
        break;
      case 'LeadSponsorName':
        content += `- Contains pharmaceutical companies, research institutions, and organizations\n`;
        content += `- Use to find trials sponsored by specific entities\n`;
        break;
      case 'LocationFacility':
        content += `- Contains hospital names, medical centers, and research facilities\n`;
        content += `- Use to find trials at specific institutions\n`;
        break;
    }
  }

  return content;
}

function formatStudyDetails(data: StudyResponse): string {
  const protocol = data.protocolSection;
  const identification = protocol.identificationModule;
  const status = protocol.statusModule;
  const sponsor = protocol.sponsorCollaboratorsModule;
  const description = protocol.descriptionModule;
  const conditions = protocol.conditionsModule;
  const design = protocol.designModule;
  const arms = protocol.armsInterventionsModule;
  const outcomes = protocol.outcomesModule;
  const eligibility = protocol.eligibilityModule;
  const contacts = protocol.contactsLocationsModule;
  const oversight = protocol.oversightModule;
  const derived = data.derivedSection;

  let content = `# Clinical Trial Details: ${identification.nctId}\n\n`;

  // Basic information
  content += `**Study Title:** ${identification.briefTitle}\n`;
  if (identification.officialTitle && identification.officialTitle !== identification.briefTitle) {
    content += `**Official Title:** ${identification.officialTitle}\n`;
  }
  if (identification.acronym) {
    content += `**Acronym:** ${identification.acronym}\n`;
  }
  content += `**Status:** ${formatEnumValue(status.overallStatus)}\n`;
  if (status.whyStopped) {
    content += `**Why Stopped:** ${status.whyStopped}\n`;
  }
  if (status.statusVerifiedDate) {
    content += `**Status Verified:** ${formatDate(status.statusVerifiedDate)}\n`;
  }
  if (design) {
    content += `**Study Type:** ${formatEnumValue(design.studyType)}\n`;
    if (design.phases && design.phases.length > 0) {
      content += `**Phase:** ${design.phases.map(p => formatEnumValue(p)).join(', ')}\n`;
    }
  }
  content += `\n`;

  // Study overview
  content += `## Study Overview\n\n`;
  if (sponsor?.leadSponsor) {
    content += `**Lead Sponsor:** ${sponsor.leadSponsor.name} (${formatEnumValue(sponsor.leadSponsor.class)})\n`;
  }
  if (sponsor?.collaborators && sponsor.collaborators.length > 0) {
    content += `**Collaborators:** ${sponsor.collaborators.map(c => c.name).join(', ')}\n`;
  }
  if (status.startDateStruct?.date) {
    content += `**Study Start:** ${formatDate(status.startDateStruct.date)}`;
    if (status.startDateStruct.type) {
      content += ` (${formatEnumValue(status.startDateStruct.type)})`;
    }
    content += `\n`;
  }
  if (status.primaryCompletionDateStruct?.date) {
    content += `**Primary Completion:** ${formatDate(status.primaryCompletionDateStruct.date)}`;
    if (status.primaryCompletionDateStruct.type) {
      content += ` (${formatEnumValue(status.primaryCompletionDateStruct.type)})`;
    }
    content += `\n`;
  }
  if (status.completionDateStruct?.date) {
    content += `**Study Completion:** ${formatDate(status.completionDateStruct.date)}`;
    if (status.completionDateStruct.type) {
      content += ` (${formatEnumValue(status.completionDateStruct.type)})`;
    }
    content += `\n`;
  }

  // Oversight Information
  if (oversight) {
    const oversightItems: string[] = [];
    if (oversight.oversightHasDmc !== undefined) {
      oversightItems.push(`Data Monitoring Committee: ${oversight.oversightHasDmc ? 'Yes' : 'No'}`);
    }
    if (oversight.isFdaRegulatedDrug !== undefined) {
      oversightItems.push(`FDA Regulated Drug: ${oversight.isFdaRegulatedDrug ? 'Yes' : 'No'}`);
    }
    if (oversight.isFdaRegulatedDevice !== undefined) {
      oversightItems.push(`FDA Regulated Device: ${oversight.isFdaRegulatedDevice ? 'Yes' : 'No'}`);
    }
    if (oversight.isUnapprovedDevice !== undefined) {
      oversightItems.push(`Unapproved Device: ${oversight.isUnapprovedDevice ? 'Yes' : 'No'}`);
    }
    if (oversightItems.length > 0) {
      content += `**Oversight:** ${oversightItems.join(', ')}\n`;
    }
  }
  content += `\n`;

  // Study design
  if (design && (design.designInfo || design.enrollmentInfo)) {
    content += `## Study Design\n\n`;
    if (design.designInfo?.allocation) {
      content += `- **Allocation:** ${formatEnumValue(design.designInfo.allocation)}\n`;
    }
    if (design.designInfo?.interventionModel) {
      content += `- **Intervention Model:** ${formatEnumValue(design.designInfo.interventionModel)}\n`;
    }
    if (design.designInfo?.primaryPurpose) {
      content += `- **Primary Purpose:** ${formatEnumValue(design.designInfo.primaryPurpose)}\n`;
    }
    if (design.designInfo?.maskingInfo?.masking) {
      content += `- **Masking:** ${formatEnumValue(design.designInfo.maskingInfo.masking)}`;
      if (design.designInfo.maskingInfo.whoMasked && design.designInfo.maskingInfo.whoMasked.length > 0) {
        content += ` (${design.designInfo.maskingInfo.whoMasked.map(w => formatEnumValue(w)).join(', ')})`;
      }
      content += `\n`;
    }
    if (design.enrollmentInfo) {
      content += `- **Enrollment:** ${design.enrollmentInfo.count.toLocaleString()} participants`;
      if (design.enrollmentInfo.type) {
        content += ` (${formatEnumValue(design.enrollmentInfo.type)})`;
      }
      content += `\n`;
    }
    content += `\n`;
  }

  // Conditions
  if (conditions?.conditions && conditions.conditions.length > 0) {
    content += `## Conditions\n\n`;
    conditions.conditions.forEach(condition => {
      content += `- ${condition}\n`;
    });
    content += `\n`;
  }

  // MeSH Terms (Medical Subject Headings)
  if (derived?.conditionBrowseModule?.meshes && derived.conditionBrowseModule.meshes.length > 0) {
    content += `## MeSH Terms (Conditions)\n\n`;
    derived.conditionBrowseModule.meshes.forEach(mesh => {
      content += `- ${mesh.term} (${mesh.id})\n`;
    });
    content += `\n`;
  }

  if (derived?.interventionBrowseModule?.meshes && derived.interventionBrowseModule.meshes.length > 0) {
    content += `## MeSH Terms (Interventions)\n\n`;
    derived.interventionBrowseModule.meshes.forEach(mesh => {
      content += `- ${mesh.term} (${mesh.id})\n`;
    });
    content += `\n`;
  }

  // Interventions
  if (arms?.interventions && arms.interventions.length > 0) {
    content += `## Interventions\n\n`;
    arms.interventions.forEach(intervention => {
      content += `### ${formatEnumValue(intervention.type)}: ${intervention.name}\n`;
      if (intervention.description) {
        content += `${intervention.description}\n`;
      }
      if (intervention.armGroupLabels && intervention.armGroupLabels.length > 0) {
        content += `**Used in:** ${intervention.armGroupLabels.join(', ')}\n`;
      }
      content += `\n`;
    });
  }

  // Primary outcomes
  if (outcomes?.primaryOutcomes && outcomes.primaryOutcomes.length > 0) {
    content += `## Primary Outcomes\n\n`;
    outcomes.primaryOutcomes.forEach((outcome, index) => {
      content += `${index + 1}. **Measure:** ${outcome.measure}\n`;
      if (outcome.description) {
        content += `   **Description:** ${outcome.description}\n`;
      }
      if (outcome.timeFrame) {
        content += `   **Time Frame:** ${outcome.timeFrame}\n`;
      }
      content += `\n`;
    });
  }

  // Eligibility
  if (eligibility) {
    content += `## Eligibility Criteria\n\n`;
    if (eligibility.sex) {
      content += `**Sex:** ${formatEnumValue(eligibility.sex)}\n`;
    }
    if (eligibility.minimumAge || eligibility.maximumAge) {
      content += `**Age Range:** `;
      if (eligibility.minimumAge) {
        content += `${eligibility.minimumAge}`;
      } else {
        content += `No minimum`;
      }
      content += ` to `;
      if (eligibility.maximumAge) {
        content += `${eligibility.maximumAge}`;
      } else {
        content += `No maximum`;
      }
      content += `\n`;
    }
    if (eligibility.healthyVolunteers !== undefined) {
      content += `**Healthy Volunteers:** ${eligibility.healthyVolunteers ? 'Yes' : 'No'}\n`;
    }
    if (eligibility.eligibilityCriteria) {
      content += `\n**Criteria:**\n${eligibility.eligibilityCriteria}\n`;
    }
    content += `\n`;
  }

  // Locations
  if (contacts?.locations && contacts.locations.length > 0) {
    content += `## Locations\n\n`;
    contacts.locations.forEach(location => {
      content += `- **Facility:** ${location.facility}`;
      if (location.city || location.state || location.country) {
        const locationParts = [location.city, location.state, location.country].filter(Boolean);
        content += `, ${locationParts.join(', ')}`;
      }
      if (location.status) {
        content += ` (${formatEnumValue(location.status)})`;
      }
      content += `\n`;
    });
    content += `\n`;
  }

  // Add link to ClinicalTrials.gov
  content += `**ClinicalTrials.gov Link:** [${identification.nctId}](https://clinicaltrials.gov/study/${identification.nctId})`;

  return content;
}

function formatEnumValue(value: string): string {
  if (!value) return value;
  
  // Convert enum values to readable format
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

 