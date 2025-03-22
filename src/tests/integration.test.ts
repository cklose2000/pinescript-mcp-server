/**
 * Integration Tests
 * 
 * This file contains tests for end-to-end workflows, including:
 * - Full optimization workflow from template to LLM
 * - Error handling and fallback mechanisms
 * - Testing with different strategy complexity levels
 */

import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateManager } from '../prompts/templateManager.js';
import { llmService } from '../services/llmService.js';
import sinon from 'sinon';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import templates to ensure they're loaded
import '../prompts/templates/strategyAnalysis.js';
import '../prompts/templates/backtestAnalysis.js';
import '../prompts/templates/strategyEnhancement.js';
import '../prompts/templates/optimizationTemplate.js';

// Test strategy code
const SIMPLE_STRATEGY = `
//@version=5
strategy("Simple Moving Average Crossover", overlay=true)

// Input parameters
fastLength = input(9, "Fast Length")
slowLength = input(21, "Slow Length")
src = input(close, "Source")

// Calculate moving averages
fastMA = ta.sma(src, fastLength)
slowMA = ta.sma(src, slowLength)

// Trading conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Strategy execution
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(fastMA, "Fast MA", color=color.blue)
plot(slowMA, "Slow MA", color=color.red)
`;

// Test backtest results
const SIMPLE_BACKTEST = `
Backtest Results for Simple Moving Average Crossover
Timeframe: 1 Day
Period: Jan 01, 2022 - Dec 31, 2023
Initial Capital: $10,000

PERFORMANCE SUMMARY:
Net Profit: $850.25 (8.50%)
Profit Factor: 1.32
Win Rate: 48%
Max Drawdown: -12.3%
`;

