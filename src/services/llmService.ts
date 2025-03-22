/**
 * LLM Service for PineScript MCP
 * 
 * This service handles interactions with language models for strategy analysis,
 * backtest interpretation, and strategy enhancement generation.
 */

import { config } from '../config/userConfig.js';
import { OpenAIProvider } from './openaiProvider.js';
import { AnthropicProvider } from './anthropicProvider.js';
import { templateManager } from '../prompts/templateManager.js';

// Types for LLM responses
export interface StrategyAnalysis {
  parameters?: {
    identified?: string[];
    suggestions?: string[];
  };
  logic?: {
    strengths?: string[];
    weaknesses?: string[];
    improvements?: string[];
  };
  risk?: {
    assessment?: string;
    recommendations?: string[];
  };
  performance?: {
    bottlenecks?: string[];
    optimizations?: string[];
  };
}

export interface BacktestAnalysis {
  overall?: {
    assessment: string;
    score?: number;
  };
  metrics?: Record<string, string>;
  strengths: string[];
  concerns: string[];
  suggestions: string[];
  parameterAdjustments: {
    parameter: string;
    currentValue: string;
    suggestedValue: string;
    rationale: string;
  }[];
}

export interface EnhancedStrategy {
  version: string;
  code: string;
  explanation: string;
  expectedImprovements: string[];
}

// LLM Provider interface
export interface LLMProvider {
  sendPrompt(prompt: string, options?: any): Promise<string>;
  sendJsonPrompt<T>(prompt: string, options?: any): Promise<T>;
}

// Mock provider implementation for testing
class MockLLMProvider implements LLMProvider {
  async sendPrompt(prompt: string): Promise<string> {
    console.log("Using mock LLM provider for text response");
    return "This is a mock response from the LLM provider.";
  }
  
  async sendJsonPrompt<T>(prompt: string): Promise<T> {
    console.log("Using mock LLM provider for JSON response");
    
    if (prompt.includes('strategy') && !prompt.includes('backtest')) {
      return {
        parameters: {
          identified: ["length", "source", "multiplier"],
          suggestions: ["Try different length values", "Experiment with EMA instead of SMA"]
        },
        logic: {
          strengths: ["Clear entry conditions", "Well-defined risk management"],
          weaknesses: ["No consideration for market regime", "Simple exit strategy"],
          improvements: ["Add market regime filter", "Consider trailing stop loss"]
        },
        risk: {
          assessment: "Moderate risk with basic position sizing",
          recommendations: ["Implement dynamic position sizing", "Add correlation analysis"]
        },
        performance: {
          bottlenecks: ["Calculation efficiency could be improved", "Redundant variables"],
          optimizations: ["Use security() for efficiency", "Consolidate calculations"]
        }
      } as unknown as T;
    } else if (prompt.includes('backtest')) {
      return {
        overall: {
          assessment: "Strategy shows potential but has optimization opportunities",
          score: 7.2
        },
        metrics: {
          profitFactor: "Good at 1.8, but could be improved",
          winRate: "Acceptable at 62%, but room for improvement",
          drawdown: "High maximum drawdown of 18% is concerning",
          recoveryFactor: "Below average at 2.1"
        },
        strengths: ["Good win rate", "Positive profit factor"],
        concerns: ["High maximum drawdown", "Long recovery periods"],
        suggestions: ["Implement tighter stop-loss", "Consider profit-taking at resistance levels"],
        parameterAdjustments: [
          {
            parameter: "length",
            currentValue: "14",
            suggestedValue: "21",
            rationale: "Longer period may reduce false signals in current market conditions"
          }
        ]
      } as unknown as T;
    } else {
      // Enhanced strategies
      return [
        {
          version: "Enhanced Version 1",
          code: "// Generated enhanced strategy code\nstrategy('Enhanced Strategy 1')\n// More code here",
          explanation: "This version adds a market regime filter to reduce false signals",
          expectedImprovements: ["Reduced drawdown", "Higher win rate"]
        },
        {
          version: "Enhanced Version 2",
          code: "// Generated enhanced strategy code\nstrategy('Enhanced Strategy 2')\n// More code here",
          explanation: "This version implements adaptive parameters based on volatility",
          expectedImprovements: ["Better performance in changing markets", "Smoother equity curve"]
        }
      ] as unknown as T;
    }
  }
}

