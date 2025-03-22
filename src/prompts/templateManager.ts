/**
 * Template Manager
 * 
 * Manages prompt templates, including loading from filesystem or database,
 * template validation, and assembly of prompts from templates.
 */

import { 
  PromptTemplate, 
  assemblePrompt, 
  validateTemplate, 
  PromptCategory
} from './templateStructure.js';
import { templateRepository } from './templateRepository.js';
import { config } from '../config/userConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template Manager class for handling all template operations
 */
export class TemplateManager {
  private static instance: TemplateManager;
  private templates: Map<string, PromptTemplate> = new Map();
  private templatesDir: string;
  private useDatabase: boolean;
  
  private constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
    this.useDatabase = config.databases?.supabase?.enabled || false;
    this.loadTemplates();
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
   * Load all templates from filesystem and/or database
   */
  private async loadTemplates(): Promise<void> {
    // Load from filesystem first
    try {
      this.loadTemplatesFromFilesystem();
    } catch (error) {
      console.error('Error loading templates from filesystem:', error);
    }
    
    // Then load from database if enabled
    if (this.useDatabase) {
      try {
        await this.loadTemplatesFromDatabase();
      } catch (error) {
        console.error('Error loading templates from database:', error);
      }
    }
    
    console.log(`Template Manager initialized with ${this.templates.size} templates`);
  }
  
  /**
   * Load templates from filesystem
   */
  private loadTemplatesFromFilesystem(): void {
    if (!fs.existsSync(this.templatesDir)) {
      console.warn(`Templates directory not found: ${this.templatesDir}`);
      return;
    }
    
    // Get all files in the templates directory that end with .ts or .js
    const templateFiles = fs.readdirSync(this.templatesDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of templateFiles) {
      try {
        // Skip the index file and any helper files
        if (file === 'index.ts' || file === 'index.js' || file.startsWith('_')) {
          continue;
        }
        
        // Dynamically import the template file
        const templatePath = `./templates/${file.replace(/\.(ts|js)$/, '.js')}`;
        // This will be executed at runtime, not during the static analysis
        const templateModulePath = templatePath.replace(/\\/g, '/');
        
        // Add this to be dynamically loaded at runtime
        import(templateModulePath).then(module => {
          const templateExport = module.default || Object.values(module)[0];
          
          if (templateExport && typeof templateExport === 'object') {
            const template = templateExport as PromptTemplate;
            
            // Validate the template
            const isValid = validateTemplate(template);
            if (isValid) {
              this.templates.set(template.id, template);
              console.log(`Loaded template: ${template.id} from filesystem`);
            } else {
              console.warn(`Invalid template found in ${file}, skipping`);
            }
          } else {
            console.warn(`No valid template export found in ${file}, skipping`);
          }
        }).catch(err => {
          console.error(`Error importing template ${file}:`, err);
        });
      } catch (error) {
        console.error(`Error loading template from ${file}:`, error);
      }
    }
  }
  
  /**
   * Load templates from database
   */
  private async loadTemplatesFromDatabase(): Promise<void> {
    try {
      const dbTemplates = await templateRepository.getAllTemplates();
      
      for (const template of dbTemplates) {
        // Validate the template
        const isValid = validateTemplate(template);
        if (isValid) {
          // Database templates override filesystem templates with the same ID
          this.templates.set(template.id, template);
          console.log(`Loaded template: ${template.id} from database`);
        } else {
          console.warn(`Invalid template found in database with ID ${template.id}, skipping`);
        }
      }
    } catch (error) {
      console.error('Error loading templates from database:', error);
    }
  }
  
  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<PromptTemplate | null> {
    // Check in-memory cache first
    if (this.templates.has(id)) {
      return this.templates.get(id) || null;
    }
    
    // If not found and database is enabled, try loading from database
    if (this.useDatabase) {
      try {
        const template = await templateRepository.getTemplate(id);
        if (template) {
          const isValid = validateTemplate(template);
          if (isValid) {
            this.templates.set(id, template);
            return template;
          }
        }
      } catch (error) {
        console.error(`Error getting template ${id} from database:`, error);
      }
    }
    
    return null;
  }
  
  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<PromptTemplate[]> {
    // Force a refresh from database if enabled
    if (this.useDatabase) {
      await this.loadTemplatesFromDatabase();
    }
    
    return Array.from(this.templates.values());
  }
  
  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: PromptCategory): Promise<PromptTemplate[]> {
    // Force a refresh from database if enabled
    if (this.useDatabase) {
      try {
        const templates = await templateRepository.getTemplatesByCategory(category.toString());
        
        // Update the in-memory cache with any new templates
        for (const template of templates) {
          if (validateTemplate(template)) {
            this.templates.set(template.id, template);
          }
        }
      } catch (error) {
        console.error(`Error getting templates for category ${category} from database:`, error);
      }
    }
    
    // Return all templates from the in-memory cache that match the category
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }
  
  /**
   * Save a template to the database
   */
  async saveTemplate(template: PromptTemplate): Promise<boolean> {
    // Validate the template before saving
    const isValid = validateTemplate(template);
    if (!isValid) {
      console.error('Template validation failed, not saving');
      return false;
    }
    
    // Update the in-memory cache
    this.templates.set(template.id, template);
    
    // Save to database if enabled
    if (this.useDatabase) {
      try {
        return await templateRepository.saveTemplate(template);
      } catch (error) {
        console.error('Error saving template to database:', error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generate a prompt from a template and context
   */
  async generatePrompt(
    templateId: string, 
    context: Record<string, any>, 
    placeholderValues?: Record<string, string>
  ): Promise<string | null> {
    const template = await this.getTemplate(templateId);
    
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return null;
    }
    
    try {
      return assemblePrompt(template, context, placeholderValues || {});
    } catch (error) {
      console.error(`Error generating prompt from template ${templateId}:`, error);
      return null;
    }
  }
  
  /**
   * Render a template directly with the given context
   */
  async renderTemplate(
    template: PromptTemplate,
    context: Record<string, any>
  ): Promise<string> {
    try {
      const result = assemblePrompt(template, context, {});
      
      // Record template usage
      if (this.useDatabase) {
        try {
          await this.recordTemplateUsage(
            template.id,
            'direct',
            'none',
            true,
            0
          );
        } catch (error) {
          console.warn(`Error recording template usage for ${template.id}:`, error);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error rendering template ${template.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Record template usage for analytics
   */
  async recordTemplateUsage(
    templateId: string, 
    provider: string, 
    model: string,
    success: boolean,
    latencyMs: number,
    tokenCount?: number
  ): Promise<boolean> {
    if (this.useDatabase) {
      return await templateRepository.recordTemplateUsage(
        templateId, 
        provider, 
        model, 
        success, 
        latencyMs, 
        tokenCount
      );
    }
    
    return true;
  }
}

// Export singleton instance
export const templateManager = TemplateManager.getInstance();

export default templateManager; 