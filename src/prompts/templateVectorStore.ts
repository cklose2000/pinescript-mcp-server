/**
 * Template Vector Store
 * 
 * This module integrates the template manager with the vector store
 * for semantic search capabilities.
 */

import { PromptTemplate, PromptCategory } from './templateStructure.js';
import { templateManager } from './templateManager.js';
import vectorStore from '../db/vector/vectorStore.js';
import { config } from '../config/userConfig.js';
import { isSupabaseAvailable } from '../db/supabaseClient.js';

/**
 * Generate content for embedding from a template
 * This combines the most semantically relevant parts of the template
 * @param template Template to generate embedding content from
 * @returns Processed text content for embedding
 */
function generateTemplateContent(template: PromptTemplate): string {
  // Combine the most relevant parts of the template for embedding
  const parts = [
    template.name,
    template.description,
    template.category,
    // Add section content that's most descriptive of the template purpose
    template.sections
      .filter(section => section.id !== 'examples' && section.id !== 'constraints')
      .map(section => section.content)
      .join(' '),
    // Add placeholders as they help identify what data the template needs
    (template.placeholders || []).join(', ')
  ];
  
  return parts.join(' ');
}

/**
 * Create metadata for the template embedding
 * @param template Template to generate metadata for
 * @returns Metadata object
 */
function createTemplateMetadata(template: PromptTemplate): Record<string, any> {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    version: template.version || '1.0.0',
    placeholders: template.placeholders || [],
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
}

/**
 * Store a template in the vector store
 * @param template Template to store
 * @returns Boolean indicating success
 */
export async function storeTemplateEmbedding(template: PromptTemplate): Promise<boolean> {
  if (!config.databases?.supabase?.enabled) {
    console.warn('Supabase is not enabled, skipping template embedding storage');
    return false;
  }
  
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for template embedding storage');
    return false;
  }
  
  try {
    // Generate content for embedding
    const content = generateTemplateContent(template);
    
    // Generate embedding from the content
    const embedding = await vectorStore.generateEmbedding(content);
    
    if (!embedding) {
      console.error(`Failed to generate embedding for template: ${template.id}`);
      return false;
    }
    
    // Create metadata object
    const metadata = createTemplateMetadata(template);
    
    // Store the embedding
    const result = await vectorStore.storeEmbedding(
      `template:${template.id}:v${template.version || '1.0.0'}`,
      content,
      embedding,
      metadata
    );
    
    if (result) {
      console.log(`Successfully stored embedding for template: ${template.id}`);
    } else {
      console.error(`Failed to store embedding for template: ${template.id}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error storing template embedding:', error);
    return false;
  }
}

/**
 * Find templates similar to the query
 * @param query The search query
 * @param options Search options
 * @returns Array of matching templates with similarity scores
 */
export async function findSimilarTemplates(
  query: string,
  options: {
    category?: PromptCategory;
    threshold?: number;
    limit?: number;
  } = {}
): Promise<Array<{
  template: PromptTemplate;
  similarity: number;
}>> {
  if (!config.databases?.supabase?.enabled) {
    console.warn('Supabase is not enabled, skipping template similarity search');
    return [];
  }
  
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for template similarity search');
    return [];
  }
  
  try {
    // Create filters
    const filters: Record<string, any> = {};
    
    if (options.category) {
      filters['metadata.category'] = options.category;
    }
    
    // Create search config
    const searchConfig = {
      matchThreshold: options.threshold || 0.75,
      maxResults: options.limit || 10
    };
    
    // Perform search
    const results = await vectorStore.similaritySearch(query, filters, searchConfig);
    
    // Convert results to template objects
    const templateResults = await Promise.all(
      results.map(async result => {
        const templateId = result.metadata.id as string;
        const template = await templateManager.getTemplate(templateId);
        
        return {
          template: template!,
          similarity: result.similarity
        };
      })
    );
    
    // Filter out any null templates
    return templateResults.filter(result => result.template !== null);
  } catch (error) {
    console.error('Error finding similar templates:', error);
    return [];
  }
}

/**
 * Embed all templates in the template manager
 * @returns Number of successfully embedded templates
 */
export async function embedAllTemplates(): Promise<number> {
  if (!config.databases?.supabase?.enabled) {
    console.warn('Supabase is not enabled, skipping embedding all templates');
    return 0;
  }
  
  try {
    // Initialize vector store
    const initialized = await vectorStore.initializeVectorStore();
    
    if (!initialized) {
      console.error('Failed to initialize vector store');
      return 0;
    }
    
    // Get all templates
    const templates = await templateManager.getAllTemplates();
    
    if (templates.length === 0) {
      console.warn('No templates found for embedding');
      return 0;
    }
    
    console.log(`Embedding ${templates.length} templates...`);
    
    // Track success count
    let successCount = 0;
    
    // Process each template
    for (const template of templates) {
      const success = await storeTemplateEmbedding(template);
      
      if (success) {
        successCount++;
      }
    }
    
    console.log(`Successfully embedded ${successCount} of ${templates.length} templates`);
    return successCount;
  } catch (error) {
    console.error('Error embedding all templates:', error);
    return 0;
  }
}

/**
 * Search for templates by description, usage scenario, or other semantic criteria
 * @param query Search query
 * @param options Search options
 * @returns Matching templates with similarity scores
 */
export async function semanticTemplateSearch(
  query: string,
  options: {
    category?: PromptCategory;
    threshold?: number;
    limit?: number;
  } = {}
): Promise<Array<{
  template: PromptTemplate;
  similarity: number;
}>> {
  try {
    return await findSimilarTemplates(query, options);
  } catch (error) {
    console.error('Error in semantic template search:', error);
    return [];
  }
}

// Export default object
export default {
  embedAllTemplates,
  storeTemplateEmbedding,
  semanticTemplateSearch,
  findSimilarTemplates
}; 