/**
 * Template CLI Commands
 * 
 * This module provides CLI commands for managing templates,
 * including testing, listing, and database operations.
 */

import { Command } from 'commander';
import { templateManager } from '../../prompts/templateManager.js';
import { templateRepository } from '../../prompts/templateRepository.js';
import { config } from '../../config/userConfig.js';
import { PromptCategory } from '../../prompts/templateStructure.js';
import { runTemplateTests } from '../../tests/test-template-system.js';
import templateVectorStore from '../../prompts/templateVectorStore.js';
import fs from 'fs/promises';
import path from 'path';
import { llmService } from '../../services/llmService.js';

// Import template files to ensure they're loaded
import '../../prompts/templates/strategyAnalysis.js';
import '../../prompts/templates/backtestAnalysis.js';
import '../../prompts/templates/strategyEnhancement.js';
import '../../prompts/templates/optimizationTemplate.js';

/**
 * Initialize template system
 * Ensures templates are properly loaded before operations
 */
async function initializeTemplates(): Promise<void> {
  // Wait a bit to ensure dynamic imports are complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get all templates to force loading
  const templates = await templateManager.getAllTemplates();
  console.log(`Loaded ${templates.length} templates: ${templates.map(t => t.id).join(', ')}`);
}

const templatesCommand = new Command('templates')
  .description('Manage prompt templates');

// Test templates command
templatesCommand
  .command('test')
  .description('Run tests for the template system')
  .action(async () => {
    console.log('Running template system tests...');
    // Initialize templates first
    await initializeTemplates();
    await runTemplateTests();
  });

// List templates command
templatesCommand
  .command('list')
  .description('List all available templates')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (options) => {
    console.log('Listing available templates...');
    
    // Initialize templates first
    await initializeTemplates();
    
    let templates;
    if (options.category) {
      // Validate category
      const category = options.category.toUpperCase();
      const validCategory = Object.values(PromptCategory).includes(options.category);
      
      if (!validCategory) {
        console.error(`Invalid category: ${options.category}`);
        console.log('Valid categories:');
        Object.values(PromptCategory).forEach(cat => console.log(`- ${cat}`));
        return;
      }
      
      templates = await templateManager.getTemplatesByCategory(options.category as PromptCategory);
      console.log(`Templates in category "${options.category}":`);
    } else {
      templates = await templateManager.getAllTemplates();
      console.log('All templates:');
    }
    
    // Display templates
    if (templates.length === 0) {
      console.log('No templates found.');
    } else {
      templates.forEach(template => {
        console.log(`- ${template.id}: ${template.name} (${template.category}, v${template.version || '1.0.0'})`);
      });
    }
  });

// Sync templates to database command
templatesCommand
  .command('sync')
  .description('Sync templates to database')
  .action(async () => {
    if (!config.databases?.supabase?.enabled) {
      console.error('Supabase database is not enabled in configuration');
      return;
    }
    
    console.log('Syncing templates to database...');
    
    // Initialize templates first
    await initializeTemplates();
    
    // Get all templates from memory
    const templates = await templateManager.getAllTemplates();
    
    if (templates.length === 0) {
      console.log('No templates found to sync.');
      return;
    }
    
    console.log(`Found ${templates.length} templates to sync.`);
    
    // Sync each template
    let successCount = 0;
    let failCount = 0;
    
    for (const template of templates) {
      try {
        console.log(`Syncing template: ${template.id}...`);
        const result = await templateRepository.saveTemplate(template);
        
        if (result) {
          console.log(`✓ Template synced: ${template.id}`);
          successCount++;
        } else {
          console.error(`✗ Failed to sync template: ${template.id}`);
          failCount++;
        }
      } catch (error) {
        console.error(`Error syncing template ${template.id}:`, error);
        failCount++;
      }
    }
    
    console.log('Sync complete.');
    console.log(`Results: ${successCount} succeeded, ${failCount} failed`);
  });