// LLM Service factory
export class LLMService {
  private provider: LLMProvider = new MockLLMProvider(); // Initialize with mock as default
  private mockProvider: MockLLMProvider = new MockLLMProvider();
  private retryCount: number;
  private timeout: number;
  private useMockFallback: boolean = false;

  constructor() {
    this.initializeProvider();
    this.retryCount = config.llm?.maxRetries || 3;
    this.timeout = config.llm?.timeout || 60000; // 60 seconds default
  }

  private initializeProvider() {
    const llmConfig = config.llm;
    
    try {
      switch (llmConfig?.defaultProvider) {
        case 'openai':
          console.log("Initializing OpenAI provider");
          try {
            this.provider = new OpenAIProvider();
            console.log("OpenAI provider initialized successfully");
          } catch (error) {
            console.warn("Failed to initialize OpenAI provider:", error);
            console.warn("Falling back to mock provider");
            this.useMockFallback = true;
            this.provider = this.mockProvider;
          }
          break;
          
        case 'anthropic':
          console.log("Initializing Anthropic provider");
          try {
            this.provider = new AnthropicProvider();
            console.log("Anthropic provider initialized successfully");
          } catch (error) {
            console.warn("Failed to initialize Anthropic provider:", error);
            console.warn("Falling back to mock provider");
            this.useMockFallback = true;
            this.provider = this.mockProvider;
          }
          break;
          
        case 'mock':
        default:
          console.log("Using mock LLM provider");
          this.useMockFallback = true;
          this.provider = this.mockProvider;
          break;
      }
    } catch (error) {
      console.error("Error initializing LLM provider:", error);
      console.warn("Falling back to mock provider");
      this.useMockFallback = true;
      this.provider = this.mockProvider;
    }
  }

  /**
   * Get a prompt from the template manager
   */
  private async getPromptFromTemplate(templateId: string, context: Record<string, any>): Promise<string> {
    try {
      // First try to use the template manager
      const startTime = Date.now();
      const prompt = await templateManager.generatePrompt(templateId, context);
      const endTime = Date.now();
      
      if (prompt) {
        // Record template usage if not using mock provider
        if (!this.useMockFallback) {
          const provider = config.llm?.defaultProvider || 'unknown';
          const model = this.getCurrentModel();
          templateManager.recordTemplateUsage(
            templateId, 
            provider, 
            model,
            true, 
            endTime - startTime
          ).catch(err => {
            console.warn('Failed to record template usage:', err);
          });
        }
        
        return prompt;
      }
      
      // Fall back to legacy templates from config
      console.warn(`Template '${templateId}' not found in template manager, falling back to legacy templates`);
      return this.getLegacyPrompt(templateId, context);
    } catch (error) {
      console.warn(`Error generating prompt from template '${templateId}':`, error);
      return this.getLegacyPrompt(templateId, context);
    }
  }

  /**
   * Get a prompt from legacy templates in config
   */
  private getLegacyPrompt(templateId: string, context: Record<string, any>): string {
    const legacyTemplateId = templateId.replace(/-/g, '_');
    const template = config.llm?.promptTemplates?.[legacyTemplateId as keyof typeof config.llm.promptTemplates];
    
    if (!template) {
      throw new Error(`Prompt template '${templateId}' not found in configuration or template manager`);
    }
    
    return Object.entries(context).reduce(
      (prompt, [key, value]) => prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
      template
    );
  }

