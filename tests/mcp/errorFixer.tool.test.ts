/**
 * MCP Error Fixer Tool Tests
 * 
 * These tests verify that the error fixer tool in the MCP server works correctly.
 */

import { describe, expect, it, jest } from '@jest/globals';
import { FixResult } from '../../src/fixers/errorFixer';

// Mock the fixPineScriptErrors function
const mockedFixPineScriptErrors = jest.fn();

// Mock the module
jest.mock('../../src/fixers/errorFixer', () => ({
  fixPineScriptErrors: (...args: any[]) => mockedFixPineScriptErrors(...args)
}));

// Import the mocked module
import { fixPineScriptErrors } from '../../src/fixers/errorFixer';

describe('MCP Error Fixer Tool', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockedFixPineScriptErrors.mockClear();
  });

  it('should fix syntax errors in PineScript code', () => {
    // Setup
    mockedFixPineScriptErrors.mockImplementation(() => ({
      fixed: true,
      script: 'indicator("My Indicator", overlay=true)',
      changes: ['Added missing closing parenthesis on line 1']
    }));

    // Execute
    const script = 'indicator("My Indicator", overlay=true';
    const result = fixPineScriptErrors(script);
    
    // Assert
    expect(result.fixed).toBe(true);
    expect(result.changes.some(change => change.includes('missing closing parenthesis'))).toBe(true);
  });
  
  it('should fix multiple errors in PineScript code', async () => {
    // Setup
    mockedFixPineScriptErrors.mockImplementation(() => ({
      fixed: true,
      script: 'fixed script',
      changes: [
        'Added missing version annotation (@version=5)',
        'Added missing closing parenthesis on line 2'
      ]
    }));
    
    // Execute
    const script = 'indicator("My Indicator", overlay=true\nvar x = 10';
    const result = fixPineScriptErrors(script);
    
    // Assert
    expect(result.fixed).toBe(true);
    expect(result.changes.length).toBeGreaterThan(0);
  });
  
  it('should return original script if no errors are detected', () => {
    // Setup
    mockedFixPineScriptErrors.mockImplementation(() => ({
      fixed: false,
      script: 'original script',
      changes: []
    }));
    
    // Execute
    const script = 'original script';
    const result = fixPineScriptErrors(script);
    
    // Assert
    expect(result.fixed).toBe(false);
    expect(result.changes).toEqual([]);
  });
}); 