// Get template from database command
templatesCommand
  .command('get')
  .description('Get a template from database')
  .argument('<id>', 'Template ID to retrieve')
  .action(async (id) => {
    if (!config.databases?.supabase?.enabled) {
      console.error('Supabase database is not enabled in configuration');
      return;
    }
    
    console.log(`Retrieving template: ${id}...`);
    
    // Initialize templates first
    await initializeTemplates();
    
    try {
      const template = await templateRepository.getTemplate(id);
      
      if (template) {
        console.log('Template found:');
        console.log(`- ID: ${template.id}`);
        console.log(`- Name: ${template.name}`);
        console.log(`- Description: ${template.description}`);
        console.log(`- Category: ${template.category}`);
        console.log(`- Version: ${template.version || '1.0.0'}`);
        console.log(`- Sections: ${template.sections.length}`);
        
        if (template.placeholders && template.placeholders.length > 0) {
          console.log('- Placeholders:');
          template.placeholders.forEach(p => console.log(`  - ${p}`));
        }
      } else {
        console.error(`Template with ID "${id}" not found in database`);
      }
    } catch (error) {
      console.error(`Error retrieving template:`, error);
    }
  });

// Version history command
templatesCommand
  .command('versions')
  .description('List version history for a template')
  .argument('<id>', 'Template ID to check versions for')
  .action(async (id) => {
    if (!config.databases?.supabase?.enabled) {
      console.error('Supabase database is not enabled in configuration');
      return;
    }
    
    console.log(`Retrieving version history for template: ${id}...`);
    
    // Initialize templates first
    await initializeTemplates();
    
    try {
      const versions = await templateRepository.getTemplateVersions(id);
      
      if (versions.length > 0) {
        console.log(`Found ${versions.length} versions:`);
        versions.forEach((version, index) => {
          console.log(`${index + 1}. Version ${version.version} (${version.created_at || 'unknown date'})`);
          if (version.notes) {
            console.log(`   Notes: ${version.notes}`);
          }
        });
      } else {
        console.log(`No version history found for template: ${id}`);
      }
    } catch (error) {
      console.error(`Error retrieving version history:`, error);
    }
  });

// Embed templates command
templatesCommand
  .command('embed')
  .description('Create vector embeddings for templates')
  .action(async () => {
    console.log('Creating vector embeddings for templates...');
    
    // Initialize templates first
    await initializeTemplates();
    
    if (!config.databases?.supabase?.enabled) {
      console.error('Supabase is not enabled in configuration');
      return;
    }
    
    // Embed all templates
    const count = await templateVectorStore.embedAllTemplates();
    
    if (count > 0) {
      console.log(`Successfully embedded ${count} templates`);
    } else {
      console.error('Failed to embed templates');
    }
  });

// Semantic search command
templatesCommand
  .command('search')
  .description('Search for templates semantically')
  .argument('<query>', 'Search query text')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --threshold <number>', 'Similarity threshold (0.0-1.0)', parseFloat, 0.75)
  .option('-l, --limit <number>', 'Maximum number of results', parseInt, 5)
  .action(async (query, options) => {
    console.log(`Searching for templates matching: "${query}"...`);
    
    // Initialize templates first
    await initializeTemplates();
    
    if (!config.databases?.supabase?.enabled) {
      console.error('Supabase is not enabled in configuration');
      return;
    }
    
    // Validate threshold
    if (isNaN(options.threshold) || options.threshold < 0 || options.threshold > 1) {
      console.error('Threshold must be a number between 0.0 and 1.0');
      return;
    }
    
    // Validate limit
    if (isNaN(options.limit) || options.limit < 1) {
      console.error('Limit must be a positive number');
      return;
    }
    
    // Validate category if provided
    let category = undefined;
    if (options.category) {
      if (Object.values(PromptCategory).includes(options.category as any)) {
        category = options.category as PromptCategory;
      } else {
        console.error(`Invalid category: ${options.category}`);
        console.log('Valid categories:');
        Object.values(PromptCategory).forEach(cat => console.log(`- ${cat}`));
        return;
      }
    }
    
    // Perform search
    const results = await templateVectorStore.semanticTemplateSearch(query, {
      category,
      threshold: options.threshold,
      limit: options.limit
    });
    
    if (results.length === 0) {
      console.log('No matching templates found');
      return;
    }
    
    // Display results
    console.log(`Found ${results.length} matching templates:`);
    results.forEach((result: { template: any; similarity: number }, index: number) => {
      console.log(`\n${index + 1}. ${result.template.name} (${result.template.id})`);
      console.log(`   Category: ${result.template.category}`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`   Description: ${result.template.description}`);
      
      if (result.template.placeholders && result.template.placeholders.length > 0) {
        console.log(`   Placeholders: ${result.template.placeholders.join(', ')}`);
      }
    });
  });

