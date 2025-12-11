import { ToolRegistry } from '../types.js';
import { definition as ctGovUnifiedDefinition, handler as ctGovUnifiedHandler } from './ct-gov-unified-tool.js';

// Add your tools here
export const toolRegistry: ToolRegistry = {
  'ct_gov_studies': {
    definition: ctGovUnifiedDefinition,
    handler: ctGovUnifiedHandler
  }
  // Add more tools like:
  // [anotherTool.definition.name]: {
  //   definition: anotherTool.definition,
  //   handler: anotherTool.handler
  // }
};

export function getToolDefinitions() {
  return Object.values(toolRegistry).map(tool => tool.definition);
}

export function getToolHandler(toolName: string) {
  return toolRegistry[toolName]?.handler;
} 