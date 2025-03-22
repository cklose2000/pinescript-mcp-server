/**
 * Supabase Client for PineScript MCP
 * 
 * This module provides a Supabase client for database operations, including
 * template storage, user management, and analytics.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config/userConfig.js';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || config.databases?.supabase?.url || '';
const supabaseKey = process.env.SUPABASE_API_KEY || config.databases?.supabase?.apiKey || '';

// Validate required configuration
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase configuration missing. Some features may not work properly.');
}

// Create client with error handling
let supabaseClient: any = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
    });
    console.log('Supabase client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

/**
 * Check if the Supabase client is available and connected
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  if (!supabaseClient) {
    return false;
  }
  
  try {
    // Simple health check query
    const { error } = await supabaseClient.from('health').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is fine for this check
      console.warn('Supabase connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in Supabase health check:', error);
    return false;
  }
}

/**
 * Get the Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase client is not initialized');
  }
  return supabaseClient;
}

// Export default client
export default supabaseClient; 