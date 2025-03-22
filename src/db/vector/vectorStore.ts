/**
 * Vector Store for Supabase
 * 
 * This module provides vector embedding storage and similarity search capabilities
 * using Supabase's pgvector extension.
 */

import { getSupabaseClient, isSupabaseAvailable } from '../supabaseClient.js';
import { config } from '../../config/userConfig.js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI for embeddings generation
let openai: OpenAI | null = null;
const openaiApiKey = process.env.OPENAI_API_KEY || config.llm?.openai?.apiKey || '';

if (openaiApiKey) {
  try {
    openai = new OpenAI({
      apiKey: openaiApiKey,
    });
  } catch (error) {
    console.error('Error initializing OpenAI client for embeddings:', error);
  }
}

// Initialize Anthropic for embeddings (fallback)
let anthropic: Anthropic | null = null;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || config.llm?.anthropic?.apiKey || '';

if (anthropicApiKey) {
  try {
    anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
  } catch (error) {
    console.error('Error initializing Anthropic client for embeddings:', error);
  }
}

/**
 * Vector store configuration
 */
interface VectorStoreConfig {
  table: string;
  embeddingColumn: string;
  matchThreshold: number;
  maxResults: number;
  defaultModel: string;
}

// Default configuration
const defaultConfig: VectorStoreConfig = {
  table: 'template_embeddings',
  embeddingColumn: 'embedding',
  matchThreshold: 0.75,
  maxResults: 10,
  defaultModel: 'text-embedding-3-small'
};

// Merge with user config if available
const vectorConfig = {
  ...defaultConfig,
  ...(config.databases?.supabase?.vectorConfig || {})
};

/**
 * Generate embeddings for text content using OpenAI or Anthropic
 * @param text Text content to generate embeddings for
 * @param model Embedding model to use (default: text-embedding-3-small)
 * @returns Vector embedding as array of numbers
 */
export async function generateEmbedding(
  text: string,
  model: string = vectorConfig.defaultModel
): Promise<number[] | null> {
  // Clean and prepare the text
  const cleanText = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!cleanText) {
    console.warn('Empty text provided for embedding generation');
    return null;
  }
  
  try {
    // Try OpenAI first
    if (openai) {
      const response = await openai.embeddings.create({
        model: model,
        input: cleanText,
        encoding_format: 'float'
      });
      
      if (response && response.data && response.data[0].embedding) {
        return response.data[0].embedding;
      }
    }
    
    // Fallback to Anthropic if OpenAI fails or isn't available
    if (anthropic) {
      // Note: This is a placeholder as Anthropic's embedding API usage may vary
      // Update this with the correct Anthropic embedding API call once available
      console.warn('Fallback to Anthropic embeddings not implemented yet');
    }
    
    console.error('Failed to generate embeddings with available providers');
    return null;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return null;
  }
}

/**
 * Store embeddings in Supabase
 * @param id Unique identifier for the item
 * @param content Text content that was embedded
 * @param embedding Vector embedding
 * @param metadata Additional metadata to store
 * @returns Boolean indicating success
 */
