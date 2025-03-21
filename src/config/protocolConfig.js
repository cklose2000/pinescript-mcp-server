/**
 * Protocol Configuration
 * 
 * Contains configuration settings for the MCP protocol
 */

/**
 * Default protocol configuration settings
 */
export const DEFAULT_PROTOCOL_CONFIG = {
  /**
   * Timeout in milliseconds for MCP requests
   * Default value is increased to 5 minutes (300000ms) from the SDK default of 60 seconds
   */
  timeout: 300000
}; 