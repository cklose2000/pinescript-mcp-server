/**
 * PineScript Syntax Validator
 * 
 * Basic validation of PineScript code for common syntax errors
 */

import { PineScriptVersion, detectVersion } from '../utils/versionDetector.js';

/**
 * Validates PineScript code for syntax errors
 * 
 * @param script The PineScript code to validate
 * @param version The PineScript version (v4, v5, v6)
 * @returns Validation result with status and messages
 */
export function validatePineScript(script: string, version: string = 'v5'): ValidationResult {
  // Default result
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!script || script.trim() === '') {
    result.valid = false;
    result.errors.push('Script cannot be empty');
    return result;
  }

  // Detect version from script if not explicitly provided
  const detectedVersion = detectVersion(script);
  const requestedVersion = version as PineScriptVersion;

  // Check if script version matches requested version
  if (detectedVersion !== requestedVersion && script.includes('//@version=')) {
    result.warnings.push(`Script uses version ${detectedVersion}, but validator was called with ${requestedVersion}`);
  }

  // Perform basic syntax checks
  try {
    validateBasicSyntax(script, result);
    
    // Perform version-specific validation
    if (detectedVersion === PineScriptVersion.V5) {
      validatePineScriptV5(script, result);
    } else if (detectedVersion === PineScriptVersion.V6) {
      validatePineScriptV6(script, result);
    }
  } catch (error) {
    result.valid = false;
    result.errors.push(`Unexpected validation error: ${(error as Error).message}`);
  }

  // Update valid flag based on errors
  result.valid = result.errors.length === 0;
  
  return result;
}

/**
 * Validates basic syntax that is common across all PineScript versions
 */
function validateBasicSyntax(script: string, result: ValidationResult): void {
  // Check for missing parentheses
  validateParenthesesBalance(script, result);
  
  // Check for missing quotes in strings
  validateStringQuotes(script, result);
  
  // Check for missing commas in function calls
  validateCommasInFunctionCalls(script, result);
}

/**
 * Validates PineScript v5 specific syntax
 */
function validatePineScriptV5(script: string, result: ValidationResult): void {
  // Check for variable declaration syntax
  const lines = script.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('//') || line === '') {
      continue;
    }
    
    // Check for deprecated study() function (should use indicator() in v5)
    if (line.includes('study(')) {
      result.warnings.push(`Line ${i + 1}: 'study()' is deprecated in v5, use 'indicator()' instead`);
    }
    
    // Check for incorrect variable export syntax
    if (line.includes('export var') || line.includes('export varip')) {
      result.errors.push(`Line ${i + 1}: Incorrect variable export syntax. Use 'export name = value' format`);
    }
  }
}

/**
 * Validates PineScript v6 specific syntax
 */
function validatePineScriptV6(script: string, result: ValidationResult): void {
  // Check for variable declaration and other v6 specific syntax
  const lines = script.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('//') || line === '') {
      continue;
    }
    
    // Check for deprecated study() function (should use indicator() in v6)
    if (line.includes('study(')) {
      result.warnings.push(`Line ${i + 1}: 'study()' is deprecated in v6, use 'indicator()' instead`);
    }
    
    // Check for incorrect variable export syntax
    if (line.includes('export var') || line.includes('export varip')) {
      result.errors.push(`Line ${i + 1}: Incorrect variable export syntax. Use 'export name = value' format`);
    }
    
    // v6 requires 'method' keyword instead of '=>' for methods
    if (line.match(/\s*\w+\s*\([^)]*\)\s*=>/)) {
      result.errors.push(`Line ${i + 1}: In v6, use 'method' keyword instead of '=>' for defining methods`);
    }
    
    // v6 doesn't support 'varip' keyword (it's replaced with 'var')
    if (line.match(/\bvarip\b/)) {
      result.errors.push(`Line ${i + 1}: 'varip' keyword is deprecated in v6, use 'var' instead`);
    }
    
    // v6 requires type declarations for functions
    if (line.match(/\bfn\s+\w+\s*\([^)]*\)/)) {
      if (!line.includes('->')) {
        result.warnings.push(`Line ${i + 1}: In v6, function declarations should include return type with '->'`);
      }
    }
    
    // v6 requires 'let' instead of 'var' for non-mutable variables
    if (line.includes('var ') && !line.match(/\bvar\s+\w+\s*=.*:=/)) {
      result.warnings.push(`Line ${i + 1}: In v6, consider using 'let' for non-mutable variables and 'var' for mutable ones with ':='`);
    }
    
    // v6 requires function calls to use named parameters
    if (line.match(/\b(plot|hline|strategy\.entry|label\.new)\s*\(/)) {
      // Count commas to estimate number of parameters
      const match = line.match(/\b(plot|hline|strategy\.entry|label\.new)\s*\(([^)]*)\)/);
      if (match) {
        const params = match[2];
        const commaCount = (params.match(/,/g) || []).length;
        
        // For functions with multiple parameters, check if any named parameters are used
        if (commaCount > 0 && !params.includes('=')) {
          result.warnings.push(`Line ${i + 1}: In v6, consider using named parameters for clarity (e.g., 'param_name = value')`);
        }
      }
    }
  }
  
  // Check for script structure (v6 requires specific imports)
  const hasImports = script.includes('import ');
  if (!hasImports) {
    result.warnings.push(`PineScript v6 encourages using imports for standard libraries (e.g., 'import ta')`);
  }
}