export async function storeEmbedding(
  id: string,
  content: string,
  embedding: number[],
  metadata: Record<string, any> = {}
): Promise<boolean> {
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for storing embeddings');
    return false;
  }
  
  const supabase = getSupabaseClient();
  
  try {
    // First check if the record already exists
    const { data: existingData, error: queryError } = await supabase
      .from(vectorConfig.table)
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (queryError) {
      console.error('Error checking for existing embedding:', queryError);
      return false;
    }
    
    let result;
    
    if (existingData) {
      // Update existing record
      result = await supabase
        .from(vectorConfig.table)
        .update({
          content,
          [vectorConfig.embeddingColumn]: embedding,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } else {
      // Insert new record
      result = await supabase
        .from(vectorConfig.table)
        .insert({
          id,
          content,
          [vectorConfig.embeddingColumn]: embedding,
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    const { error } = result;
    
    if (error) {
      console.error('Error storing embedding in Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in storeEmbedding:', error);
    return false;
  }
}

/**
 * Perform a similarity search using vector embeddings
 * @param query Text query to search for similar content
 * @param filters Additional filters to apply to the search
 * @param config Search configuration options
 * @returns Array of matching items with similarity scores
 */
export async function similaritySearch(
  query: string,
  filters: Record<string, any> = {},
  config: Partial<VectorStoreConfig> = {}
): Promise<Array<{
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}>> {
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for similarity search');
    return [];
  }
  
  // Generate embedding for the query
  const embedding = await generateEmbedding(query);
  
  if (!embedding) {
    console.error('Failed to generate embeddings for query');
    return [];
  }
  
  const supabase = getSupabaseClient();
  const searchConfig = { ...vectorConfig, ...config };
  
  try {
    // Build the query
    let queryBuilder = supabase
      .from(searchConfig.table)
      .select(`
        id,
        content,
        metadata,
        similarity:1 - (${searchConfig.embeddingColumn} <=> $1) as similarity
      `)
      .gte('similarity', searchConfig.matchThreshold)
      .order('similarity', { ascending: false })
      .limit(searchConfig.maxResults);
    
    // Add any additional filters
    for (const [key, value] of Object.entries(filters)) {
      if (key.startsWith('metadata.')) {
        // Handle nested metadata filters
        const metadataKey = key.replace('metadata.', '');
        queryBuilder = queryBuilder.filter('metadata->>'+metadataKey, 'eq', value);
      } else {
        // Handle regular column filters
        queryBuilder = queryBuilder.eq(key, value);
      }
    }
    
    // Execute the query with the embedding as a parameter
    const { data, error } = await queryBuilder.bind([embedding]);
    
    if (error) {
      console.error('Error performing similarity search:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in similaritySearch:', error);
    return [];
  }
}

/**
 * Delete an embedding from the vector store
 * @param id ID of the embedding to delete
 * @returns Boolean indicating success
 */
export async function deleteEmbedding(id: string): Promise<boolean> {
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for deleting embeddings');
    return false;
  }
  
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase
      .from(vectorConfig.table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting embedding:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteEmbedding:', error);
    return false;
  }
}

/**
 * Check if the vector store table exists and create it if needed
 * @returns Boolean indicating if the store is ready
 */
export async function initializeVectorStore(): Promise<boolean> {
  if (!await isSupabaseAvailable()) {
    console.error('Supabase is not available for vector store initialization');
    return false;
  }
  
  const supabase = getSupabaseClient();
  
  try {
    // Check if the pgvector extension is installed
    const { error: extensionError } = await supabase.rpc('check_pgvector');
    
    if (extensionError) {
      // Try to create the extension
      console.log('Trying to create pgvector extension...');
      const { error: createExtensionError } = await supabase.rpc('create_pgvector_extension');
      
      if (createExtensionError) {
        console.error('Failed to create pgvector extension:', createExtensionError);
        return false;
      }
    }
    
    // Check if the table exists by querying it
    const { error: tableCheckError } = await supabase
      .from(vectorConfig.table)
      .select('id')
      .limit(1);
    
    // Table doesn't exist or has wrong structure, create it
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log(`Creating vector store table ${vectorConfig.table}...`);
      
      // Create the table through RPC
      const { error: createTableError } = await supabase.rpc('create_embeddings_table', {
        table_name: vectorConfig.table,
        embedding_column: vectorConfig.embeddingColumn
      });
      
      if (createTableError) {
        console.error('Failed to create vector store table:', createTableError);
        return false;
      }
    } else if (tableCheckError) {
      console.error('Error checking vector store table:', tableCheckError);
      return false;
    }
    
    console.log('Vector store initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    return false;
  }
}

// Export the module
export default {
  generateEmbedding,
  storeEmbedding,
  similaritySearch,
  deleteEmbedding,
  initializeVectorStore
}; 