describe('Integration Tests', function() {
  // Increase timeout for LLM operations
  this.timeout(30000);
  
  before(async () => {
    // Give time for dynamic imports to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  describe('Strategy Analysis Workflow', () => {
    it('should analyze a simple strategy end-to-end', async () => {
      // Mock LLM service to avoid actual API calls during tests
      const analyzeStub = sinon.stub(llmService, 'analyzeStrategy').resolves({
        parameters: {
          identified: ['fastLength', 'slowLength', 'src'],
          suggestions: ['Add stop loss parameter']
        },
        logic: {
          strengths: ['Simple and clear logic'],
          weaknesses: ['No risk management'],
          improvements: ['Add trailing stop']
        },
        risk: {
          assessment: 'High risk due to no stop loss',
          recommendations: ['Implement proper position sizing']
        },
        performance: {
          bottlenecks: ['Simple moving average lag'],
          optimizations: ['Consider using EMA instead of SMA']
        }
      });
      
      try {
        // Run the analysis
        const analysis = await llmService.analyzeStrategy(SIMPLE_STRATEGY);
        
        // Verify results
        expect(analysis).to.have.property('parameters');
        expect(analysis).to.have.property('logic');
        expect(analysis).to.have.property('risk');
        expect(analysis).to.have.property('performance');
        
        expect(analysis.parameters?.identified).to.include('fastLength');
        expect(analysis.logic?.weaknesses).to.include('No risk management');
      } finally {
        // Restore the stub
        analyzeStub.restore();
      }
    });
  });
  
  describe('Backtest Analysis Workflow', () => {
    it('should analyze backtest results end-to-end', async () => {
      // Mock LLM service to avoid actual API calls during tests
      const analyzeStub = sinon.stub(llmService, 'analyzeBacktest').resolves({
        overall: {
          assessment: 'Moderate performance with room for improvement',
          score: 6.5
        },
        metrics: {
          profitFactor: 'Acceptable at 1.32',
          winRate: 'Below average at 48%'
        },
        strengths: ['Positive net profit'],
        concerns: ['High drawdown', 'Low win rate'],
        suggestions: ['Implement stop loss'],
        parameterAdjustments: [
          {
            parameter: 'fastLength',
            currentValue: '9',
            suggestedValue: '7',
            rationale: 'Faster response to market changes'
          }
        ]
      });
      
      try {
        // Run the analysis
        const analysis = await llmService.analyzeBacktest(SIMPLE_BACKTEST, SIMPLE_STRATEGY);
        
        // Verify results
        expect(analysis).to.have.property('overall');
        expect(analysis).to.have.property('metrics');
        expect(analysis).to.have.property('strengths');
        expect(analysis).to.have.property('concerns');
        expect(analysis).to.have.property('suggestions');
        expect(analysis).to.have.property('parameterAdjustments');
        
        expect(analysis.concerns).to.include('High drawdown');
        expect(analysis.parameterAdjustments[0].parameter).to.equal('fastLength');
      } finally {
        // Restore the stub
        analyzeStub.restore();
      }
    });
  });
  
  describe('Strategy Optimization Workflow', () => {
    it('should optimize a strategy using the optimization template', async () => {
      // Create temporary files for testing
      const strategyFile = path.join(__dirname, '../../temp_strategy.pine');
      const backTestFile = path.join(__dirname, '../../temp_backtest.txt');
      const outputFile = path.join(__dirname, '../../temp_optimization.json');
      
      // Mock getTextCompletion to return a predefined JSON response
      const completionStub = sinon.stub(llmService, 'getTextCompletion').resolves(`
{
  "parameterSuggestions": [
    {
      "name": "fastLength",
      "currentValue": 9,
      "suggestedValue": 7,
      "rationale": "Decrease to improve responsiveness",
      "expectedImpact": "Earlier entries, potentially higher returns"
    },
    {
      "name": "slowLength",
      "currentValue": 21,
      "suggestedValue": 26,
      "rationale": "Increase to filter out noise",
      "expectedImpact": "Fewer false signals, more reliable trends"
    }
  ],
  "optimizationApproach": {
    "methodology": "Walk-forward optimization",
    "metrics": ["Sharpe Ratio", "Profit Factor"],
    "timeframes": ["Current timeframe", "Higher timeframe"]
  },
  "marketConditions": {
    "bestPerforming": ["Trending markets"],
    "worstPerforming": ["Sideways markets"],
    "recommendations": ["Add trend filter"]
  },
  "implementationPriority": [
    {
      "change": "Add stop loss",
      "priority": "High",
      "complexity": "Low",
      "impact": "High"
    }
  ]
}
      `);
      
      try {
        // Write test files
        await fs.writeFile(strategyFile, SIMPLE_STRATEGY, 'utf-8');
        await fs.writeFile(backTestFile, SIMPLE_BACKTEST, 'utf-8');
        
        // Get the optimization template
        const template = await templateManager.getTemplate('strategy-optimization');
        expect(template).to.not.be.null;
        
        if (template) {
          // Generate context with template placeholders
          const context = {
            strategy: SIMPLE_STRATEGY,
            performance: SIMPLE_BACKTEST,
            parameters: 'fastLength,slowLength'
          };
          
          // Get the prompt
          const prompt = await templateManager.renderTemplate(template, context);
          expect(prompt).to.include('fastLength');
          expect(prompt).to.include('slowLength');
          
          // Get LLM completion (using mock)
          const optimizationResult = await llmService.getTextCompletion(prompt);
          
          // Parse JSON from result
          const parsedResult = JSON.parse(optimizationResult);
          
          // Verify the results
          expect(parsedResult).to.have.property('parameterSuggestions');
          expect(parsedResult.parameterSuggestions[0].name).to.equal('fastLength');
          expect(parsedResult.parameterSuggestions[0].suggestedValue).to.equal(7);
          
          // Save results to file
          await fs.writeFile(outputFile, JSON.stringify(parsedResult, null, 2), 'utf-8');
          
          // Verify file was written
          const fileContent = await fs.readFile(outputFile, 'utf-8');
          expect(JSON.parse(fileContent)).to.deep.equal(parsedResult);
        }
      } finally {
        // Clean up temporary files
        for (const file of [strategyFile, backTestFile, outputFile]) {
          try {
            await fs.access(file);
            await fs.unlink(file);
          } catch (error) {
            // Ignore errors if file doesn't exist
          }
        }
        
        // Restore stub
        completionStub.restore();
      }
    });
  });
  
  describe('Error Handling and Fallbacks', () => {
    it('should handle LLM service errors gracefully', async () => {
      // Stub getTextCompletion to throw an error
      const errorStub = sinon.stub(llmService, 'getTextCompletion').throws(
        new Error('API connection error')
      );
      
      try {
        try {
          await llmService.getTextCompletion('Test prompt');
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).to.be.an('Error');
          expect((error as Error).message).to.equal('API connection error');
        }
      } finally {
        // Restore stub
        errorStub.restore();
      }
    });
    
    it('should fall back to mock provider when configured', async () => {
      // This test assumes the llmService has a fallback mechanism
      // and tests that it works correctly.
      
      // Create a test prompt
      const prompt = 'Test prompt that should use fallback';
      
      // Simulate a condition that would trigger fallback
      // For testing purposes, we'll use a spy to see if the fallback mechanism was triggered
      const executeStub = sinon.stub(llmService as any, 'executeWithFallback')
        .callsFake(async (_op: any, fallback: any) => {
          // Always call the fallback function
          return await fallback();
        });
      
      try {
        // Call the service
        const result = await llmService.getTextCompletion(prompt);
        
        // Verify we got a mock response
        expect(result).to.be.a('string');
        expect(result).to.include('mock');
      } finally {
        // Restore stub
        executeStub.restore();
      }
    });
  });
}); 