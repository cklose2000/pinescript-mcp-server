import { validatePineScript, ValidationResult } from '../../src/validators/syntaxValidator.js';

describe('PineScript Syntax Validator', () => {
  it('should return a valid result for correct script', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator", overlay=true)

// Input parameters
length = input(14, "RSI Length")

// Calculate indicator
rsiValue = ta.rsi(close, length)

// Execute logic
if (rsiValue > 70)
    label.new(bar_index, high, "Overbought")
else if (rsiValue < 30)
    label.new(bar_index, low, "Oversold")

// Plot indicator
plot(rsiValue, "RSI", color.purple)
hline(70, "Overbought", color.red)
hline(30, "Oversold", color.green)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
  
  it('should detect empty script', () => {
    // Given
    const script = '';
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Script cannot be empty');
  });
  
  it('should detect version mismatch', () => {
    // Given
    const script = '//@version=5\nindicator("Test")\n';
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v4');
    
    // Then
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Script uses version');
  });

  it('should detect unbalanced parentheses', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator", overlay=true

length = input(14, "RSI Length")
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('Unbalanced parentheses'))).toBe(true);
  });

  it('should detect unclosed string literal', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator, overlay=true)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('Unclosed string literal'))).toBe(true);
  });

  it('should detect deprecated study() function in v5', () => {
    // Given
    const script = `//@version=5
study("Test Study", overlay=true)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.warnings.some(warning => warning.includes("'study()' is deprecated"))).toBe(true);
  });

  it('should detect incorrect variable export syntax', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator")
export var myVar = 10
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('Incorrect variable export syntax'))).toBe(true);
  });

  it('should detect missing comma in function call', () => {
    // Given
    const script = `//@version=5
indicator("Test Indicator")
length = input(14 "RSI Length")
`;
    
    // When
    const result: ValidationResult = validatePineScript(script);
    
    // Then
    expect(result.warnings.some(warning => warning.includes('Possible missing comma'))).toBe(true);
  });
}); 