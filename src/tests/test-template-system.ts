/**
 * Test Template System
 * 
 * This script tests the enhanced template system with database integration,
 * verifying various aspects such as template storage, retrieval, and prompt
 * generation.
 */

import { templateManager } from '../prompts/templateManager.js';
import { templateRepository } from '../prompts/templateRepository.js';
import { PromptCategory } from '../prompts/templateStructure.js';
import { config } from '../config/userConfig.js';
import { llmService } from '../services/llmService.js';
import { isSupabaseAvailable } from '../db/supabaseClient.js';

// Import template files to ensure they're loaded
import '../prompts/templates/strategyAnalysis.js';
import '../prompts/templates/backtestAnalysis.js';
import '../prompts/templates/strategyEnhancement.js';

// Example PineScript code for testing
const testStrategyCode = `
strategy("Simple Moving Average Strategy", overlay=true)

// Input parameters
fastLength = input(9, "Fast MA Length")
slowLength = input(21, "Slow MA Length")
source = input(close, "Source")

// Calculate indicators
fastMA = sma(source, fastLength)
slowMA = sma(source, slowLength)

// Entry/exit conditions
longCondition = crossover(fastMA, slowMA)
shortCondition = crossunder(fastMA, slowMA)

// Execute trades
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(fastMA, color=color.blue, title="Fast MA")
plot(slowMA, color=color.red, title="Slow MA")
`;

// Example backtest results
const testBacktestResults = `
{
  "totalTrades": 42,
  "winningTrades": 24,
  "losingTrades": 18,
  "winRate": 0.57,
  "profitFactor": 1.65,
  "averageWin": 215,
  "averageLoss": 180,
  "maxDrawdown": 15.8,
  "sharpeRatio": 1.2,
  "summaryStatistics": {
    "equity": {
      "start": 10000,
      "end": 14250,
      "max": 15300,
      "min": 9200
    },
    "period": {
      "start": "2022-01-01",
      "end": "2022-12-31",
      "totalDays": 365
    }
  }
}
`;

/**
 * Initialize template system for testing
 * This ensures templates are properly loaded before tests run
 */
async function initializeTemplateSystem(): Promise<void> {
  console.log('Initializing template system for testing...');
  
  // Wait a bit to ensure dynamic imports are complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get all templates to log what's available
  const templates = await templateManager.getAllTemplates();
  console.log(`Loaded ${templates.length} templates for testing: ${templates.map(t => t.id).join(', ')}`);
}

/**
 * Run template system tests
 */
export async function runTemplateTests(): Promise<void> {
  try {
    console.log('Starting Template System Tests...');
    console.log('=================================\n');

    // Initialize template system
    await initializeTemplateSystem();
    
    // 1. Test database availability
    console.log('1. Testing Database Availability...');
    const dbEnabled = config.databases?.supabase?.enabled || false;
    
    if (dbEnabled) {
      const dbAvailable = await isSupabaseAvailable();
      console.log(`Supabase database is ${dbAvailable ? 'available' : 'not available'}`);
    } else {
      console.log('Supabase is not enabled in configuration');
    }
    
    // 2. Test template manager initialization
    console.log('\n2. Testing Template Manager Initialization...');
    const allTemplates = await templateManager.getAllTemplates();
    console.log(`Loaded ${allTemplates.length} templates:`);
    for (const template of allTemplates) {
      console.log(`- ${template.id}: ${template.name} (${template.category})`);
    }
    
    // 3. Test template retrieval by category
    console.log('\n3. Testing Template Retrieval by Category...');
    const analysisTemplates = await templateManager.getTemplatesByCategory(PromptCategory.ANALYSIS);
    console.log(`Found ${analysisTemplates.length} analysis templates`);
    
    // 4. Test prompt generation with context
    console.log('\n4. Testing Prompt Generation with Context...');
    try {
      const prompt = await templateManager.generatePrompt('strategy-analysis', {
        strategy: testStrategyCode
      });
      
      if (prompt) {
        console.log('Successfully generated strategy analysis prompt');
        console.log(`Prompt length: ${prompt.length} characters`);
        console.log(`Prompt preview: ${prompt.substring(0, 100)}...`);
      } else {
        console.log('Failed to generate strategy analysis prompt');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
    
    // 5. Test LLM Service integration
    console.log('\n5. Testing LLM Service Integration...');
    try {
      console.log('Testing strategy analysis...');
      
      // Skip if using real providers to avoid unnecessary API calls
      if (config.llm?.mock?.enabled) {
        const result = await llmService.analyzeStrategy(testStrategyCode);
        console.log('Strategy analysis successful:');
        console.log(JSON.stringify(result, null, 2).substring(0, 200) + '...');
      } else {
        console.log('Skipping LLM service test (mock provider not configured)');
      }
    } catch (error) {
      console.error('Error in LLM service integration:', error);
    }
    
    // 6. Test template repository
    console.log('\n6. Testing Template Repository...');
    if (dbEnabled) {
      // Only test database operations if database is enabled
      try {
        // Create a test template
        const testTemplateId = 'test-template-' + Date.now();
        const testTemplate = allTemplates[0];
        testTemplate.id = testTemplateId;
        
        // Save template to database
        await templateRepository.saveTemplate(testTemplate);
        console.log(`Saved template ${testTemplateId} to database`);
        
        // Get template from database
        const retrievedTemplate = await templateRepository.getTemplate(testTemplateId);
        if (retrievedTemplate) {
          console.log(`Retrieved template ${retrievedTemplate.id} from database`);
        }
        
        // Get template versions
        const versions = await templateRepository.getTemplateVersions(testTemplateId);
        console.log(`Found ${versions.length} versions for template ${testTemplateId}`);
      } catch (error) {
        console.error('Error in template repository test:', error);
      }
    } else {
      console.log('Skipping repository tests (database not enabled)');
    }
    
    console.log('\n=================================');
    console.log('Template System Tests Complete');
  } catch (error) {
    console.error('Error running template tests:', error);
  }
}

// Only run the tests if this file is executed directly (not when imported)
const isDirectExecution = process.argv[1]?.endsWith('test-template-system.js');
if (isDirectExecution) {
  runTemplateTests();
} 