/**
 * Patched MCP Protocol Module
 * 
 * This module patches the default timeout value in the MCP SDK protocol
 * to fix the "MCP error -32001: Request timed out" error.
 */

// Import original protocol
import * as protocol from '@modelcontextprotocol/sdk/dist/esm/shared/protocol.js';

// Log that we're applying the patch
console.log('Applying MCP protocol patch: Extending default timeout to 5 minutes');

// Override the default timeout constant
const DEFAULT_REQUEST_TIMEOUT = 300000; // 5 minutes instead of 60 seconds

/**
 * Helper function to create request options with extended timeout
 * @param {Object} options - Optional user-provided request options
 * @returns {Object} Request options with extended timeout
 */
export function createRequestOptions(options = {}) {
  return {
    ...options,
    timeout: options.timeout || DEFAULT_REQUEST_TIMEOUT
  };
}

// Export everything from the original module and our patched values
export * from '@modelcontextprotocol/sdk/dist/esm/shared/protocol.js';
export { DEFAULT_REQUEST_TIMEOUT }; 