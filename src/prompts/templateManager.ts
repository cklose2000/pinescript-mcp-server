/**
 * Prompt Template Manager
 * 
 * Central registry for all prompt templates used in the application.
 * Handles template registration, retrieval, and validation.
 */

import { PromptTemplate, validateTemplate, assemblePrompt } from './templateStructure.js';

// Import all templates
import strategyAnalysisTemplate from './templates/strategyAnalysis.js';
import backtestAnalysisTemplate from './templates/backtestAnalysis.js';
import strategyEnhancementTemplate from './templates/strategyEnhancement.js';

class TemplateManager {
  private templates: Map<string, PromptTemplate> = new Map();
  private static instance: TemplateManager;

  private constructor() {
    // Register core templates
    this.registerTemplate(strategyAnalysisTemplate);
    this.registerTemplate(backtestAnalysisTemplate);
    this.registerTemplate(strategyEnhancementTemplate);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  /**
   * Register a template with the manager
   */
  public registerTemplate(template: PromptTemplate): void {
    // Validate the template before registering
    validateTemplate(template);
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by ID
   */
  public getTemplate(id: string): PromptTemplate {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID "${id}" not found`);
    }
    return template;
  }

  /**
   * Get all template IDs
   */
  public getTemplateIds(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Generate a prompt from a template with the provided values
   */
  public generatePrompt(templateId: string, placeholderValues: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    
    // Ensure all required placeholders are provided
    if (template.placeholders) {
      for (const placeholder of template.placeholders) {
        if (!(placeholder in placeholderValues)) {
          throw new Error(`Missing required placeholder "${placeholder}" for template "${templateId}"`);
        }
      }
    }
    
    return assemblePrompt(template, placeholderValues);
  }

  /**
   * Check if a template exists
   */
  public hasTemplate(id: string): boolean {
    return this.templates.has(id);
  }
}

// Export singleton instance
export const templateManager = TemplateManager.getInstance();

// Export default
export default templateManager; 