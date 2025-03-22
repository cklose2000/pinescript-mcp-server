/**
 * Anthropic LLM Provider for PineScript MCP
 * 
 * This provider handles interactions with Anthropic API for strategy analysis,
 * backtest interpretation, and strategy enhancement generation.
 */

import { LLMProvider } from './llmService.js';
import { config } from '../config/userConfig.js';
import fetch from 'node-fetch';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';
  private defaultModel: string;
  private defaultMaxTokens: number;
  private defaultTemperature: number;

  constructor() {
    // Check for API key in config
    this.apiKey = config.llm?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required. Set it in config or as ANTHROPIC_API_KEY environment variable.');
    }
    
    // Set up default parameters
    this.defaultModel = config.llm?.anthropic?.defaultModel || 'claude-3-sonnet-20240229';
    
    // Set max tokens and temperature based on the model
    if (this.defaultModel.includes('opus')) {
      this.defaultMaxTokens = config.llm?.anthropic?.modelOptions?.opus?.maxTokens || 4000;
      this.defaultTemperature = config.llm?.anthropic?.modelOptions?.opus?.temperature || 0.7;
    } else if (this.defaultModel.includes('sonnet')) {
      this.defaultMaxTokens = config.llm?.anthropic?.modelOptions?.sonnet?.maxTokens || 4000;
      this.defaultTemperature = config.llm?.anthropic?.modelOptions?.sonnet?.temperature || 0.7;
    } else if (this.defaultModel.includes('haiku')) {
      this.defaultMaxTokens = config.llm?.anthropic?.modelOptions?.haiku?.maxTokens || 4000;
      this.defaultTemperature = config.llm?.anthropic?.modelOptions?.haiku?.temperature || 0.7;
    } else {
      // Default values if model is not recognized
      this.defaultMaxTokens = 4000;
      this.defaultTemperature = 0.7;
    }
  }

  /**
   * Send a prompt to the Anthropic API and return the text response
   * @param prompt The prompt to send to the model
   * @param options Optional parameters for the API call
   * @returns The model's text response
   */
  async sendPrompt(prompt: string, options?: any): Promise<string> {
    try {
      const modelOptions = {
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature || this.defaultTemperature
      };
      
      const response = await this.makeAnthropicRequest(prompt, modelOptions);
      return response.content[0].text;
    } catch (error) {
      console.error('Error in Anthropic API call:', error);
      throw new Error(`Failed to get response from Anthropic: ${error}`);
    }
  }

  /**
   * Send a prompt to the Anthropic API and parse the response as JSON
   * @param prompt The prompt to send to the model
   * @param options Optional parameters for the API call
   * @returns The parsed JSON response
   */
  async sendJsonPrompt<T>(prompt: string, options?: any): Promise<T> {
    try {
      const jsonPrompt = `${prompt}\n\nYou must respond with valid JSON only. No other text, just JSON.`;
      
      const modelOptions = {
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature || this.defaultTemperature
      };
      
      const response = await this.makeAnthropicRequest(jsonPrompt, modelOptions);
      const textResponse = response.content[0].text;
      
      // Try to parse the JSON
      try {
        return JSON.parse(textResponse.trim()) as T;
      } catch (parseError) {
        console.error('Error parsing JSON from Anthropic response:', parseError);
        console.error('Raw response:', textResponse);
        throw new Error('Failed to parse JSON from Anthropic response');
      }
    } catch (error) {
      console.error('Error in Anthropic API JSON call:', error);
      throw new Error(`Failed to get JSON response from Anthropic: ${error}`);
    }
  }

  /**
   * Make a request to the Anthropic API
   * @param prompt The prompt to send
   * @param options Model options (model, max_tokens, temperature, etc.)
   * @returns The API response
   */
  private async makeAnthropicRequest(prompt: string, options: any) {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const requestBody = {
      model: options.model,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making Anthropic API request:', error);
      throw error;
    }
  }
} 