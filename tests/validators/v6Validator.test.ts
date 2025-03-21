import { validatePineScript, ValidationResult } from '../../src/validators/syntaxValidator.js';

describe('PineScript v6 Syntax Validator', () => {
  it('should detect v6 method syntax errors', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Incorrect method syntax
myMethod(x) => x * 2

// Usage
result = myMethod(5)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes("use 'method' keyword"))).toBe(true);
  });
  
  it('should detect deprecated varip usage', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Using deprecated varip
varip counter = 0
counter := counter + 1
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes("'varip' keyword is deprecated"))).toBe(true);
  });
  
  it('should warn about missing function return types', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Missing return type
fn calculateValue(price)
    value = price * 1.5
    value
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.warnings.some(warning => warning.includes("function declarations should include return type"))).toBe(true);
  });
  
  it('should warn about var usage without mutable assignment', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Should use let instead of var for immutable variable
var price = close
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.warnings.some(warning => warning.includes("consider using 'let' for non-mutable variables"))).toBe(true);
  });
  
  it('should warn about non-named parameters', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Should use named parameters
plot(close, "Price", color.blue)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.warnings.some(warning => warning.includes("consider using named parameters"))).toBe(true);
  });
  
  it('should warn about missing imports', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

// Missing imports
rsi = ta.rsi(close, 14)
plot(rsi, "RSI")
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.warnings.some(warning => warning.includes("using imports for standard libraries"))).toBe(true);
  });
  
  it('should validate correct v6 script', () => {
    // Given
    const script = `//@version=6
indicator("V6 Test")

import ta

// Correct function with return type
fn calculateRSI(price, length) -> float
    rsiValue = ta.rsi(price, length)
    rsiValue

// Correct variable declarations
let length = 14
var mutableValue = 0
mutableValue := mutableValue + 1

// Method declaration
method calculateAverage(length) {
    avg = ta.sma(close, length)
    avg
}

// Named parameters
plot(series=calculateRSI(close, length), title="RSI", color=color.purple)
`;
    
    // When
    const result: ValidationResult = validatePineScript(script, 'v6');
    
    // Then
    expect(result.errors).toEqual([]);
    // There might still be some warnings, but there should be no errors
    expect(result.valid).toBe(true);
  });
}); 