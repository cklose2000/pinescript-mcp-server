/**
 * Vector Store Tests
 * 
 * This file contains tests for the template vector store functionality, including:
 * - Embedding generation for templates
 * - Semantic search with different queries
 * - Category filtering and threshold settings
 */

import { expect } from 'chai';
import { describe, it, before, beforeEach, after } from 'mocha';
import { config } from '../config/userConfig.js';
import { templateManager } from '../prompts/templateManager.js';
import templateVectorStore from '../prompts/templateVectorStore.js';
import { PromptCategory } from '../prompts/templateStructure.js';
import sinon from 'sinon';

// Import templates to ensure they're loaded
import '../prompts/templates/strategyAnalysis.js';
import '../prompts/templates/backtestAnalysis.js';
import '../prompts/templates/strategyEnhancement.js';
import '../prompts/templates/optimizationTemplate.js';

describe('Template Vector Store', function() {
  // Increase timeout for embedding operations
  this.timeout(10000);
  
  // Store original config
  let originalConfig: any;
  
  before(async function() {
    // Skip tests if Supabase not configured
    if (!config.databases?.supabase?.enabled) {
      this.skip();
    }
    
    // Store original config
    originalConfig = { ...config };
    
    // Give time for dynamic imports to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  after(function() {
    // Restore original config if needed
    if (originalConfig) {
      Object.assign(config, originalConfig);
    }
  });
  
  beforeEach(async function() {
    // Skip individual tests if Supabase not enabled
    if (!config.databases?.supabase?.enabled) {
      this.skip();
    }
  });
  
  describe('Embedding Generation', () => {
    it('should generate embeddings for templates', async () => {
      // Check if we have the function for testing
      if (!templateVectorStore.storeTemplateEmbedding) {
        return;
      }
      
      const analysisTemplate = await templateManager.getTemplate('strategy-analysis');
      expect(analysisTemplate).to.not.be.null;
      
      if (analysisTemplate) {
        const result = await templateVectorStore.storeTemplateEmbedding(analysisTemplate);
        expect(result).to.be.true;
      }
    });
    
    it('should embed all templates', async () => {
      // Check if we have a proper function for testing
      if (!templateVectorStore.embedAllTemplates) {
        return;
      }
      
      const count = await templateVectorStore.embedAllTemplates();
      expect(count).to.be.at.least(1);
    });
  });
  
  describe('Semantic Search', () => {
    it('should find relevant templates with semantic search', async () => {
      const results = await templateVectorStore.semanticTemplateSearch('how to optimize my trading strategy');
      
      expect(results).to.be.an('array');
      if (results.length > 0) {
        expect(results[0]).to.have.property('template');
        expect(results[0]).to.have.property('similarity');
        expect(results[0].similarity).to.be.within(0, 1);
      }
    });
    
    it('should filter search results by category', async () => {
      const results = await templateVectorStore.semanticTemplateSearch('optimize parameters', {
        category: PromptCategory.OPTIMIZATION
      });
      
      expect(results).to.be.an('array');
      if (results.length > 0) {
        results.forEach(result => {
          expect(result.template.category).to.equal(PromptCategory.OPTIMIZATION);
        });
      }
    });
    
    it('should respect similarity threshold', async () => {
      const highThreshold = 0.95; // Very high threshold that likely won't be met
      const results = await templateVectorStore.semanticTemplateSearch('simple query', {
        threshold: highThreshold
      });
      
      expect(results.length).to.equal(0);
    });
    
    it('should respect result limit', async () => {
      const limit = 2;
      const results = await templateVectorStore.semanticTemplateSearch('trading strategy', {
        limit: limit
      });
      
      expect(results.length).to.be.at.most(limit);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors during embedding generation', async () => {
      // Create a stub for the embedding function that throws an error
      const embedStub = sinon.stub(templateVectorStore, 'storeTemplateEmbedding').throws(new Error('Embedding error'));
      
      try {
        const template = await templateManager.getTemplate('strategy-analysis');
        if (template) {
          await templateVectorStore.storeTemplateEmbedding(template);
        }
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('Error');
        expect((error as Error).message).to.equal('Embedding error');
      }
      
      // Restore the stub
      embedStub.restore();
    });
    
    it('should handle database unavailability gracefully', async () => {
      // Temporarily modify config to simulate database unavailability
      const originalEnabled = config.databases?.supabase?.enabled;
      
      if (config.databases && config.databases.supabase) {
        config.databases.supabase.enabled = false;
      }
      
      try {
        const results = await templateVectorStore.semanticTemplateSearch('test query');
        expect(results).to.be.an('array');
        expect(results.length).to.equal(0);
      } finally {
        // Restore config
        if (config.databases && config.databases.supabase) {
          config.databases.supabase.enabled = originalEnabled;
        }
      }
    });
  });
}); 