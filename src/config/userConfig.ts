/**
 * User Configuration for PineScript MCP Server
 * 
 * This file provides options to customize the behavior of the PineScript MCP server.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Define the configuration interface
export interface PineScriptConfig {
  // Template Configuration
  templates: {
    defaultVersion: number;
    customTemplatesDir: string | null;
  };

  // Validation Configuration
  validation: {
    strictMode: boolean;
    warningsAsErrors: boolean;
    ignoreWarnings: string[];
  };

  // Error Fixing Configuration
  errorFixer: {
    autoFixEnabled: boolean;
    maxAutoFixes: number;
    preventDestructiveChanges: boolean;
  };

  // Version Management
  versionManagement: {
    historyLimit: number;
    storageDirectory: string;
  };

  // Output Configuration
  output: {
    verboseMode: boolean;
    includeLineNumbers: boolean;
    colorized: boolean;
  };

  // LLM Configuration
  llm?: {
    defaultProvider?: 'openai' | 'anthropic' | 'mock';
    openai?: {
      apiKey?: string;
      defaultModel?: string;
      models?: {
        [key: string]: {
          enabled: boolean;
          maxTokens?: number;
          temperature?: number;
        }
      }
    };
    anthropic?: {
      apiKey?: string;
      defaultModel?: string;
      models?: {
        [key: string]: {
          enabled: boolean;
          maxTokens?: number;
          temperature?: number;
        }
      }
    };
    mock?: {
      enabled: boolean;
    };
    maxRetries?: number;
    timeout?: number;
    promptTemplates?: Record<string, string>;
  };

  // Database Configuration
  databases?: {
    supabase?: {
      url?: string;
      apiKey?: string;
      enabled?: boolean;
      tables?: {
        templates?: string;
        templateVersions?: string;
        templateUsage?: string;
        analytics?: string;
      };
      vectorConfig?: {
        table?: string;
        embeddingColumn?: string;
        matchThreshold?: number;
        maxResults?: number;
        defaultModel?: string;
      };
    };
    neondb?: {
      url?: string;
      apiKey?: string;
      enabled?: boolean;
      schemas?: {
        templates?: string;
        vectors?: string;
        analytics?: string;
      };
    };
  };

  // Analytics Configuration
  analytics?: {
    enabled: boolean;
    trackTemplateUsage: boolean;
    trackProviderUsage: boolean;
    anonymizeData: boolean;
  };
}

// Default configuration values
const defaultConfig: PineScriptConfig = {
  templates: {
    defaultVersion: 5,
    customTemplatesDir: null,
  },
  validation: {
    strictMode: false,
    warningsAsErrors: false,
    ignoreWarnings: [],
  },
  errorFixer: {
    autoFixEnabled: true,
    maxAutoFixes: 5,
    preventDestructiveChanges: true,
  },
  versionManagement: {
    historyLimit: 10,
    storageDirectory: path.join(os.homedir(), '.pinescript-mcp', 'versions'),
  },
  output: {
    verboseMode: false,
    includeLineNumbers: true,
    colorized: true,
  },
  llm: {
    defaultProvider: 'openai',
    openai: {
      defaultModel: 'gpt-4-turbo',
      models: {
        'gpt-4-turbo': {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        },
        'gpt-3.5-turbo': {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        }
      }
    },
    anthropic: {
      defaultModel: 'claude-3-sonnet-20240229',
      models: {
        'claude-3-opus-20240229': {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        },
        'claude-3-sonnet-20240229': {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        },
        'claude-3-haiku-20240307': {
          enabled: true,
          maxTokens: 2048,
          temperature: 0.7
        }
      }
    },
    mock: {
      enabled: true
    },
    maxRetries: 3,
    timeout: 60000,
    promptTemplates: {
      strategyAnalysis: `You are an expert Pine Script analyst. Review this trading strategy code and provide detailed analysis:

Strategy Code:
{{strategy}}

Your analysis should include:
1. Identification of parameters and how they affect the strategy
2. Assessment of the trading logic
3. Risk management evaluation
4. Performance considerations

Format your response as JSON with these sections:
- parameters (identified parameters, suggestions for improvement)
- logic (strengths, weaknesses, improvement suggestions)
- risk (overall assessment, specific recommendations)
- performance (bottlenecks, optimization suggestions)`,

      backtestAnalysis: `You are an expert financial analyst. Analyze these backtest results for a trading strategy:

Backtest Results:
{{results}}

Strategy Code:
{{strategy}}

Focus on:
1. Overall performance assessment
2. Key performance metrics evaluation
3. Identifying strengths and weaknesses
4. Suggesting parameter optimizations

Format your response as JSON with:
- overall (assessment, score out of 10)
- metrics (analysis of key metrics)
- strengths (list of strong points)
- concerns (list of issues)
- suggestions (list of improvement ideas)
- parameterAdjustments (list of specific parameter changes with rationale)`,

      enhancementGeneration: `You are an expert Pine Script developer. Generate {{count}} enhanced versions of this trading strategy:

{{strategy}}

Focus on different improvements for each version:
1. Better risk management
2. More precise entry/exit conditions
3. Addressing weaknesses in the original
4. Adding complementary indicators
5. Include comprehensive comments`
    }
  },
  databases: {
    supabase: {
      enabled: false,
      tables: {
        templates: 'templates',
        templateVersions: 'template_versions',
        templateUsage: 'template_usage',
        analytics: 'analytics'
      },
      vectorConfig: {
        table: 'template_embeddings',
        embeddingColumn: 'embedding',
        matchThreshold: 0.75,
        maxResults: 10,
        defaultModel: 'text-embedding-3-small'
      }
    },
    neondb: {
      enabled: false,
      schemas: {
        templates: 'templates',
        vectors: 'vectors',
        analytics: 'analytics'
      }
    }
  },
  analytics: {
    enabled: false,
    trackTemplateUsage: true,
    trackProviderUsage: true,
    anonymizeData: true
  }
};

// Get config file path
const getConfigPath = (): string => {
  const configDir = path.join(os.homedir(), '.pinescript-mcp');
  return path.join(configDir, 'config.json');
};

// Create default config file if it doesn't exist
const ensureConfigExists = (): void => {
  const configDir = path.join(os.homedir(), '.pinescript-mcp');
  const configPath = getConfigPath();

  // Create config directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Create version storage directory
  if (!fs.existsSync(defaultConfig.versionManagement.storageDirectory)) {
    fs.mkdirSync(defaultConfig.versionManagement.storageDirectory, { recursive: true });
  }

  // Create default config file if it doesn't exist
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
};

// Load user configuration
export const loadUserConfig = (): PineScriptConfig => {
  ensureConfigExists();
  const configPath = getConfigPath();

  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // Merge with default config to ensure new properties are included
    return { ...defaultConfig, ...userConfig };
  } catch (error) {
    console.warn(`Error loading user config: ${error}. Using default config.`);
    return defaultConfig;
  }
};

// Save user configuration
export const saveUserConfig = (config: Partial<PineScriptConfig>): PineScriptConfig => {
  ensureConfigExists();
  const configPath = getConfigPath();
  
  try {
    // Read existing config
    const existingConfig = loadUserConfig();
    
    // Create a deep merge of the configs
    const newConfig = deepMerge(existingConfig, config);
    
    // Save the merged config
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch (error) {
    console.error(`Failed to save user config: ${error}`);
    return loadUserConfig(); // Return current config on error
  }
};

// Reset configuration to defaults
export const resetConfig = (): PineScriptConfig => {
  ensureConfigExists();
  const configPath = getConfigPath();
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  } catch (error) {
    console.error(`Failed to reset user config: ${error}`);
    return loadUserConfig();
  }
};

// Helper function for deep merging objects
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof Partial<T>;
      const targetKey = key as keyof T;
      
      if (isObject(source[sourceKey]) && source[sourceKey] !== null) {
        if (!(key in target)) {
          output[targetKey] = source[sourceKey] as T[keyof T];
        } else {
          output[targetKey] = deepMerge(
            target[targetKey] as Record<string, any>,
            source[sourceKey] as Record<string, any>
          ) as T[keyof T];
        }
      } else {
        output[targetKey] = source[sourceKey] as T[keyof T];
      }
    });
  }
  
  return output;
}

// Helper function to check if value is an object
function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Update the LLM configuration
 */
