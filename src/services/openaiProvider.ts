/**
 * OpenAI Provider for PineScript MCP
 * 
 * This provider connects to the OpenAI API for LLM services
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { config } from '../config/userConfig.js';

// Load environment variables
dotenv.config();

// Define options interface
export interface OpenAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Extract API key from .env file manually to handle multi-line values
 */
function extractApiKeyFromEnv(): string | null {
  try {
    // Read the .env file content
    const envPath = path.resolve('.env');
    if (!fs.existsSync(envPath)) {
      console.warn('No .env file found at path:', envPath);
      return null;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Find the OpenAI API key line
    const lines = envContent.split('\n');
    let apiKeyLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('OPENAI_API_KEY=')) {
        // Start collecting from this line
        apiKeyLine = lines[i];
        
        // If the next line doesn't start with # and isn't empty,
        // keep appending the following lines
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('#') && lines[j].trim() !== '') {
          apiKeyLine += lines[j].trim();
          j++;
        }
        
        break;
      }
    }
    
    // Extract the API key
    if (apiKeyLine) {
      const apiKey = apiKeyLine.substring(apiKeyLine.indexOf('=') + 1).trim();
      return apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting API key from .env:', error);
    return null;
  }
}

/**
 * OpenAI Provider implementation
 */
export class OpenAIProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor() {
    // Get API key using multiple sources, prioritizing manual extraction from .env
    const manualEnvKey = extractApiKeyFromEnv();
    const envApiKey = process.env.OPENAI_API_KEY;
    const configApiKey = config.llm?.openai?.apiKey;
    
    console.log("Manual ENV API Key extracted:", !!manualEnvKey);
    console.log("Process ENV API Key available:", !!envApiKey);
    console.log("Config API Key available:", !!configApiKey);
    
    // Use keys in order of priority
    const apiKey = manualEnvKey || envApiKey || configApiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found in either .env file, environment variables, or user config');
    }
    
    console.log("Using API key starting with:", apiKey.substring(0, 15) + "...");
    console.log("API key length:", apiKey.length);
    
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: apiKey,
      organization: process.env.OPENAI_ORGANIZATION,
    });
    
    // Set default model from config or use a reasonable default
    this.defaultModel = config.llm?.openai?.defaultModel || 'gpt-4-turbo';
    console.log("Using model:", this.defaultModel);
  }

  /**
   * Send a prompt to OpenAI and get the response
   */
  async sendPrompt(prompt: string, options?: OpenAIOptions): Promise<string> {
    try {
      const model = options?.model || this.defaultModel;
      
      // Create completion request
      const response = await this.client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        top_p: options?.topP ?? 1.0,
      });
      
      // Return the generated text
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to get response from OpenAI: ${error}`);
    }
  }

  /**
   * Send a prompt to OpenAI and get a JSON response
   */
  async sendJsonPrompt<T>(prompt: string, options?: OpenAIOptions): Promise<T> {
    try {
      // Define expected structure based on the specific type
      let expectedStructure = '';
      if (prompt.includes('strategy') && !prompt.includes('backtest')) {
        expectedStructure = `{
  "parameters": {
    "identified": ["param1", "param2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "logic": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvements": ["improvement1", "improvement2"]
  },
  "risk": {
    "assessment": "Overall risk assessment text",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "performance": {
    "bottlenecks": ["bottleneck1", "bottleneck2"],
    "optimizations": ["optimization1", "optimization2"]
  }
}`;
      } else if (prompt.includes('backtest')) {
        expectedStructure = `{
  "overall": {
    "assessment": "Overall assessment text",
    "score": 7.5
  },
  "metrics": {
    "profitFactor": "Profit factor analysis",
    "winRate": "Win rate analysis",
    "drawdown": "Drawdown analysis"
  },
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "parameterAdjustments": [
    {
      "parameter": "parameter1",
      "currentValue": "value1",
      "suggestedValue": "newValue1",
      "rationale": "Rationale for change"
    }
  ]
}`;
      } else {
        expectedStructure = `[
  {
    "version": "Enhanced version 1",
    "code": "// Code content here",
    "explanation": "Explanation of changes",
    "expectedImprovements": ["improvement1", "improvement2"]
  }
]`;
      }
      
      // Add JSON formatting instructions to the prompt
      const jsonPrompt = `${prompt}\n\nRespond with valid JSON only, following the exact structure below (all array elements should be strings, not objects):\n\n${expectedStructure}\n\nDo not include any text outside of the JSON.`;
      
      // Get the response
      const jsonString = await this.sendPrompt(jsonPrompt, options);
      
      // Log the raw response for debugging
      console.log('Raw response:', jsonString.substring(0, 200) + '...');
      
      // Try to parse the response as JSON
      try {
        // Extract JSON from the response if it's wrapped in markdown code blocks
        let extractedJson = jsonString;
        
        // Remove markdown code blocks if present
        const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          extractedJson = jsonMatch[1].trim();
        }
        
        // Remove any additional text before/after JSON object
        const objectStart = extractedJson.indexOf('{');
        const objectEnd = extractedJson.lastIndexOf('}') + 1;
        if (objectStart >= 0 && objectEnd > objectStart) {
          extractedJson = extractedJson.substring(objectStart, objectEnd);
        }
        
        console.log('Extracted JSON:', extractedJson.substring(0, 200) + '...');
        
        // Parse the JSON
        const parsedJson = JSON.parse(extractedJson) as T;
        
        // Process the parsed JSON to ensure all array elements are strings
        this.normalizeJsonStructure(parsedJson);
        
        return parsedJson;
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Response content:', jsonString);
        throw new Error('Failed to parse JSON response from OpenAI');
      }
    } catch (error) {
      console.error('Error in JSON prompt:', error);
      throw error;
    }
  }

  /**
   * Normalize JSON structure to ensure array elements are strings
   */
  private normalizeJsonStructure(obj: any): void {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        // Convert any objects in arrays to strings
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'object' && value[i] !== null) {
            value[i] = JSON.stringify(value[i]);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        this.normalizeJsonStructure(value);
      }
    });
  }
} 