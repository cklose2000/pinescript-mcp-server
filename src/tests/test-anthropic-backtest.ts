/**
 * Test script for analyzing backtest results with Anthropic provider
 */
import fs from 'fs';
import path from 'path';
import { AnthropicProvider } from '../services/anthropicProvider.js';
import { config } from '../config/userConfig.js';
import { BacktestAnalysis } from '../services/llmService.js';

// Set up paths to test files
const examplesDir = path.resolve('./examples');
const backtestResultsPath = path.join(examplesDir, 'backtest-results.json');
const strategyPath = path.join(examplesDir, 'simple-strategy.pine');

async function main() {
  // Check if test files exist
  if (!fs.existsSync(backtestResultsPath)) {
    console.error(`Backtest results file not found: ${backtestResultsPath}`);
    return;
  }
  
  if (!fs.existsSync(strategyPath)) {
    console.error(`Strategy file not found: ${strategyPath}`);
    return;
  }
  
  // Read file contents
  const backtestResults = fs.readFileSync(backtestResultsPath, 'utf8');
  const strategy = fs.readFileSync(strategyPath, 'utf8');
  
  try {
    // Initialize Anthropic provider
    console.log('Initializing Anthropic provider...');
    const provider = new AnthropicProvider();
    
    // Create a prompt for backtest analysis
    const promptTemplate = config.llm?.promptTemplates?.backtestAnalysis || 
      `Analyze these backtest results for a trading strategy:

BACKTEST RESULTS:
{{backtestResults}}

STRATEGY CODE:
{{strategy}}

Provide a comprehensive analysis including overall assessment, metrics evaluation, 
strengths, concerns, suggestions for improvement, and parameter adjustment recommendations.
Return the analysis as a JSON object with the following structure:
{
  "overall": {
    "assessment": "string describing overall performance",
    "score": number from 1-10
  },
  "metrics": {
    "profitFactor": "string explanation",
    "winRate": "string explanation",
    etc.
  },
  "strengths": ["string", "string", ...],
  "concerns": ["string", "string", ...],
  "suggestions": ["string", "string", ...],
  "parameterAdjustments": [
    {
      "parameter": "parameter name",
      "currentValue": "current value",
      "suggestedValue": "suggested value",
      "rationale": "explanation for change"
    }
  ]
}`;
    
    // Replace placeholders in template
    const prompt = promptTemplate
      .replace('{{backtestResults}}', backtestResults)
      .replace('{{strategy}}', strategy);
    
    console.log('Sending request to Anthropic Claude API...');
    console.log(`Using model: ${config.llm?.anthropic?.defaultModel || 'claude-3-sonnet-20240229'}`);
    
    // Track timing
    const startTime = Date.now();
    
    // Send request to Anthropic
    const response = await provider.sendJsonPrompt<BacktestAnalysis>(prompt);
    
    const endTime = Date.now();
    console.log(`Response received in ${(endTime - startTime) / 1000} seconds`);
    
    // Format and display results
    console.log('\nBACKTEST ANALYSIS RESULTS:');
    console.log('\nOverall Assessment:');
    if (response.overall) {
      console.log(`${response.overall.assessment}`);
      if (response.overall.score) {
        console.log(`Score: ${response.overall.score}/10`);
      }
    }
    
    console.log('\nMetrics:');
    if (response.metrics) {
      for (const [key, value] of Object.entries(response.metrics)) {
        console.log(`${key}: ${value}`);
      }
    }
    
    console.log('\nStrengths:');
    console.log((response.strengths || []).map((s: string) => `- ${s}`).join('\n'));
    
    console.log('\nConcerns:');
    console.log((response.concerns || []).map((c: string) => `- ${c}`).join('\n'));
    
    console.log('\nSuggestions:');
    console.log((response.suggestions || []).map((s: string) => `- ${s}`).join('\n'));
    
    console.log('\nParameter Adjustments:');
    if (response.parameterAdjustments && response.parameterAdjustments.length > 0) {
      for (const adjustment of response.parameterAdjustments) {
        console.log(`- Parameter: ${adjustment.parameter}`);
        console.log(`  Current: ${adjustment.currentValue}`);
        console.log(`  Suggested: ${adjustment.suggestedValue}`);
        console.log(`  Rationale: ${adjustment.rationale}`);
        console.log();
      }
    } else {
      console.log('- No parameter adjustments suggested');
    }
    
  } catch (error) {
    console.error('Error in Anthropic backtest analysis test:', error);
  }
}

// Run the test
main().catch(console.error); 