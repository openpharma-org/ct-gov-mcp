import { ToolDefinition, ToolHandler } from '../types.js';

interface StudyParams {
  nctId: string;
  format?: 'json' | 'csv' | 'json.zip' | 'fhir.json' | 'ris';
  markupFormat?: 'markdown' | 'legacy';
  fields?: string[];
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

export const definition: ToolDefinition = {
  name: 'ct_gov_get_study',
  description: 'Retrieve detailed information for a single clinical trial by NCT ID from ClinicalTrials.gov. Returns comprehensive study data including protocol details, design, outcomes, eligibility criteria, locations, and contact information.',
  inputSchema: {
    type: 'object',
    properties: {
      nctId: {
        type: 'string',
        description: 'NCT Number of the study (e.g., NCT00841061, NCT04000165)',
        pattern: '^[Nn][Cc][Tt]0*[1-9]\\d{0,7}$'
      },
      format: {
        type: 'string',
        description: 'Response format',
        enum: ['json', 'csv', 'json.zip', 'fhir.json', 'ris'],
        default: 'json'
      },
      markupFormat: {
        type: 'string',
        description: 'Format of markup fields (applies to json format only)',
        enum: ['markdown', 'legacy'],
        default: 'markdown'
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific fields to return (if unspecified, all fields returned). Examples: ["NCTId", "BriefTitle", "Reference"] or ["ConditionsModule", "EligibilityModule"]',
        minItems: 1
      }
    },
    required: ['nctId']
  },
  examples: [
    {
      description: "Get complete study information",
      usage: { 
        "nctId": "NCT00841061" 
      },
      response: "# Clinical Trial Details: NCT00841061\n\n**Study Title:** Cereals as a Source of Iron for Breastfed Infants\n**Status:** COMPLETED\n**Study Type:** INTERVENTIONAL\n**Phase:** NA\n\n## Study Overview\n\n**Lead Sponsor:** National Institutes of Health (NIH)\n**Study Start:** July 2003\n**Primary Completion:** May 2006 (ACTUAL)\n\n## Study Design\n- **Allocation:** Randomized\n- **Intervention Model:** Parallel\n- **Primary Purpose:** Prevention\n- **Masking:** Quadruple (Participant, Care Provider, Investigator, Outcomes Assessor)\n- **Enrollment:** 111 participants (ACTUAL)\n\n## Conditions\n- Iron Deficiency\n\n## Primary Outcomes\n- **Measure:** plasma ferritin\n- **Time Frame:** 280 days\n\n## Locations\n- **Facility:** University of Iowa, Iowa City, Iowa, United States\n\n**ClinicalTrials.gov Link:** [NCT00841061](https://clinicaltrials.gov/study/NCT00841061)"
    },
    {
      description: "Get specific fields only",
      usage: { 
        "nctId": "NCT04000165",
        "fields": ["BriefTitle", "ConditionsModule", "StatusModule"]
      },
      response: "# Clinical Trial Details: NCT04000165\n\n**Study Title:** [Brief Title from API]\n**Status:** [Status from API]\n\n## Conditions\n[Conditions from API]\n\n**ClinicalTrials.gov Link:** [NCT04000165](https://clinicaltrials.gov/study/NCT04000165)"
    }
  ]
};

export const handler: ToolHandler = async (args: any): Promise<string> => {
  const { nctId, format = 'json', markupFormat = 'markdown', fields } = args as StudyParams;

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
};

/**
 * Format study details into a comprehensive markdown report
 */
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
  const references = protocol.referencesModule;
  const oversight = protocol.oversightModule;
  const derived = data.derivedSection;

  let result = `# Clinical Trial Details: ${identification.nctId}\n\n`;

  // Basic Information
  result += `**Study Title:** ${identification.briefTitle}\n`;
  if (identification.officialTitle && identification.officialTitle !== identification.briefTitle) {
    result += `**Official Title:** ${identification.officialTitle}\n`;
  }
  if (identification.acronym) {
    result += `**Acronym:** ${identification.acronym}\n`;
  }
  result += `**Status:** ${status.overallStatus}\n`;
  if (status.whyStopped) {
    result += `**Why Stopped:** ${status.whyStopped}\n`;
  }
  if (status.statusVerifiedDate) {
    result += `**Status Verified:** ${formatDate(status.statusVerifiedDate)}\n`;
  }
  if (design?.studyType) {
    result += `**Study Type:** ${design.studyType}\n`;
  }
  if (design?.phases && design.phases.length > 0) {
    result += `**Phase:** ${design.phases.join(', ')}\n`;
  }

