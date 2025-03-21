/**
 * Protocol Configuration
 * 
 * This module provides configuration options for the MCP protocol
 * including default timeout settings that override the previous
 * 60 second timeout.
 */

/**
 * Default protocol configuration
 */
export const DEFAULT_PROTOCOL_CONFIG = {
  /**
   * Timeout for individual requests in milliseconds
   * Default is 300000 (5 minutes)
   */
  timeout: 300000, // 5 minutes
  
  /**
   * Whether progress notifications should reset the timeout
   * Default is true
   */
  resetTimeoutOnProgress: true,
  
  /**
   * Interval for ping requests in milliseconds
   * Default is 60000 (1 minute)
   */
  pingInterval: 60000, // 1 minute
  
  /**
   * Maximum ping attempts before giving up
   * Default is 3
   */
  maxPingAttempts: 3
};

/**
 * Validation specific configuration
 */
export const VALIDATION_CONFIG = {
  /**
   * Maximum time for validating a single script in milliseconds
   * Default is 180000 (3 minutes)
   */
  maxValidationTime: 180000, // 3 minutes
  
  /**
   * Interval for checking elapsed time during validation
   * Default is 500ms
   */
  validationCheckInterval: 500,
  
  /**
   * Maximum script size (in characters) before warning
   * Default is 10000 characters
   */
  maxScriptSizeWarningThreshold: 10000
}; 