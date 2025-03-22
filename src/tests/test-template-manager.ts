/**
 * Test Template Manager
 * 
 * This script tests the template manager and its ability to generate prompts
 * from different templates with placeholder values.
 */

import { templateManager } from '../prompts/templateManager.js';
import { llmService } from '../services/llmService.js';

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
  },
  "monthlyPerformance": [
    {"month": "Jan 2022", "return": 4.2},
    {"month": "Feb 2022", "return": -2.1},
    {"month": "Mar 2022", "return": 5.6},
    {"month": "Apr 2022", "return": -3.8},
    {"month": "May 2022", "return": 7.2},
    {"month": "Jun 2022", "return": -1.4},
    {"month": "Jul 2022", "return": 2.9},
    {"month": "Aug 2022", "return": 3.5},
    {"month": "Sep 2022", "return": -5.2},
    {"month": "Oct 2022", "return": 6.8},
    {"month": "Nov 2022", "return": 4.3},
    {"month": "Dec 2022", "return": 1.9}
  ]
}
`;

// Test template manager
async function testTemplateManager() {
  try {
    console.log('\n--- Testing Template Manager ---');
    
    // 1. List available templates
    const templateIds = templateManager.getTemplateIds();
    console.log(`Available templates: ${templateIds.join(', ')}`);
    
    // 2. Generate a strategy analysis prompt
    const analysisPrompt = templateManager.generatePrompt('strategy-analysis', {
      strategy: testStrategyCode
    });
    console.log('\nStrategy Analysis Prompt (first 200 chars):');
    console.log(analysisPrompt.substring(0, 200) + '...');
    
    // 3. Generate a backtest analysis prompt
    const backtestPrompt = templateManager.generatePrompt('backtest-analysis', {
      results: testBacktestResults,
      strategy: testStrategyCode
    });
    console.log('\nBacktest Analysis Prompt (first 200 chars):');
    console.log(backtestPrompt.substring(0, 200) + '...');
    
    // 4. Generate a strategy enhancement prompt
    const enhancementPrompt = templateManager.generatePrompt('strategy-enhancement', {
      strategyContent: testStrategyCode,
      count: '2'
    });
    console.log('\nStrategy Enhancement Prompt (first 200 chars):');
    console.log(enhancementPrompt.substring(0, 200) + '...');
    
    console.log('\n--- Testing LLM Service Integration ---');
    
    // 5. Test integration with LLM Service (using mock provider)
    console.log('\nTesting Strategy Analysis via LLM Service:');
    const analysisResult = await llmService.analyzeStrategy(testStrategyCode);
    console.log('Analysis result:', JSON.stringify(analysisResult, null, 2));
    
    console.log('\nTesting Backtest Analysis via LLM Service:');
    const backtestResult = await llmService.analyzeBacktest(testBacktestResults, testStrategyCode);
    console.log('Backtest analysis result:', JSON.stringify(backtestResult, null, 2));
    
    console.log('\nTesting Strategy Enhancement via LLM Service:');
    const enhancementResult = await llmService.enhanceStrategy(testStrategyCode, 2);
    console.log('Enhancement result (first strategy):', JSON.stringify(enhancementResult[0], null, 2));
    
    console.log('\n--- Template Manager Tests Completed Successfully ---');
  } catch (error) {
    console.error('Error in template manager tests:', error);
  }
}

// Run the tests
testTemplateManager(); 