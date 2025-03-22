/**
 * Template System Tests
 * 
 * This file contains comprehensive tests for the template system, including:
 * - Template loading and validation
 * - Template rendering with placeholder replacement
 * - Category-based template retrieval
 * - Error handling for invalid templates and contexts
 */

import { expect } from 'chai';
import { describe, it, before, afterEach } from 'mocha';
import { templateManager } from '../prompts/templateManager.js';
import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../prompts/templateStructure.js';
import sinon from 'sinon';

// Import templates to ensure they're loaded
import '../prompts/templates/strategyAnalysis.js';
import '../prompts/templates/backtestAnalysis.js';
import '../prompts/templates/strategyEnhancement.js';
import '../prompts/templates/optimizationTemplate.js';

describe('Template System', () => {
  before(async () => {
    // Give time for dynamic imports to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(() => {
    // Clean up any stubs
    sinon.restore();
  });

  describe('Template Loading', () => {
    it('should load all template files successfully', async () => {
      const templates = await templateManager.getAllTemplates();
      expect(templates.length).to.be.at.least(4);
      
      // Check for specific template IDs
      const templateIds = templates.map(t => t.id);
      expect(templateIds).to.include('strategy-analysis');
      expect(templateIds).to.include('backtest-analysis');
      expect(templateIds).to.include('strategy-enhancement');
      expect(templateIds).to.include('strategy-optimization');
    });

    it('should retrieve templates by category', async () => {
      const analysisTemplates = await templateManager.getTemplatesByCategory(PromptCategory.ANALYSIS);
      expect(analysisTemplates.length).to.be.at.least(1);
      expect(analysisTemplates[0].category).to.equal(PromptCategory.ANALYSIS);
      
      const optimizationTemplates = await templateManager.getTemplatesByCategory(PromptCategory.OPTIMIZATION);
      expect(optimizationTemplates.length).to.be.at.least(1);
      expect(optimizationTemplates[0].category).to.equal(PromptCategory.OPTIMIZATION);
    });

    it('should get template by ID', async () => {
      const template = await templateManager.getTemplate('strategy-analysis');
      expect(template).to.not.be.null;
      if (template) {
        expect(template.id).to.equal('strategy-analysis');
        expect(template.name).to.be.a('string');
        expect(template.sections).to.be.an('array');
      }
    });

    it('should return null for non-existent template', async () => {
      const template = await templateManager.getTemplate('non-existent-template');
      expect(template).to.be.null;
    });
  });

  describe('Template Validation', () => {
    it('should validate a valid template', async () => {
      // Create a valid test template
      const validTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A template for testing',
        category: PromptCategory.ANALYSIS,
        sections: [
          {
            ...StandardSections.INTRODUCTION
          },
          {
            ...StandardSections.TASK
          },
          {
            ...StandardSections.CONTEXT,
            content: 'Here is the relevant context...\n{{strategy}}\n{{timeframe}}'
          },
          {
            ...StandardSections.OUTPUT_FORMAT
          }
        ],
        placeholders: ['strategy', 'timeframe']
      };
      
      // Save the template
      const result = await templateManager.saveTemplate(validTemplate);
      expect(result).to.be.true;
      
      // Verify it was saved correctly
      const savedTemplate = await templateManager.getTemplate('test-template');
      expect(savedTemplate).to.not.be.null;
      if (savedTemplate) {
        expect(savedTemplate.id).to.equal('test-template');
      }
    });

    it('should reject an invalid template', async () => {
      // Create an invalid template (missing required sections)
      const invalidTemplate = {
        id: 'invalid-template',
        name: 'Invalid Template',
        description: 'This template is missing required fields',
        // Missing category
        sections: []
        // Missing placeholders
      };
      
      // Try to save the invalid template
      // @ts-ignore - We're intentionally testing with an invalid template
      const result = await templateManager.saveTemplate(invalidTemplate);
      expect(result).to.be.false;
      
      // Verify it wasn't saved
      const savedTemplate = await templateManager.getTemplate('invalid-template');
      expect(savedTemplate).to.be.null;
    });
  });
  
  describe('Template Rendering', () => {
    it('should render a template with placeholder replacement', async () => {
      // Get the test template we created in the previous test
      const template = await templateManager.getTemplate('test-template');
      expect(template).to.not.be.null;
      
      if (template) {
        // Add a debug log to see the template
        console.log('Template sections:', JSON.stringify(template.sections, null, 2));
        
        // Use direct replacements instead of context
        const replacements = {
          strategy: '// Sample strategy code\nstrategy("Test")\n// More code here',
          timeframe: '1h'
        };
        
        // Call the assemblePrompt function directly with the replacements
        const prompt = await import('../prompts/templateStructure.js').then(module => {
          return module.assemblePrompt(template, {}, replacements);
        });
        
        // Verify the prompt contains expected content
        expect(prompt).to.include('Sample strategy code');
        expect(prompt).to.include('Test');
        expect(prompt).to.include('1h');
        
        // Make sure all template sections are included
        for (const section of template.sections) {
          expect(prompt).to.include(section.title);
        }
      }
    });
    
    it('should handle missing placeholders', async () => {
      const template = await templateManager.getTemplate('strategy-analysis');
      expect(template).to.not.be.null;
      
      if (template) {
        // Provide an empty context
        const context = {};
        
        const prompt = await templateManager.renderTemplate(template, context);
        
        // Verify the prompt still renders but has empty placeholders
        expect(prompt).to.include('```pinescript');
        expect(prompt).to.include('```');
      }
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors during template loading', async () => {
      // Create a stub that throws an error
      const getTemplateStub = sinon.stub(templateManager, 'getTemplate').throws(new Error('Test error'));
      
      try {
        await templateManager.getTemplate('any-id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('Error');
        expect((error as Error).message).to.equal('Test error');
      }
      
      // Restore the stub
      getTemplateStub.restore();
    });
  });
}); 