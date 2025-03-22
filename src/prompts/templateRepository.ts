/**
 * Template Repository
 * 
 * Provides functionality for storing and retrieving prompt templates
 * from Supabase database.
 */

import { PromptTemplate } from './templateStructure.js';
import { getSupabaseClient, isSupabaseAvailable } from '../db/supabaseClient.js';
import { config } from '../config/userConfig.js';

// Template schema for database
interface TemplateDbRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  sections: string; // JSON string of sections
  placeholders: string; // JSON string of placeholders
  defaultModel?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_active: boolean;
}

// Template version schema for database
interface TemplateVersionRecord {
  id: string;
  template_id: string;
  version: string;
  sections: string; // JSON string of sections
  created_at?: string;
  created_by?: string;
  notes?: string;
}

// Template usage schema for database
interface TemplateUsageRecord {
  id?: string;
  template_id: string;
  provider: string;
  model: string;
  success: boolean;
  latency: number;
  token_count?: number;
  created_at?: string;
}

/**
 * Convert a template to a database record
 */
function templateToDbRecord(template: PromptTemplate): TemplateDbRecord {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    version: template.version || '1.0.0',
    sections: JSON.stringify(template.sections),
    placeholders: JSON.stringify(template.placeholders || []),
    defaultModel: template.defaultModel,
    is_active: true
  };
}

/**
 * Convert a database record to a template
 */
function dbRecordToTemplate(record: TemplateDbRecord): PromptTemplate {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    category: record.category as any, // Cast to PromptCategory enum
    version: record.version,
    sections: JSON.parse(record.sections),
    placeholders: JSON.parse(record.placeholders),
    defaultModel: record.defaultModel
  };
}

/**
 * Template Repository class for database operations
 */
export class TemplateRepository {
  private static instance: TemplateRepository;
  private templatesTable: string;
  private versionsTable: string;
  private usageTable: string;
  private isAvailable: boolean = false;
  
  private constructor() {
    this.templatesTable = config.databases?.supabase?.tables?.templates || 'templates';
    this.versionsTable = config.databases?.supabase?.tables?.templateVersions || 'template_versions';
    this.usageTable = config.databases?.supabase?.tables?.templateUsage || 'template_usage';
    this.checkAvailability();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): TemplateRepository {
    if (!TemplateRepository.instance) {
      TemplateRepository.instance = new TemplateRepository();
    }
    return TemplateRepository.instance;
  }
  
  /**
   * Check if the database is available
   */
  private async checkAvailability(): Promise<boolean> {
    if (!config.databases?.supabase?.enabled) {
      console.log('Supabase template storage is disabled');
      this.isAvailable = false;
      return false;
    }
    
    try {
      this.isAvailable = await isSupabaseAvailable();
      if (!this.isAvailable) {
        console.warn('Supabase is not available, template repository will operate in local-only mode');
      } else {
        console.log('Supabase template repository initialized successfully');
      }
      return this.isAvailable;
    } catch (error) {
      console.error('Error checking Supabase availability:', error);
      this.isAvailable = false;
      return false;
    }
  }
  
  /**
   * Save a template to the database
   */
  async saveTemplate(template: PromptTemplate): Promise<boolean> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to save template to database, Supabase is not available');
        return false;
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const record = templateToDbRecord(template);
      
      // Get current time for version tracking
      const now = new Date().toISOString();
      
      // Create or update the template
      const { error } = await supabase
        .from(this.templatesTable)
        .upsert(
          { 
            ...record,
            updated_at: now
          },
          { onConflict: 'id' }
        );
      
      if (error) {
        console.error('Error saving template:', error);
        return false;
      }
      
      // Create a version record
      const versionRecord: TemplateVersionRecord = {
        id: `${template.id}-${template.version || '1.0.0'}`,
        template_id: template.id,
        version: template.version || '1.0.0',
        sections: record.sections,
        created_at: now,
        notes: 'Automatic version save'
      };
      
      const { error: versionError } = await supabase
        .from(this.versionsTable)
        .upsert(versionRecord, { onConflict: 'id' });
      
      if (versionError) {
        console.warn('Error saving template version:', versionError);
        // Continue anyway as the main template was saved
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveTemplate:', error);
      return false;
    }
  }
  
  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<PromptTemplate | null> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to get template from database, Supabase is not available');
        return null;
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.templatesTable)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error getting template:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return dbRecordToTemplate(data as TemplateDbRecord);
    } catch (error) {
      console.error('Error in getTemplate:', error);
      return null;
    }
  }
  
  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<PromptTemplate[]> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to get templates from database, Supabase is not available');
        return [];
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.templatesTable)
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error getting templates:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map((record: TemplateDbRecord) => dbRecordToTemplate(record));
    } catch (error) {
      console.error('Error in getAllTemplates:', error);
      return [];
    }
  }
  
  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<PromptTemplate[]> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to get templates from database, Supabase is not available');
        return [];
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.templatesTable)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error getting templates by category:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map((record: TemplateDbRecord) => dbRecordToTemplate(record));
    } catch (error) {
      console.error('Error in getTemplatesByCategory:', error);
      return [];
    }
  }
  
  /**
   * Delete a template (mark as inactive)
   */
  async deleteTemplate(id: string): Promise<boolean> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to delete template from database, Supabase is not available');
        return false;
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(this.templatesTable)
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting template:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      return false;
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
    // Skip if analytics are disabled
    if (!config.analytics?.enabled || !config.analytics?.trackTemplateUsage) {
      return true;
    }
    
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        // Not critical, just log and continue
        console.debug('Unable to record template usage, Supabase is not available');
        return false;
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const usage: TemplateUsageRecord = {
        template_id: templateId,
        provider,
        model,
        success,
        latency: latencyMs,
        token_count: tokenCount,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from(this.usageTable)
        .insert(usage);
      
      if (error) {
        console.warn('Error recording template usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Error in recordTemplateUsage:', error);
      return false;
    }
  }
  
  /**
   * Get template versions
   */
  async getTemplateVersions(templateId: string): Promise<TemplateVersionRecord[]> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        console.warn('Unable to get template versions from database, Supabase is not available');
        return [];
      }
    }
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.versionsTable)
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting template versions:', error);
        return [];
      }
      
      return data as TemplateVersionRecord[] || [];
    } catch (error) {
      console.error('Error in getTemplateVersions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const templateRepository = TemplateRepository.getInstance();

export default templateRepository; 