  // Study Overview
  result += `\n## Study Overview\n\n`;
  if (sponsor?.leadSponsor) {
    result += `**Lead Sponsor:** ${sponsor.leadSponsor.name} (${sponsor.leadSponsor.class})\n`;
  }
  if (sponsor?.collaborators && sponsor.collaborators.length > 0) {
    result += `**Collaborators:** ${sponsor.collaborators.map(c => `${c.name} (${c.class})`).join(', ')}\n`;
  }
  if (status.startDateStruct) {
    result += `**Study Start:** ${formatDate(status.startDateStruct.date)}${status.startDateStruct.type ? ` (${status.startDateStruct.type})` : ''}\n`;
  }
  if (status.primaryCompletionDateStruct) {
    result += `**Primary Completion:** ${formatDate(status.primaryCompletionDateStruct.date)}${status.primaryCompletionDateStruct.type ? ` (${status.primaryCompletionDateStruct.type})` : ''}\n`;
  }
  if (status.completionDateStruct) {
    result += `**Study Completion:** ${formatDate(status.completionDateStruct.date)}${status.completionDateStruct.type ? ` (${status.completionDateStruct.type})` : ''}\n`;
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
      result += `**Oversight:** ${oversightItems.join(', ')}\n`;
    }
  }

  // Study Design
  if (design?.designInfo || design?.enrollmentInfo) {
    result += `\n## Study Design\n`;
    if (design.designInfo?.allocation) {
      result += `- **Allocation:** ${formatEnumValue(design.designInfo.allocation)}\n`;
    }
    if (design.designInfo?.interventionModel) {
      result += `- **Intervention Model:** ${formatEnumValue(design.designInfo.interventionModel)}\n`;
    }
    if (design.designInfo?.primaryPurpose) {
      result += `- **Primary Purpose:** ${formatEnumValue(design.designInfo.primaryPurpose)}\n`;
    }
    if (design.designInfo?.maskingInfo?.masking) {
      let maskingText = formatEnumValue(design.designInfo.maskingInfo.masking);
      if (design.designInfo.maskingInfo.whoMasked && design.designInfo.maskingInfo.whoMasked.length > 0) {
        const whoMasked = design.designInfo.maskingInfo.whoMasked.map(w => formatEnumValue(w)).join(', ');
        maskingText += ` (${whoMasked})`;
      }
      result += `- **Masking:** ${maskingText}\n`;
    }
    if (design.enrollmentInfo) {
      result += `- **Enrollment:** ${design.enrollmentInfo.count} participants${design.enrollmentInfo.type ? ` (${design.enrollmentInfo.type})` : ''}\n`;
    }
  }

  // Brief Summary
  if (description?.briefSummary) {
    result += `\n## Summary\n\n${description.briefSummary}\n`;
  }

  // Detailed Description
  if (description?.detailedDescription) {
    result += `\n## Detailed Description\n\n${description.detailedDescription}\n`;
  }

  // Conditions
  if (conditions?.conditions && conditions.conditions.length > 0) {
    result += `\n## Conditions\n`;
    conditions.conditions.forEach(condition => {
      result += `- ${condition}\n`;
    });
  }

  // Keywords
  if (conditions?.keywords && conditions.keywords.length > 0) {
    result += `\n## Keywords\n`;
    conditions.keywords.forEach(keyword => {
      result += `- ${keyword}\n`;
    });
  }

  // MeSH Terms (Medical Subject Headings)
  if (derived?.conditionBrowseModule?.meshes && derived.conditionBrowseModule.meshes.length > 0) {
    result += `\n## MeSH Terms (Conditions)\n`;
    derived.conditionBrowseModule.meshes.forEach(mesh => {
      result += `- ${mesh.term} (${mesh.id})\n`;
    });
  }

  if (derived?.interventionBrowseModule?.meshes && derived.interventionBrowseModule.meshes.length > 0) {
    result += `\n## MeSH Terms (Interventions)\n`;
    derived.interventionBrowseModule.meshes.forEach(mesh => {
      result += `- ${mesh.term} (${mesh.id})\n`;
    });
  }

  // Arms and Interventions
  if (arms?.armGroups && arms.armGroups.length > 0) {
    result += `\n## Study Arms\n`;
    arms.armGroups.forEach((arm, index) => {
      result += `\n### ${index + 1}. ${arm.label} (${formatEnumValue(arm.type)})\n`;
      if (arm.description) {
        result += `${arm.description}\n`;
      }
      if (arm.interventionNames && arm.interventionNames.length > 0) {
        result += `**Interventions:** ${arm.interventionNames.join(', ')}\n`;
      }
    });
  }

  if (arms?.interventions && arms.interventions.length > 0) {
    result += `\n## Interventions\n`;
    arms.interventions.forEach((intervention, index) => {
      result += `\n### ${index + 1}. ${intervention.name} (${formatEnumValue(intervention.type)})\n`;
      if (intervention.description) {
        result += `${intervention.description}\n`;
      }
      if (intervention.armGroupLabels && intervention.armGroupLabels.length > 0) {
        result += `**Assigned to:** ${intervention.armGroupLabels.join(', ')}\n`;
      }
    });
  }

  // Outcomes
  if (outcomes?.primaryOutcomes && outcomes.primaryOutcomes.length > 0) {
    result += `\n## Primary Outcomes\n`;
    outcomes.primaryOutcomes.forEach((outcome, index) => {
      result += `\n### ${index + 1}. ${outcome.measure}\n`;
      if (outcome.description) {
        result += `${outcome.description}\n`;
      }
      if (outcome.timeFrame) {
        result += `**Time Frame:** ${outcome.timeFrame}\n`;
      }
    });
  }

  if (outcomes?.secondaryOutcomes && outcomes.secondaryOutcomes.length > 0) {
    result += `\n## Secondary Outcomes\n`;
    outcomes.secondaryOutcomes.forEach((outcome, index) => {
      result += `\n### ${index + 1}. ${outcome.measure}\n`;
      if (outcome.description) {
        result += `${outcome.description}\n`;
      }
      if (outcome.timeFrame) {
        result += `**Time Frame:** ${outcome.timeFrame}\n`;
      }
    });
  }

  // Eligibility
  if (eligibility) {
    result += `\n## Eligibility Criteria\n\n`;
    if (eligibility.eligibilityCriteria) {
      result += `${eligibility.eligibilityCriteria}\n\n`;
    }
    if (eligibility.sex) {
      result += `**Sex:** ${formatEnumValue(eligibility.sex)}\n`;
    }
    if (eligibility.minimumAge || eligibility.maximumAge) {
      result += `**Age Range:** `;
      if (eligibility.minimumAge) result += `${eligibility.minimumAge}`;
      if (eligibility.minimumAge && eligibility.maximumAge) result += ` to `;
      if (eligibility.maximumAge) result += `${eligibility.maximumAge}`;
      result += `\n`;
    }
    if (eligibility.stdAges && eligibility.stdAges.length > 0) {
      result += `**Age Groups:** ${eligibility.stdAges.map(age => formatEnumValue(age)).join(', ')}\n`;
    }
    if (eligibility.healthyVolunteers !== undefined) {
      result += `**Healthy Volunteers:** ${eligibility.healthyVolunteers ? 'Yes' : 'No'}\n`;
    }
  }

  // Study Officials
  if (contacts?.overallOfficials && contacts.overallOfficials.length > 0) {
    result += `\n## Study Officials\n`;
    contacts.overallOfficials.forEach(official => {
      result += `- **${official.name}** (${formatEnumValue(official.role)})`;
      if (official.affiliation) {
        result += ` - ${official.affiliation}`;
      }
      result += `\n`;
    });
  }

  // Locations
  if (contacts?.locations && contacts.locations.length > 0) {
    result += `\n## Locations\n`;
    contacts.locations.forEach(location => {
      result += `- **Facility:** ${location.facility}`;
      const locationParts = [];
      if (location.city) locationParts.push(location.city);
      if (location.state) locationParts.push(location.state);
      if (location.country) locationParts.push(location.country);
      if (locationParts.length > 0) {
        result += `, ${locationParts.join(', ')}`;
      }
      if (location.status) {
        result += ` (${formatEnumValue(location.status)})`;
      }
      result += `\n`;
    });
  }

  // References
  if (references?.references && references.references.length > 0) {
    result += `\n## References\n`;
    references.references.forEach(ref => {
      result += `- **${formatEnumValue(ref.type)}:** ${ref.citation}`;
      if (ref.pmid) {
        result += ` [PMID: ${ref.pmid}](https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/)`;
      }
      result += `\n`;
    });
  }

  // Results availability
  if (data.hasResults) {
    result += `\n## Results\n\n✅ **Study results are available**\n`;
  } else {
    result += `\n## Results\n\nℹ️ **No results posted yet**\n`;
  }

  // Expanded Access
  if (status.expandedAccessInfo?.hasExpandedAccess) {
    result += `\n## Expanded Access\n\n✅ **Expanded access available**\n`;
  }

  // Footer with link
  result += `\n---\n\n**ClinicalTrials.gov Link:** [${identification.nctId}](https://clinicaltrials.gov/study/${identification.nctId})`;

  return result;
}

/**
 * Format enum values to be more human-readable
 */
function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format dates to be more readable
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr; // Return original if parsing fails
  }
}