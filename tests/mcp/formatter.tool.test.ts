/**
 * Tests for PineScript formatter MCP tool
 */

import { jest } from '@jest/globals';
import { formatPineScript } from '../../src/utils/formatter.js';
import { validatePineScript } from '../../src/validators/syntaxValidator.js';

// Mock the formatter and validator
jest.mock('../../src/utils/formatter.js');
jest.mock('../../src/validators/syntaxValidator.js');

describe('Format PineScript Tool', () => {
  let formatTool: any;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock the formatter implementation
    (formatPineScript as jest.Mock).mockImplementation((script, options) => {
      return {
        formatted: script + '\n// Formatted',
        changes: ['Standardized indentation', 'Added spaces around operators'],
        warnings: options.maxLineLength === 60 ? ['Line 1 exceeds maximum line length'] : []
      };
    });
    
    // Mock the validator implementation
    (validatePineScript as jest.Mock).mockImplementation((script) => {
      return {
        valid: true,
        warnings: [],
        errors: []
      };
    });
    
    // Import modules that use the mocked functions
    const { default: registerMCPTools } = await import('../../src/index.js');
    
    // Create a mock MCP instance
    const mcp = {
      addTool: jest.fn((config) => {
        if (config.name === 'format_pinescript') {
          formatTool = config;
        }
      })
    };
    
    // Register the tools
    await registerMCPTools(mcp as any);
  });
  
  it('should register the format_pinescript tool', () => {
    expect(formatTool).toBeDefined();
    expect(formatTool.name).toBe('format_pinescript');
    expect(formatTool.description).toContain('Format PineScript');
  });
  
  it('should format script with default options', async () => {
    const script = `//@version=5
indicator("My Indicator")
a=1+2
plot(a)`;
    
    const result = await formatTool.execute({ script });
    const parsedResult = JSON.parse(result);
    
    expect(formatPineScript).toHaveBeenCalledWith(script, expect.any(Object));
    expect(parsedResult.formatted).toContain('// Formatted');
    expect(parsedResult.changes).toContain('Standardized indentation');
    expect(parsedResult.valid).toBe(true);
  });
  
  it('should pass custom formatting options', async () => {
    const script = `//@version=5
indicator("My Indicator")
a=1+2
plot(a)`;
    
    const options = {
      script,
      indent_size: 2,
      use_spaces: false,
      spaces_around_operators: true,
      max_line_length: 60
    };
    
    const result = await formatTool.execute(options);
    const parsedResult = JSON.parse(result);
    
    expect(formatPineScript).toHaveBeenCalledWith(script, expect.objectContaining({
      indentSize: 2,
      useSpaces: false,
      maxLineLength: 60
    }));
    
    expect(parsedResult.warnings).toContain('Line 1 exceeds maximum line length');
  });
  
  it('should validate the formatted script', async () => {
    const script = `//@version=5
indicator("My Indicator")
a=1+2
plot(a)`;
    
    // Mock validator to return warnings
    (validatePineScript as jest.Mock).mockReturnValueOnce({
      valid: true,
      warnings: ['Consider using let instead of var for initialization'],
      errors: []
    });
    
    const result = await formatTool.execute({ script });
    const parsedResult = JSON.parse(result);
    
    expect(validatePineScript).toHaveBeenCalled();
    expect(parsedResult.validation_warnings).toHaveLength(1);
    expect(parsedResult.validation_warnings[0]).toContain('let instead of var');
  });
  
  it('should handle validation errors in formatted script', async () => {
    const script = `//@version=5
indicator("My Indicator")
a=1+2
plot(a)`;
    
    // Mock validator to return errors
    (validatePineScript as jest.Mock).mockReturnValueOnce({
      valid: false,
      warnings: [],
      errors: ['Unexpected syntax error']
    });
    
    const result = await formatTool.execute({ script });
    const parsedResult = JSON.parse(result);
    
    expect(validatePineScript).toHaveBeenCalled();
    expect(parsedResult.valid).toBe(false);
    expect(parsedResult.validation_errors).toHaveLength(1);
    expect(parsedResult.validation_errors[0]).toBe('Unexpected syntax error');
  });
}); 