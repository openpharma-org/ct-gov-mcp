import { ToolDefinition, ToolHandler } from '../types.js';

/**
 * Clinical trial search result interface
 */
interface ClinicalTrialHit {
  id: string;
  study: {
    protocolSection: {
      identificationModule: {
        briefTitle: string;
      };
      statusModule: {
        overallStatus: string;
        studyFirstSubmitDate: string;
      };
    };
  };
}

interface ClinicalTrialSearchResponse {
  from: number;
  limit: number;
  total: number;
  terms: string[];
  hits: ClinicalTrialHit[];
}

interface ClinicalTrialSearchParams {
  condition?: string;
  term?: string;
  intervention?: string;
  titles?: string;
  outc?: string;
  id?: string;
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
}

export const definition: ToolDefinition = {
  name: 'ct_gov_search_studies',
  description: 'Search clinical trials on ClinicalTrials.gov using official API parameters. Supports comprehensive filtering by condition, interventions, study phases, recruitment status, demographics, locations, sponsors, study types, funding sources, study design (allocation, masking, assignment), research purpose, observational models, intervention types, time perspectives, masking details, and temporal ranges. Includes expanded access programs, healthy volunteer studies, and violation tracking.',
  inputSchema: {
    type: 'object',
    properties: {
      condition: {
        type: 'string',
        description: 'Primary condition to search for (e.g., "Diabetes Mellitus Type 2", "Heart Failure", "Cancer")'
      },
      term: {
        type: 'string',
        description: 'Additional search terms (e.g., "Hypertension", "Diabetes", "Expanded Access")'
      },
      intervention: {
        type: 'string',
        description: 'Intervention or treatment being studied (e.g., "Aspirin", "Ibuprofen", "Immunotherapy")'
      },
      titles: {
        type: 'string',
        description: 'Search in study titles and acronyms'
      },
      outc: {
        type: 'string',
        description: 'Search in study outcomes and endpoints'
      },
      id: {
        type: 'string',
        description: 'Search by study identifiers: NCT ID, organization study ID, secondary ID, or study acronym'
      },
      phase: {
        type: 'string',
        description: 'Clinical trial phases based on official API enums (Early Phase 1, Phase 1-4, Not Applicable)',
        enum: ['0', '1', '2', '3', '4', 'NA', 'early1', '0 NA', '1 2', '2 3', '3 4', '1 2 3', '1 2 3 4', 'early1 1', 'early1 1 2']
      },
      status: {
        type: 'string',
        description: 'Study recruitment and completion status including expanded access programs. Based on official Status and ExpandedAccessStatus enums.',
        enum: [
          // Standard recruitment statuses (legacy format for search compatibility)
          'not', 'rec', 'act', 'com', 'ter', 'enr', 'sus', 'wit', 'unk',
          // Combined statuses
          'not com', 'rec act', 'not rec act',
          // Expanded access statuses
          'ava', 'nla', 'tna', 'afm',
          // Combined expanded access
          'ava nla', 'ava tna', 'nla tna', 'ava nla tna', 'ava nla tna afm'
        ]
      },
      ages: {
        type: 'string',
        description: 'Predefined age groups to include in the study',
        enum: ['child', 'adult', 'older', 'child adult', 'adult older', 'child adult older']
      },
      ageRange: {
        type: 'string',
        description: 'Custom age range in format "minAge_maxAge" (e.g., "16y_34y", "65y_85y", "18y_65y")'
      },
      sex: {
        type: 'string',
        description: 'Sex/gender eligibility filter',
        enum: ['all', 'm', 'f']
      },
      location: {
        type: 'string',
        description: 'Geographic location filter: accepts full addresses, cities, states, countries, or country codes (e.g., "Houston", "Texas", "United States", "US", "Mayo Clinic Rochester")'
      },
      lead: {
        type: 'string',
        description: 'Lead sponsor or principal organization conducting the study (e.g., "Pfizer", "Mayo Clinic", "National Cancer Institute")'
      },
      healthy: {
        type: 'string',
        description: 'Include studies that accept healthy volunteers (non-patient participants)',
        enum: ['y']
      },
      studyType: {
        type: 'string',
        description: 'Type of clinical study based on official StudyType enum: Interventional, Observational, or Expanded Access',
        enum: [
          // Single types
          'int', 'obs', 'exp',
          // Observational subtypes
          'obs_patreg',
          // Expanded access subtypes
          'exp_indiv', 'exp_inter', 'exp_treat',
          // Combined types
          'int obs', 'int exp', 'obs exp', 'int obs exp'
        ]
      },
      funderType: {
        type: 'string',
        description: 'Funding organization type based on official AgencyClass enum (NIH, Federal, Industry, etc.). Use OR operator to combine multiple values (e.g., "nih OR fed").',
        enum: [
          // Individual funder types
          'nih', 'fed', 'industry', 'other', 'indiv', 'network',
          // Common combinations
          'nih OR fed', 'nih OR industry', 'fed OR industry', 'industry OR other',
          // Comprehensive combinations
          'nih OR fed OR industry', 'nih OR fed OR other', 'fed OR industry OR other',
          'nih OR fed OR industry OR other'
        ]
      },
      results: {
        type: 'string',
        description: 'Filter by availability of study results based on ReportingStatus enum',
        enum: ['with', 'without', 'with without']
      },
      docs: {
        type: 'string',
        description: 'Filter by availability of study documents based on official IpdSharingInfoType enum',
        enum: [
          // Individual document types
          'prot', 'sap', 'icf', 'csr',
          // Common combinations
          'prot sap', 'prot icf', 'sap icf', 'prot csr',
          // Comprehensive combinations
          'prot sap icf', 'prot sap csr', 'sap icf csr',
          'prot sap icf csr'
        ]
      },
      violation: {
        type: 'string',
        description: 'Filter studies with FDA violations or compliance issues based on ViolationEventType enum',
        enum: ['y']
      },
      allocation: {
        type: 'string',
        description: 'Study design allocation method based on official DesignAllocation enum',
        enum: [
          // Individual allocation types
          'randomized', 'nonrandomized', 'na',
          // Combined allocations
          'randomized nonrandomized', 'randomized na', 'nonrandomized na',
          'randomized nonrandomized na'
        ]
      },
      masking: {
        type: 'string',
        description: 'Study blinding/masking design based on official DesignMasking enum',
        enum: [
          // Individual masking types
          'none', 'single', 'double', 'triple', 'quadruple',
          // Combined masking
          'single double', 'double triple', 'triple quadruple',
          'single double triple', 'double triple quadruple',
          'single double triple quadruple'
        ]
      },
      assignment: {
        type: 'string',
        description: 'Intervention assignment strategy based on official InterventionalAssignment enum',
        enum: [
          // Individual assignment types
          'single', 'parallel', 'crossover', 'factorial', 'sequential',
          // Combined assignments
          'single parallel', 'parallel crossover', 'crossover factorial',
          'single parallel crossover', 'parallel crossover factorial',
          'single parallel crossover factorial sequential'
        ]
      },
      purpose: {
        type: 'string',
        description: 'Primary purpose of the study based on official DesignPrimaryPurpose enum',
        enum: [
          // Individual purposes
          'treatment', 'prevention', 'diagnostic', 'supportive', 'screening',
          'healthservices', 'basicscience', 'devicefeasibility', 'other',
          // Common combinations
          'treatment prevention', 'treatment diagnostic', 'prevention diagnostic',
          'treatment supportive', 'diagnostic screening',
          // Comprehensive combinations
          'treatment prevention diagnostic', 'treatment prevention supportive',
          'treatment diagnostic supportive', 'prevention diagnostic supportive',
          'treatment prevention diagnostic supportive'
        ]
      },
      model: {
        type: 'string',
        description: 'Observational study model based on official DesignObservationalModel enum',
        enum: [
          // Individual models
          'cohort', 'casecontrol', 'caseonly', 'casecrossover', 'ecologic',
          'familybased', 'other', 'defined',
          // Combined models
          'cohort casecontrol', 'cohort caseonly', 'casecontrol casecrossover',
          'cohort casecontrol caseonly', 'cohort casecontrol casecrossover',
          'cohort casecontrol caseonly casecrossover'
        ]
      },
      interventionType: {
        type: 'string',
        description: 'Type of intervention being studied based on official InterventionType enum',
        enum: [
          // Individual intervention types
          'drug', 'device', 'biological', 'procedure', 'behavioral', 'genetic',
          'dietary', 'radiation', 'combination', 'diagnostic', 'other',
          // Combined intervention types
          'drug device', 'drug biological', 'procedure behavioral', 'device procedure',
          'biological procedure', 'drug procedure', 'behavioral dietary',
          // Comprehensive combinations
          'drug device biological', 'procedure behavioral dietary',
          'drug device procedure', 'biological procedure behavioral'
        ]
      },
      timePerspective: {
        type: 'string',
        description: 'Time perspective for observational studies based on official DesignTimePerspective enum',
        enum: [
          // Individual time perspectives
          'retrospective', 'prospective', 'crosssectional', 'other',
          // Combined perspectives
          'retrospective prospective', 'prospective crosssectional',
          'retrospective crosssectional', 'retrospective prospective crosssectional'
        ]
      },
      whoMasked: {
        type: 'string',
        description: 'Who is masked/blinded in the study based on official WhoMasked enum',
        enum: [
          // Individual roles
          'participant', 'careprovider', 'investigator', 'outcomesassessor',
          // Common combinations
          'participant careprovider', 'participant investigator', 'careprovider investigator',
          'participant outcomesassessor', 'investigator outcomesassessor',
          // Triple combinations
          'participant careprovider investigator', 'participant careprovider outcomesassessor',
          'participant investigator outcomesassessor', 'careprovider investigator outcomesassessor',
          // All roles
          'participant careprovider investigator outcomesassessor'
        ]
      },
      start: {
        type: 'string',
        description: 'Study start date range in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2024-01-01_2025-03-12")'
      },
      primComp: {
        type: 'string',
        description: 'Primary completion date range in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-11-01_2025-12-12")'
      },
      firstPost: {
        type: 'string',
        description: 'Study first posted date range in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-01-01_2025-12-12")'
      },
      resFirstPost: {
        type: 'string',
        description: 'Results first posted date range in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-01-02_2025-11-11")'
      },
      lastUpdPost: {
        type: 'string',
        description: 'Last update posted date range in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-03-03_2025-10-10")'
      },
      studyComp: {
        type: 'string',
        description: 'Study completion date range in format "YYYY-MM-DD_YYYY-MM-DD" or "YYYY-MM-DD_" for on/after date (e.g., "2025-11-01_")'
      },
      sort: {
        type: 'string',
        description: 'Sort order for search results',
        enum: ['@relevance', 'StudyFirstPostDate', 'LastUpdatePostDate', 'NCTId', 'StartDate', 'PrimaryCompletionDate', 'CompletionDate', 'EnrollmentCount']
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10, max: 100)',
        minimum: 1,
        maximum: 100,
        default: 10
      }
    },
    required: []
  },
  examples: [
    {
      description: "Search for diabetes and hypertension studies",
      usage: { 
        "condition": "Diabetes Mellitus Type 2", 
        "term": "Hypertension", 
        "limit": 5 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Condition: Diabetes Mellitus Type 2, Terms: Hypertension\n**Total Results:** 744\n**Showing:** 5 of 744 results\n\n## Studies Found\n\n### 1. Teaching: Individual to Increase Adherence to Therapeutic Regimen..."
    },
    {
      description: "Search for expanded access programs with comprehensive status filtering",
      usage: { 
        "term": "Expanded Access",
        "status": "ava nla tna afm",
        "studyType": "exp",
        "limit": 10 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Terms: Expanded Access, Status: ava nla tna afm, Study Type: exp\n**Total Results:** 999\n**Showing:** 10 of 999 results\n\n## Studies Found\n\n### 1. Managed Access Programs for TQJ230, Pelacarsen..."
    },
    {
      description: "Search for early phase studies with comprehensive documentation",
      usage: { 
        "phase": "early1 1",
        "docs": "prot sap icf csr",
        "funderType": "nih fed industry",
        "results": "with",
        "limit": 10 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Phase: early1 1, Docs: prot sap icf csr, Funder Type: nih fed industry, Results: with\n**Total Results:** 1,542\n**Showing:** 10 of 1,542 results\n\n## Studies Found\n\n### 1. Early Phase Investigation of Novel Therapeutic..."
    },
    {
      description: "Search for industry-sponsored Phase 3 recruiting studies with violation tracking",
      usage: { 
        "funderType": "industry",
        "phase": "3", 
        "status": "rec act",
        "violation": "y",
        "limit": 10 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Funder Type: industry, Phase: 3, Status: rec act, Violation: y\n**Total Results:** 23\n**Showing:** 10 of 23 results\n\n## Studies Found\n\n### 1. Multi-center Phase 3 Trial with FDA Oversight..."
    },
    {
      description: "Search for observational studies with patient registries accepting healthy volunteers",
      usage: { 
        "studyType": "obs_patreg",
        "healthy": "y",
        "ages": "adult older_adult",
        "funderType": "nih fed",
        "limit": 10 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Study Type: obs_patreg, Healthy: y, Ages: adult older_adult, Funder Type: nih fed\n**Total Results:** 2,156\n**Showing:** 10 of 2,156 results\n\n## Studies Found\n\n### 1. National Patient Registry for Cardiovascular Health..."
    },
    {
      description: "Search for randomized double-blind treatment studies with comprehensive design filtering",
      usage: { 
        "condition": "Hypertension",
        "purpose": "treatment",
        "allocation": "randomized",
        "masking": "double",
        "assignment": "parallel",
        "phase": "3",
        "limit": 15 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Condition: Hypertension, Purpose: Treatment, Allocation: Randomized, Masking: Double Blind, Assignment: Parallel Assignment, Phase: Phase 3\n**Total Results:** 1,847\n**Showing:** 15 of 1,847 results\n\n## Studies Found\n\n### 1. Randomized Double-Blind Study of ACE Inhibitor..."
    },
    {
      description: "Search for drug trials with specific masking and intervention details",
      usage: { 
        "condition": "Cancer",
        "interventionType": "drug biological",
        "whoMasked": "participant careprovider investigator",
        "timePerspective": "prospective",
        "purpose": "treatment",
        "limit": 12 
      },
      response: "# Clinical Trials Search Results\n\n**Search Criteria:** Condition: Cancer, Intervention Type: Drug, Biological/Vaccine, Who Masked: Participant, Care Provider, Investigator, Time Perspective: Prospective, Purpose: Treatment\n**Total Results:** 2,847\n**Showing:** 12 of 2,847 results\n\n## Studies Found\n\n### 1. Triple-Blind Drug and Immunotherapy Combination Study..."
    }
  ]
};

export const handler: ToolHandler = async (args: any): Promise<string> => {
  const { condition, term, intervention, titles, outc, id, phase, status, ages, ageRange, sex, location, lead, healthy, studyType, funderType, results, docs, violation, allocation, masking, assignment, purpose, model, interventionType, timePerspective, whoMasked, start, primComp, firstPost, resFirstPost, lastUpdPost, studyComp, sort, limit = 10 } = args as ClinicalTrialSearchParams;

  // Validate that at least one search parameter is provided
  if (!condition && !term && !intervention && !titles && !outc && !id && !phase && !status && !ages && !ageRange && !sex && !location && !lead && !healthy && !studyType && !funderType && !results && !docs && !violation && !allocation && !masking && !assignment && !purpose && !model && !interventionType && !timePerspective && !whoMasked && !start && !primComp && !firstPost && !resFirstPost && !lastUpdPost && !studyComp && !sort) {
    throw new Error('At least one search parameter must be provided');
  }

  // Validate limit
  if (limit !== undefined && (typeof limit !== 'number' || limit < 1 || limit > 100)) {
    throw new Error('Limit must be a number between 1 and 100');
  }

  // Validate ageRange format if provided
  if (ageRange && !/^\d+[ym]_\d+[ym]$/.test(ageRange)) {
    throw new Error('Age range must be in format "minAge_maxAge" (e.g., "16y_34y", "2m_12m")');
  }

  // Validate date range formats if provided
  const dateRangePattern = /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;
  const dateRangeOrAfterPattern = /^\d{4}-\d{2}-\d{2}_(\d{4}-\d{2}-\d{2})?$/;
  
  if (start && !dateRangePattern.test(start)) {
    throw new Error('Start date range must be in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2024-01-01_2025-03-12")');
  }
  if (primComp && !dateRangePattern.test(primComp)) {
    throw new Error('Primary completion date range must be in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-11-01_2025-12-12")');
  }
  if (firstPost && !dateRangePattern.test(firstPost)) {
    throw new Error('First post date range must be in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-01-01_2025-12-12")');
  }
  if (resFirstPost && !dateRangePattern.test(resFirstPost)) {
    throw new Error('Results first post date range must be in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-01-02_2025-11-11")');
  }
  if (lastUpdPost && !dateRangePattern.test(lastUpdPost)) {
    throw new Error('Last update post date range must be in format "YYYY-MM-DD_YYYY-MM-DD" (e.g., "2025-03-03_2025-10-10")');
  }
  if (studyComp && !dateRangeOrAfterPattern.test(studyComp)) {
    throw new Error('Study completion date must be in format "YYYY-MM-DD_YYYY-MM-DD" or "YYYY-MM-DD_" (e.g., "2025-11-01_")');
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (condition) {
    queryParams.append('cond', condition);
  }
  
  if (term) {
    queryParams.append('term', term);
  }
  
  if (intervention) {
    queryParams.append('intr', intervention);
  }

  if (titles) {
    queryParams.append('titles', titles);
  }

  if (outc) {
    queryParams.append('outc', outc);
  }

  if (id) {
    queryParams.append('id', id);
  }

  if (location) {
    queryParams.append('locn', location);
  }

  if (ageRange) {
    queryParams.append('ageRange', ageRange);
  }
  
  // Build aggFilters parameter for advanced filtering
  const aggFilters: string[] = [];
  
  if (phase) {
    aggFilters.push(`phase:${phase}`);
  }
  
  if (status) {
    aggFilters.push(`status:${status}`);
  }
  
  if (ages) {
    aggFilters.push(`ages:${ages}`);
  }
  
  if (sex) {
    aggFilters.push(`sex:${sex}`);
  }
  
  if (lead) {
    aggFilters.push(`lead:${lead}`);
  }

  if (healthy) {
    aggFilters.push(`healthy:${healthy}`);
  }

  if (studyType) {
    aggFilters.push(`studyType:${studyType}`);
  }

  if (funderType) {
    aggFilters.push(`funderType:${funderType}`);
  }

  if (results) {
    aggFilters.push(`results:${results}`);
  }

  if (docs) {
    aggFilters.push(`docs:${docs}`);
  }

  if (violation) {
    aggFilters.push(`violation:${violation}`);
  }

  if (allocation) {
    aggFilters.push(`allocation:${allocation}`);
  }

  if (masking) {
    aggFilters.push(`masking:${masking}`);
  }

  if (assignment) {
    aggFilters.push(`assignment:${assignment}`);
  }

  if (purpose) {
    aggFilters.push(`purpose:${purpose}`);
  }

  if (model) {
    aggFilters.push(`model:${model}`);
  }

  if (interventionType) {
    aggFilters.push(`interventionType:${interventionType}`);
  }

  if (timePerspective) {
    aggFilters.push(`timePerspective:${timePerspective}`);
  }

  if (whoMasked) {
    aggFilters.push(`whoMasked:${whoMasked}`);
  }
  
  if (start) {
    queryParams.append('start', start);
  }
  
  if (primComp) {
    queryParams.append('primComp', primComp);
  }
  
  if (firstPost) {
    queryParams.append('firstPost', firstPost);
  }
  
  if (resFirstPost) {
    queryParams.append('resFirstPost', resFirstPost);
  }
  
  if (lastUpdPost) {
    queryParams.append('lastUpdPost', lastUpdPost);
  }
  
  if (studyComp) {
    queryParams.append('studyComp', studyComp);
  }
  
  if (sort) {
    queryParams.append('sort', sort);
  }
  
  if (aggFilters.length > 0) {
    queryParams.append('aggFilters', aggFilters.join(','));
  }
  
  queryParams.append('limit', limit.toString());

  const url = `https://clinicaltrials.gov/api/int/studies?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ct.gov-mcp-server/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${response.status} ${response.statusText}`);
    }

    const data: ClinicalTrialSearchResponse = await response.json();
    return formatSearchResults(data, { condition, term, intervention, titles, outc, id, phase, status, ages, ageRange, sex, location, lead, healthy, studyType, funderType, results, docs, violation, allocation, masking, assignment, purpose, model, interventionType, timePerspective, whoMasked, start, primComp, firstPost, resFirstPost, lastUpdPost, studyComp, sort, limit });

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search clinical trials: ${error.message}`);
    }
    throw new Error('Failed to search clinical trials: Unknown error occurred');
  }
};

// Official API enum mappings for better descriptions
const PHASE_DESCRIPTIONS: Record<string, string> = {
  '0': 'Phase 0 (Exploratory)',
  '1': 'Phase 1 (Safety)',
  '2': 'Phase 2 (Efficacy)',
  '3': 'Phase 3 (Large-scale)',
  '4': 'Phase 4 (Post-marketing)',
  'NA': 'Not Applicable',
  'early1': 'Early Phase 1'
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  'not': 'Not yet recruiting',
  'rec': 'Recruiting',
  'act': 'Active, not recruiting',
  'com': 'Completed',
  'ter': 'Terminated',
  'enr': 'Enrolling by invitation',
  'sus': 'Suspended',
  'wit': 'Withdrawn',
  'unk': 'Unknown status',
  'ava': 'Available (Expanded Access)',
  'nla': 'No longer available (Expanded Access)',
  'tna': 'Temporarily not available (Expanded Access)',
  'afm': 'Approved for marketing'
};

const STUDY_TYPE_DESCRIPTIONS: Record<string, string> = {
  'int': 'Interventional',
  'obs': 'Observational',
  'obs_patreg': 'Observational (Patient Registry)',
  'exp': 'Expanded Access',
  'exp_indiv': 'Expanded Access (Individual)',
  'exp_inter': 'Expanded Access (Intermediate)',
  'exp_treat': 'Expanded Access (Treatment)'
};

const FUNDER_TYPE_DESCRIPTIONS: Record<string, string> = {
  'nih': 'NIH',
  'fed': 'Federal',
  'industry': 'Industry',
  'other': 'Other',
  'indiv': 'Individual',
  'network': 'Network'
};

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  'prot': 'Protocol',
  'sap': 'Statistical Analysis Plan',
  'icf': 'Informed Consent Form',
  'csr': 'Clinical Study Report'
};

const ALLOCATION_DESCRIPTIONS: Record<string, string> = {
  'randomized': 'Randomized',
  'nonrandomized': 'Non-Randomized',
  'na': 'Not Applicable'
};

const MASKING_DESCRIPTIONS: Record<string, string> = {
  'none': 'Open Label (No Masking)',
  'single': 'Single Blind',
  'double': 'Double Blind',
  'triple': 'Triple Blind',
  'quadruple': 'Quadruple Blind'
};

const ASSIGNMENT_DESCRIPTIONS: Record<string, string> = {
  'single': 'Single Group',
  'parallel': 'Parallel Assignment',
  'crossover': 'Crossover Assignment',
  'factorial': 'Factorial Assignment',
  'sequential': 'Sequential Assignment'
};

const PURPOSE_DESCRIPTIONS: Record<string, string> = {
  'treatment': 'Treatment',
  'prevention': 'Prevention',
  'diagnostic': 'Diagnostic',
  'supportive': 'Supportive Care',
  'screening': 'Screening',
  'healthservices': 'Health Services Research',
  'basicscience': 'Basic Science',
  'devicefeasibility': 'Device Feasibility',
  'other': 'Other'
};

const MODEL_DESCRIPTIONS: Record<string, string> = {
  'cohort': 'Cohort',
  'casecontrol': 'Case-Control',
  'caseonly': 'Case-Only',
  'casecrossover': 'Case-Crossover',
  'ecologic': 'Ecologic',
  'familybased': 'Family-Based',
  'other': 'Other',
  'defined': 'Defined Population'
};

const INTERVENTION_TYPE_DESCRIPTIONS: Record<string, string> = {
  'drug': 'Drug',
  'device': 'Device',
  'biological': 'Biological/Vaccine',
  'procedure': 'Procedure/Surgery',
  'behavioral': 'Behavioral',
  'genetic': 'Genetic',
  'dietary': 'Dietary Supplement',
  'radiation': 'Radiation',
  'combination': 'Combination Product',
  'diagnostic': 'Diagnostic Test',
  'other': 'Other'
};

const TIME_PERSPECTIVE_DESCRIPTIONS: Record<string, string> = {
  'retrospective': 'Retrospective',
  'prospective': 'Prospective',
  'crosssectional': 'Cross-Sectional',
  'other': 'Other'
};

const WHO_MASKED_DESCRIPTIONS: Record<string, string> = {
  'participant': 'Participant',
  'careprovider': 'Care Provider',
  'investigator': 'Investigator',
  'outcomesassessor': 'Outcomes Assessor'
};

/**
 * Format the search results into a readable markdown string with official API enum descriptions
 */
function formatSearchResults(data: ClinicalTrialSearchResponse, params: ClinicalTrialSearchParams): string {
  const { condition, term, intervention, titles, outc, id, phase, status, ages, ageRange, sex, location, lead, healthy, studyType, funderType, results, docs, violation, allocation, masking, assignment, purpose, model, interventionType, timePerspective, whoMasked, start, primComp, firstPost, resFirstPost, lastUpdPost, studyComp, sort, limit } = params;
  
  let result = '# Clinical Trials Search Results\n\n';
  
  // Build search criteria summary with enhanced descriptions
  const criteria: string[] = [];
  if (condition) criteria.push(`Condition: ${condition}`);
  if (term) criteria.push(`Terms: ${term}`);
  if (intervention) criteria.push(`Intervention: ${intervention}`);
  if (titles) criteria.push(`Titles: ${titles}`);
  if (outc) criteria.push(`Outcomes: ${outc}`);
  if (id) criteria.push(`ID: ${id}`);
  if (phase) {
    const phaseDesc = phase.split(' ').map(p => PHASE_DESCRIPTIONS[p] || p).join(', ');
    criteria.push(`Phase: ${phaseDesc}`);
  }
  if (status) {
    const statusDesc = status.split(' ').map(s => STATUS_DESCRIPTIONS[s] || s).join(', ');
    criteria.push(`Status: ${statusDesc}`);
  }
  if (ages) criteria.push(`Ages: ${ages}`);
  if (ageRange) criteria.push(`Age Range: ${ageRange}`);
  if (sex) criteria.push(`Sex: ${sex === 'all' ? 'All' : sex === 'm' ? 'Male' : 'Female'}`);
  if (location) criteria.push(`Location: ${location}`);
  if (lead) criteria.push(`Lead Sponsor: ${lead}`);
  if (healthy) criteria.push(`Healthy Volunteers: ${healthy === 'y' ? 'Yes' : 'No'}`);
  if (studyType) {
    const typeDesc = studyType.split(' ').map(t => STUDY_TYPE_DESCRIPTIONS[t] || t).join(', ');
    criteria.push(`Study Type: ${typeDesc}`);
  }
  if (funderType) {
    // Handle both OR syntax and legacy space-separated format
    const parts = funderType.includes(' OR ') ? funderType.split(' OR ') : funderType.split(' ');
    const funderDesc = parts.map(f => FUNDER_TYPE_DESCRIPTIONS[f] || f).join(', ');
    criteria.push(`Funding: ${funderDesc}`);
  }
  if (results) criteria.push(`Results Available: ${results}`);
  if (docs) {
    const docsDesc = docs.split(' ').map(d => DOCUMENT_DESCRIPTIONS[d] || d).join(', ');
    criteria.push(`Documents: ${docsDesc}`);
  }
  if (violation) criteria.push(`FDA Violations: ${violation === 'y' ? 'Tracked' : 'No'}`);
  if (allocation) {
    const allocationDesc = allocation.split(' ').map(a => ALLOCATION_DESCRIPTIONS[a] || a).join(', ');
    criteria.push(`Allocation: ${allocationDesc}`);
  }
  if (masking) {
    const maskingDesc = masking.split(' ').map(m => MASKING_DESCRIPTIONS[m] || m).join(', ');
    criteria.push(`Masking: ${maskingDesc}`);
  }
  if (assignment) {
    const assignmentDesc = assignment.split(' ').map(a => ASSIGNMENT_DESCRIPTIONS[a] || a).join(', ');
    criteria.push(`Assignment: ${assignmentDesc}`);
  }
  if (purpose) {
    const purposeDesc = purpose.split(' ').map(p => PURPOSE_DESCRIPTIONS[p] || p).join(', ');
    criteria.push(`Purpose: ${purposeDesc}`);
  }
  if (model) {
    const modelDesc = model.split(' ').map(m => MODEL_DESCRIPTIONS[m] || m).join(', ');
    criteria.push(`Model: ${modelDesc}`);
  }
  if (interventionType) {
    const typeDesc = interventionType.split(' ').map(t => INTERVENTION_TYPE_DESCRIPTIONS[t] || t).join(', ');
    criteria.push(`Intervention Type: ${typeDesc}`);
  }
  if (timePerspective) {
    const perspectiveDesc = timePerspective.split(' ').map(t => TIME_PERSPECTIVE_DESCRIPTIONS[t] || t).join(', ');
    criteria.push(`Time Perspective: ${perspectiveDesc}`);
  }
  if (whoMasked) {
    const maskedDesc = whoMasked.split(' ').map(w => WHO_MASKED_DESCRIPTIONS[w] || w).join(', ');
    criteria.push(`Who Masked: ${maskedDesc}`);
  }
  if (start) criteria.push(`Start Date: ${start}`);
  if (primComp) criteria.push(`Primary Completion: ${primComp}`);
  if (firstPost) criteria.push(`First Posted: ${firstPost}`);
  if (resFirstPost) criteria.push(`Results Posted: ${resFirstPost}`);
  if (lastUpdPost) criteria.push(`Last Updated: ${lastUpdPost}`);
  if (studyComp) criteria.push(`Study Completion: ${studyComp}`);
  if (sort) criteria.push(`Sort: ${sort.replace('@', '')}`);
  
  if (criteria.length > 0) {
    result += `**Search Criteria:** ${criteria.join(', ')}\n`;
  }
  
  result += `**Total Results:** ${data.total.toLocaleString()}\n`;
  result += `**Showing:** ${Math.min(data.hits.length, limit || 10)} of ${data.total.toLocaleString()} results\n\n`;
  
  if (data.hits.length === 0) {
    result += '## No Studies Found\n\nNo clinical trials match your search criteria. Try:\n';
    result += '- Using broader search terms\n';
    result += '- Removing some filters\n';
    result += '- Checking spelling of medical conditions\n';
    return result;
  }
  
  result += '## Studies Found\n\n';
  
  data.hits.forEach((hit, index) => {
    const study = hit.study.protocolSection;
    const title = study.identificationModule.briefTitle;
    const status = study.statusModule.overallStatus;
    const date = study.statusModule.studyFirstSubmitDate;
    const nctId = hit.id;
    
    result += `### ${index + 1}. ${title}\n`;
    result += `- **NCT ID:** [${nctId}](https://clinicaltrials.gov/study/${nctId})\n`;
    result += `- **Status:** ${status}\n`;
    result += `- **First Posted:** ${date}\n\n`;
  });
  
  result += `---\n\n`;
  result += `**Note:** This search was conducted using ClinicalTrials.gov API. For complete study details, eligibility criteria, and contact information, please visit the individual study pages using the NCT ID links above.\n\n`;
  
  if (status && ['ava', 'nla', 'tna', 'afm'].some(code => status.includes(code))) {
    result += `**Expanded Access Information:** Some results may include expanded access programs (compassionate use) - treatments available outside of clinical trials for patients with serious conditions who cannot participate in trials.\n`;
  }

  if (healthy === 'y') {
    result += `**Healthy Volunteers:** These studies accept healthy volunteers who do not have the condition being studied but can help researchers learn more about how the body works.\n`;
  }

  if (docs) {
    const docDescriptions: { [key: string]: string } = {
      'prot': 'Protocol documents provide detailed study procedures and methodology',
      'sap': 'Statistical Analysis Plans outline how study data will be analyzed',
      'icf': 'Informed Consent Forms show what participants are told about the study'
    };
    
    const docTypes = docs.split(' ');
    const descriptions = docTypes.map(doc => docDescriptions[doc]).filter(Boolean);
    if (descriptions.length > 0) {
      result += `**Document Information:** ${descriptions.join('. ')}.\n`;
    }
  }

  if (violation === 'y') {
    result += `**FDA Compliance:** Results include studies with reported FDA violations or compliance issues. Review study details carefully.\n`;
  }

  if (studyType) {
    const studyTypeDescriptions: { [key: string]: string } = {
      'int': 'Interventional studies test new treatments, drugs, or medical devices',
      'obs': 'Observational studies observe participants without providing treatment',
      'obs_patreg': 'Patient registry studies collect data about participants over time',
      'exp': 'Expanded access studies provide experimental treatments to patients with serious conditions',
      'exp_indiv': 'Individual patient expanded access programs',
      'exp_inter': 'Intermediate-size expanded access programs',
      'exp_treat': 'Treatment expanded access programs'
    };
    
    const description = studyTypeDescriptions[studyType];
    if (description) {
      result += `**Study Type Information:** ${description}.\n`;
    }
  }

  if (start || primComp || firstPost || resFirstPost || lastUpdPost || studyComp) {
    result += `**Temporal Filtering:** `;
    const dateInfo: string[] = [];
    if (start) {
      const [startDate, endDate] = start.split('_');
      dateInfo.push(`Studies starting between ${startDate} and ${endDate}`);
    }
    if (primComp) {
      const [startDate, endDate] = primComp.split('_');
      dateInfo.push(`Primary completion between ${startDate} and ${endDate}`);
    }
    if (firstPost) {
      const [startDate, endDate] = firstPost.split('_');
      dateInfo.push(`First posted between ${startDate} and ${endDate}`);
    }
    if (resFirstPost) {
      const [startDate, endDate] = resFirstPost.split('_');
      dateInfo.push(`Results first posted between ${startDate} and ${endDate}`);
    }
    if (lastUpdPost) {
      const [startDate, endDate] = lastUpdPost.split('_');
      dateInfo.push(`Last updated between ${startDate} and ${endDate}`);
    }
    if (studyComp) {
      const parts = studyComp.split('_');
      if (parts[1] === '' || parts[1] === undefined) {
        dateInfo.push(`Study completion on or after ${parts[0]}`);
      } else {
        dateInfo.push(`Study completion between ${parts[0]} and ${parts[1]}`);
      }
    }
    result += `${dateInfo.join('. ')}.\n`;
  }
  
  return result;
} 