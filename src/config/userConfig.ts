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
    };
    anthropic?: {
      apiKey?: string;
      defaultModel?: string;
      // Available models: claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307
      modelOptions?: {
        opus?: {
          enabled: boolean;
          maxTokens?: number;
          temperature?: number;
        };
        sonnet?: {
          enabled: boolean;
          maxTokens?: number;
          temperature?: number;
        };
        haiku?: {
          enabled: boolean;
          maxTokens?: number;
          temperature?: number;
        };
      };
    };
    promptTemplates?: {
      strategyAnalysis?: string;
      backtestAnalysis?: string;
      enhancementGeneration?: string;
    };
    timeout?: number;
    maxRetries?: number;
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
    defaultProvider: 'mock', // Start with mock provider by default
    timeout: 60000, // Default 60 second timeout
    maxRetries: 3,
    promptTemplates: {
      strategyAnalysis: `Analyze this PineScript strategy and identify:
1. Key parameters that could be optimized
2. Logical weaknesses in entry/exit conditions
3. Missing risk management components
4. Opportunities for performance improvement

Strategy:
{{strategy}}`,
      backtestAnalysis: `Analyze these backtest results for the given strategy:

Strategy:
{{strategy}}

Backtest Results:
{{results}}

Please provide:
1. Overall assessment and score out of 10
2. Analysis of key metrics
3. Notable strengths
4. Concerns about the strategy
5. Suggestions for improvement
6. Parameter adjustment recommendations`,
      enhancementGeneration: `Generate {{count}} enhanced versions of this PineScript strategy:

{{strategy}}

For each enhancement:
1. Preserve the core logic
2. Improve entry/exit conditions
3. Add better risk management
4. Optimize for performance
5. Include comprehensive comments`,
    },
    anthropic: {
      defaultModel: 'claude-3-sonnet-20240229',
      modelOptions: {
        opus: {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        },
        sonnet: {
          enabled: true,
          maxTokens: 4096,
          temperature: 0.7
        },
        haiku: {
          enabled: true,
          maxTokens: 2048,
          temperature: 0.7
        }
      }
    }
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
          modelOptions: {
            opus: { enabled: true, maxTokens: 4000, temperature: 0.7 },
            sonnet: { enabled: true, maxTokens: 4000, temperature: 0.7 },
            haiku: { enabled: true, maxTokens: 2000, temperature: 0.7 }
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
    console.error('Error updating LLM configuration:', error);
    return false;
  }
}

// Export configuration
export const config = loadUserConfig(); 