/**
 * Validates balanced parentheses
 */
function validateParenthesesBalance(script: string, result: ValidationResult): void {
  const stack: string[] = [];
  const pairs: Record<string, string> = {')': '(', ']': '[', '}': '{'};
  
  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    
    // Skip string literals
    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      while (i < script.length && script[i] !== quote) {
        if (script[i] === '\\') i++; // Skip escaped characters
        i++;
      }
      continue;
    }
    
    // Skip comments
    if (char === '/' && i + 1 < script.length) {
      if (script[i + 1] === '/') {
        // Skip to end of line
        while (i < script.length && script[i] !== '\n') i++;
        continue;
      }
      if (script[i + 1] === '*') {
        // Skip to end of comment
        i += 2;
        while (i < script.length && !(script[i - 1] === '*' && script[i] === '/')) i++;
        continue;
      }
    }
    
    if (['(', '[', '{'].includes(char)) {
      stack.push(char);
    } else if ([')', ']', '}'].includes(char)) {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
        result.errors.push(`Unbalanced parentheses: Unexpected '${char}'`);
        return;
      }
      stack.pop();
    }
  }
  
  if (stack.length > 0) {
    result.errors.push(`Unbalanced parentheses: Missing ${stack.length} closing bracket(s)`);
  }
}

/**
 * Validates string quotes
 */
function validateStringQuotes(script: string, result: ValidationResult): void {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let lineNumber = 1;

  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    
    if (char === '\n') {
      lineNumber++;
      // If we're in a quote at the end of a line, that's an error
      if (inSingleQuote || inDoubleQuote) {
        result.errors.push(`Line ${lineNumber - 1}: Unclosed string literal`);
        inSingleQuote = false;
        inDoubleQuote = false;
      }
      continue;
    }
    
    // Skip comments
    if (char === '/' && i + 1 < script.length && !inSingleQuote && !inDoubleQuote) {
      if (script[i + 1] === '/') {
        // Skip to end of line
        while (i < script.length && script[i] !== '\n') i++;
        if (i < script.length) lineNumber++;
        continue;
      }
    }
    
    if (char === "'" && !inDoubleQuote) {
      // Check for escaped quotes
      if (i > 0 && script[i - 1] === '\\') {
        continue;
      }
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      // Check for escaped quotes
      if (i > 0 && script[i - 1] === '\\') {
        continue;
      }
      inDoubleQuote = !inDoubleQuote;
    }
  }
  
  if (inSingleQuote || inDoubleQuote) {
    result.errors.push(`Unclosed string literal at end of script`);
  }
}

/**
 * Validates comma placement in function calls
 */
function validateCommasInFunctionCalls(script: string, result: ValidationResult): void {
  const lines = script.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('//') || line === '') {
      continue;
    }
    
    // Check for specific pattern: missing comma between arguments
    // More precise pattern to avoid false positives
    const missingCommaRegex = /\(\s*[\w\d"']+\s+[\w\d"']+(?!\s*[,\)])/g;
    const missingCommaMatches = line.match(missingCommaRegex);
    
    if (missingCommaMatches) {
      // Skip known valid patterns in PineScript
      const validPatterns = [
        /indicator\(.*overlay\s*=\s*true/,
        /input\(.*".*"\)/,
        /ta\.rsi\(.*\)/,
        /label\.new\(.*\)/,
        /plot\(.*".*"\)/,
        /hline\(.*".*"\)/,
        /if\s*\(.*\)/,
        /else\s+if\s*\(.*\)/
      ];
      
      let isValidPattern = false;
      for (const pattern of validPatterns) {
        if (pattern.test(line)) {
          isValidPattern = true;
          break;
        }
      }
      
      if (!isValidPattern) {
        // Extract function name from context
        const functionCallRegex = /(\w+)\s*\(/;
        const functionMatch = line.match(functionCallRegex);
        const functionName = functionMatch ? functionMatch[1] : 'function';
        
        result.warnings.push(`Line ${i + 1}: Possible missing comma in function call to '${functionName}'`);
      }
    }
  }
}

/**
 * Result of PineScript validation
 */
export interface ValidationResult {
  /** Whether the script is valid */
  valid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
} 