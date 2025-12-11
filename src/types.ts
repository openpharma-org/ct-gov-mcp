export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  responseSchema?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  examples?: Array<{
    description: string;
    usage: any;
    response?: any;
  }>;
}

export interface ToolHandler {
  (_args: any): Promise<any>;
}

export interface ToolRegistry {
  [toolName: string]: {
    definition: ToolDefinition;
    handler: ToolHandler;
  };
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface ServerConfig {
  name: string;
  version: string;
  nodeEnv: string;
  logLevel: string;
  useHttp: boolean;
  useSse: boolean;
  port: number;
  ssePath: string;
  corsOrigins: string[];
  enablePerformanceMonitoring: boolean;
  enableExperimentalFeatures: boolean;
} 