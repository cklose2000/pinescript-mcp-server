/**
 * Test Script for PineScript MCP Server
 * 
 * This module provides minimal scripts for testing MCP server connectivity
 */

/**
 * Minimal PineScript script that can be used to validate server connectivity
 * Intentionally simple to avoid timeout issues
 */
export const MINIMAL_TEST_SCRIPT = `//@version=5
indicator("Simple Test Indicator", overlay=true)

// Simple calculation
value = close

// Plot
plot(value, "Price", color=color.blue)
`;

/**
 * Returns the minimal test script
 * @returns A minimal PineScript indicator for testing
 */
export function getTestScript(): string {
  return MINIMAL_TEST_SCRIPT;
}

/**
 * Returns a minimal script with the specified version
 * @param version PineScript version to use
 * @returns A minimal PineScript script for the specified version
 */
export function getVersionedTestScript(version: string = "5"): string {
  return MINIMAL_TEST_SCRIPT.replace("//@version=5", `//@version=${version}`);
} 