export function configureLLM(options: {
  provider?: 'openai' | 'anthropic' | 'mock';
  openaiKey?: string;
  openaiModel?: string;
  anthropicKey?: string;
  anthropicModel?: string;
}) {
  try {
    let currentConfig = loadUserConfig() || {};
    
    // Initialize LLM config if not present
    if (!currentConfig.llm) {
      currentConfig.llm = {};
    }
    
    // Update default provider if specified
    if (options.provider) {
      currentConfig.llm.defaultProvider = options.provider;
    }
    
    // Update OpenAI settings if provided
    if (options.openaiKey || options.openaiModel) {
      if (!currentConfig.llm.openai) {
        currentConfig.llm.openai = {};
      }
      
      if (options.openaiKey) {
        currentConfig.llm.openai.apiKey = options.openaiKey;
      }
      
      if (options.openaiModel) {
        currentConfig.llm.openai.defaultModel = options.openaiModel;
      }
    }
    
    // Update Anthropic settings if provided
    if (options.anthropicKey || options.anthropicModel) {
      if (!currentConfig.llm.anthropic) {
        currentConfig.llm.anthropic = {
          models: {
            'claude-3-opus-20240229': { enabled: true, maxTokens: 4000, temperature: 0.7 },
            'claude-3-sonnet-20240229': { enabled: true, maxTokens: 4000, temperature: 0.7 },
            'claude-3-haiku-20240307': { enabled: true, maxTokens: 2000, temperature: 0.7 }
          }
        };
      }
      
      if (options.anthropicKey) {
        currentConfig.llm.anthropic.apiKey = options.anthropicKey;
      }
      
      if (options.anthropicModel) {
        currentConfig.llm.anthropic.defaultModel = options.anthropicModel;
      }
    }
    
    // Save updated config
    saveUserConfig(currentConfig);
    
    // Reload config in a way that doesn't reassign the constant
    Object.assign(config, loadUserConfig());
    
    return true;
  } catch (error) {
    console.error('Error configuring LLM:', error);
    return false;
  }
}

// Export configuration
export const config = loadUserConfig(); 