  /**
   * Get the current model being used
   */
  private getCurrentModel(): string {
    const defaultProvider = config.llm?.defaultProvider || 'unknown';
    
    if (defaultProvider === 'openai') {
      // Get the OpenAI model
      return config.llm?.openai?.defaultModel || 'unknown';
    } else if (defaultProvider === 'anthropic') {
      // Get the first enabled Anthropic model
      if (config.llm?.anthropic?.models) {
        // Get first model name or key from the models object
        const modelKeys = Object.keys(config.llm.anthropic.models);
        if (modelKeys.length > 0) {
          return modelKeys[0]; // Return the first model name
        }
      }
    }
    
    return 'unknown';
  }

  /**
   * Execute with fallback to mock provider if needed
   */
  private async executeWithFallback<T>(operation: () => Promise<T>, mockOperation: () => Promise<T>): Promise<T> {
    // If we already know to use mock fallback, don't even try the real provider
    if (this.useMockFallback) {
      return mockOperation();
    }
    
    try {
      // Try with the configured provider
      return await operation();
    } catch (error) {
      // If authentication error, set the flag to use mock provider for future calls
      if (error instanceof Error && 
          (error.message.includes('authentication') || 
           error.message.includes('API key') || 
           error.message.includes('401'))) {
        console.warn("Authentication error with LLM provider, falling back to mock provider for all future calls");
        this.useMockFallback = true;
      } else {
        console.error("Error with LLM provider:", error);
        console.warn("Falling back to mock provider for this request");
      }
      
      // Fall back to mock provider
      return mockOperation();
    }
  }

  /**
   * Get a text completion from the LLM
   */
  async getTextCompletion(prompt: string): Promise<string> {
    return this.executeWithFallback(
      async () => {
        console.log(`Using ${this.useMockFallback ? 'mock' : 'real'} provider for text completion`);
        return await this.provider.sendPrompt(prompt);
      },
      async () => {
        console.log(`Using mock provider for text completion`);
        return await this.mockProvider.sendPrompt(prompt);
      }
    );
  }

  /**
   * Analyze a PineScript strategy and provide insights
   */
  async analyzeStrategy(strategyContent: string): Promise<StrategyAnalysis> {
    const context = { strategy: strategyContent };
    const prompt = await this.getPromptFromTemplate('strategy-analysis', context);
    
    return this.executeWithFallback(
      async () => {
        console.log(`Using ${this.useMockFallback ? 'mock' : 'real'} provider for strategy analysis`);
        return await this.provider.sendJsonPrompt<StrategyAnalysis>(prompt);
      },
      async () => {
        console.log(`Using mock provider for strategy analysis`);
        return await this.mockProvider.sendJsonPrompt<StrategyAnalysis>(prompt);
      }
    );
  }

  /**
   * Analyze backtest results and provide insights
   */
  async analyzeBacktest(backtestResults: string, strategyContent: string): Promise<BacktestAnalysis> {
    const context = {
      results: backtestResults,
      strategy: strategyContent
    };
    const prompt = await this.getPromptFromTemplate('backtest-analysis', context);
    
    return this.executeWithFallback(
      async () => {
        console.log(`Using ${this.useMockFallback ? 'mock' : 'real'} provider for backtest analysis`);
        return await this.provider.sendJsonPrompt<BacktestAnalysis>(prompt);
      },
      async () => {
        console.log(`Using mock provider for backtest analysis`);
        return await this.mockProvider.sendJsonPrompt<BacktestAnalysis>(prompt);
      }
    );
  }

  /**
   * Generate enhanced versions of a strategy
   */
  async enhanceStrategy(strategyContent: string, count: number = 3): Promise<EnhancedStrategy[]> {
    const context = {
      strategy: strategyContent,
      count: count
    };
    const prompt = await this.getPromptFromTemplate('strategy-enhancement', context);
    
    return this.executeWithFallback(
      async () => {
        console.log(`Using ${this.useMockFallback ? 'mock' : 'real'} provider for strategy enhancement`);
        return await this.provider.sendJsonPrompt<EnhancedStrategy[]>(prompt);
      },
      async () => {
        console.log(`Using mock provider for strategy enhancement`);
        return await this.mockProvider.sendJsonPrompt<EnhancedStrategy[]>(prompt);
      }
    );
  }
}

// Export singleton instance
export const llmService = new LLMService(); 