// Optimize strategy command
templatesCommand
  .command('optimize')
  .description('Optimize a PineScript strategy with parameter suggestions')
  .argument('<strategy-file>', 'Path to the PineScript strategy file')
  .option('-p, --performance <file>', 'Path to a file containing performance metrics')
  .option('-o, --output <file>', 'Output file path for optimization results (default: optimization-results.json)')
  .option('--parameters <list>', 'Comma-separated list of parameters to focus on')
  .action(async (strategyFile, options) => {
    console.log('Running strategy optimization...');
    
    // Initialize templates first
    await initializeTemplates();
    
    try {
      // Read the strategy file
      const strategyCode = await fs.readFile(strategyFile, 'utf-8');
      console.log(`Read strategy file: ${strategyFile} (${strategyCode.length} characters)`);
      
      // Read performance file if provided
      let performanceData = '';
      if (options.performance) {
        performanceData = await fs.readFile(options.performance, 'utf-8');
        console.log(`Read performance file: ${options.performance} (${performanceData.length} characters)`);
      } else {
        console.log('No performance file provided, optimization will be based on code analysis only');
      }
      
      // Get the optimization template
      const template = await templateManager.getTemplate('strategy-optimization');
      if (!template) {
        console.error('Optimization template not found');
        return;
      }
      
      console.log('Generating optimization suggestions...');
      
      // Generate context with the template placeholders
      const context = {
        strategy: strategyCode,
        performance: performanceData,
        parameters: options.parameters || ''
      };
      
      // Generate the prompt from the template
      const prompt = await templateManager.renderTemplate(template, context);
      
      // Send to LLM service
      const optimizationResult = await llmService.getTextCompletion(prompt);
      
      console.log('Optimization complete!');
      
      // Parse JSON from the result
      let parsedResult;
      try {
        // Find and extract the JSON from the response
        const jsonMatch = optimizationResult.match(/```json([\s\S]*?)```/) || 
                          optimizationResult.match(/{[\s\S]*}/) ||
                          [null, optimizationResult];
        
        const jsonContent = jsonMatch[1] || optimizationResult;
        parsedResult = JSON.parse(jsonContent);
        console.log('Successfully parsed optimization results');
      } catch (error) {
        console.error('Failed to parse JSON from optimization results');
        console.log('Raw results:');
        console.log(optimizationResult);
        
        // Save raw results instead
        parsedResult = { rawResults: optimizationResult };
      }
      
      // Save results to file
      const outputFile = options.output || 'optimization-results.json';
      await fs.writeFile(outputFile, JSON.stringify(parsedResult, null, 2), 'utf-8');
      console.log(`Optimization results saved to: ${outputFile}`);
      
      // Print summary of suggestions
      if (parsedResult.parameterSuggestions && Array.isArray(parsedResult.parameterSuggestions)) {
        console.log('\nParameter Suggestions:');
        parsedResult.parameterSuggestions.forEach((suggestion: { 
          name: string; 
          currentValue: any; 
          suggestedValue: any; 
        }) => {
          console.log(`- ${suggestion.name}: ${suggestion.currentValue} → ${suggestion.suggestedValue}`);
        });
      }
      
      if (parsedResult.implementationPriority && Array.isArray(parsedResult.implementationPriority)) {
        console.log('\nImplementation Priorities:');
        parsedResult.implementationPriority.forEach((item: { 
          change: string; 
          priority: string; 
          impact: string; 
        }) => {
          console.log(`- ${item.change} (Priority: ${item.priority}, Impact: ${item.impact})`);
        });
      }
      
    } catch (error) {
      console.error('Error during optimization:', error);
    }
  });

export default templatesCommand; 