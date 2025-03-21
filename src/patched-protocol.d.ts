/**
 * TypeScript declarations for patched-protocol.js
 */

// Re-export everything from the original protocol module
export * from '@modelcontextprotocol/sdk/dist/esm/shared/protocol.js';

/**
 * Custom timeout value that overrides the default in the MCP SDK
 * Set to 5 minutes (300000ms) instead of the default 60 seconds
 */
export const DEFAULT_REQUEST_TIMEOUT: number;

/**
 * Helper function to create request options with the extended timeout
 * @param options - Optional user-provided request options
 * @returns Request options with extended timeout
 */
export function createRequestOptions(options?: Record<string, any>): Record<string, any>; 