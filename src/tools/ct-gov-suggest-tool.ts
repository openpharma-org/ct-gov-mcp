import { ToolDefinition, ToolHandler } from '../types.js';

export interface CtGovSuggestArgs {
  input: string;
  dictionary: 'Condition' | 'InterventionName' | 'LeadSponsorName' | 'LocationFacility';
}

export const definition: ToolDefinition = {
  name: 'ct_gov_suggest',
  description: 'Get term suggestions from ClinicalTrials.gov dictionaries. Useful for finding proper terminology, condition names, intervention names, sponsor names, and facility locations.',
  inputSchema: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'The text input to search for suggestions (minimum 2 characters)',
        minLength: 2
      },
      dictionary: {
        type: 'string',
        enum: ['Condition', 'InterventionName', 'LeadSponsorName', 'LocationFacility'],
        description: 'The dictionary to search in:\n- Condition: Medical conditions and diseases\n- InterventionName: Treatments, drugs, and interventions\n- LeadSponsorName: Organizations and companies\n- LocationFacility: Medical facilities and institutions'
      }
    },
    required: ['input', 'dictionary']
  },
  examples: [
    {
      description: "Get condition suggestions for 'ov'",
      usage: { 
        "input": "ov", 
        "dictionary": "Condition" 
      },
      response: "# ClinicalTrials.gov Suggestions\n\n**Dictionary:** Medical Conditions\n**Search Input:** \"ov\"\n**Results:** 5 suggestions found\n\n## Suggested Terms\n\n1. **Ovarian Cancer**\n2. **Overweight**\n3. **Overweight and Obesity**..."
    }
  ]
};

export const handler: ToolHandler = async (args: any) => {
  const { input, dictionary } = args as CtGovSuggestArgs;

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

    // Format the response as markdown
    const dictionaryLabels = {
      'Condition': 'Medical Conditions',
      'InterventionName': 'Interventions & Treatments',
      'LeadSponsorName': 'Lead Sponsors',
      'LocationFacility': 'Medical Facilities'
    };

    let content = `# ClinicalTrials.gov Suggestions\n\n`;
    content += `**Dictionary:** ${dictionaryLabels[dictionary]}\n`;
    content += `**Search Input:** "${input}"\n`;
    content += `**Results:** ${suggestions.length} suggestions found\n\n`;

    if (suggestions.length === 0) {
      content += `No suggestions found for "${input}" in ${dictionaryLabels[dictionary]} dictionary.\n\n`;
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
      content += `💡 **Tip:** You can use these suggested terms in the \`ct_gov_search_studies\` tool for more accurate clinical trial searches.\n\n`;
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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return `# Error: ClinicalTrials.gov Suggest API\n\n❌ **Failed to get suggestions**\n\n**Error:** ${errorMessage}\n\n**Request Details:**\n- Input: "${input}"\n- Dictionary: ${dictionary}\n- API URL: https://clinicaltrials.gov/api/int/suggest\n\nPlease try again or check if the ClinicalTrials.gov API is accessible.`;
  }
}; 