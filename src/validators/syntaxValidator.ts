/**
 * PineScript Syntax Validator
 * 
 * Basic validation of PineScript code for common syntax errors
 */

import { PineScriptVersion, detectVersion } from '../utils/versionDetector.js';
import { VALIDATION_CONFIG } from '../config/protocolConfig.js';

/**
 * Validates PineScript code for syntax errors
 * 
 * @param script The PineScript code to validate
 * @param version The PineScript version (v4, v5, v6)
 * @param context Optional validation context for progress reporting
 * @returns Validation result with status and messages
 */
export function validatePineScript(
  script: string, 
  version?: string, 
  context?: any
): ValidationResult {
  // Default result
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // Initialize validation timing
    const startTime = Date.now();
    let lastProgressReportTime = startTime;
    
    // Check if the script is too large
    if (script.length > VALIDATION_CONFIG.maxScriptSizeWarningThreshold) {
      result.warnings.push(`Script is very large (${script.length} characters). This may cause performance issues.`);
    }

    // Helper function to check time and report progress
    const checkTimeAndProgress = (progress: number, total: number) => {
      const currentTime = Date.now();
      
      // Check for timeout
      if (currentTime - startTime > VALIDATION_CONFIG.maxValidationTime) {
        throw new Error(`Validation timeout - script is too complex (exceeded ${VALIDATION_CONFIG.maxValidationTime/1000} seconds)`);
      }
      
      // Report progress at intervals if context is available
      if (context?.reportProgress && 
          currentTime - lastProgressReportTime > VALIDATION_CONFIG.validationCheckInterval) {
        context.reportProgress({ progress, total });
        lastProgressReportTime = currentTime;
      }
    };

    // If version not provided, try to detect it
    const scriptVersion = version || detectVersion(script);
    
    // Check if script is empty
    if (!script || script.trim().length === 0) {
      result.valid = false;
      result.errors.push('Script is empty');
      return result;
    }
    
    // Check for version comment
    if (!script.includes('//@version=')) {
      result.warnings.push('Missing version comment (e.g., //@version=5)');
    }
    
    // Basic validation checks with progress monitoring
    
    // Check for missing parentheses and brackets
    checkTimeAndProgress(1, 5);
    validateBalancedParentheses(script, result, checkTimeAndProgress);
    
    // Check for missing quotes
    checkTimeAndProgress(2, 5);
    validateBalancedQuotes(script, result, checkTimeAndProgress);
    
    // Check for missing indicator/strategy declaration
    checkTimeAndProgress(3, 5);
    validateDeclaration(script, result, scriptVersion);
    
    // Check for common syntax errors based on version
    checkTimeAndProgress(4, 5);
    validateVersionSpecificSyntax(script, result, scriptVersion, checkTimeAndProgress);
    
    // Check line lengths (warning for very long lines)
    checkTimeAndProgress(5, 5);
    validateLineLength(script, result);
    
    // Final progress report - validation complete
    if (context?.reportProgress) {
      context.reportProgress({ progress: 5, total: 5 });
    }
    
  } catch (error: any) {
    // Handle any exceptions during validation
    result.valid = false;
    result.errors.push(`Validation error: ${error.message || 'Unknown error'}`);
    console.error('Validation error:', error);
  }
  
  // If there are errors, mark as invalid
  if (result.errors.length > 0) {
    result.valid = false;
  }
  
  return result;
}

/**
 * Validates that parentheses and brackets are balanced
 */
function validateBalancedParentheses(
  script: string, 
  result: ValidationResult,
  progressCheck: (progress: number, total: number) => void
): void {
  const stack: string[] = [];
  const lines = script.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    // Check progress and time at intervals
    if (i % 100 === 0) {
      progressCheck(i, lines.length);
    }
    
    const line = lines[i];
    // Skip comments
    if (line.trim().startsWith('//')) continue;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '(' || char === '[' || char === '{') {
        stack.push(char);
      } else if (char === ')' || char === ']' || char === '}') {
        const lastOpen = stack.pop();
        
        if (!lastOpen || 
            (char === ')' && lastOpen !== '(') || 
            (char === ']' && lastOpen !== '[') || 
            (char === '}' && lastOpen !== '{')) {
          result.errors.push(`Line ${i+1}: Mismatched bracket or parenthesis`);
        }
      }
    }
  }
  
  if (stack.length > 0) {
    result.errors.push(`Unbalanced brackets or parentheses: missing ${stack.length} closing brackets`);
  }
}

/**
 * Validates that quotes are balanced
 */
function validateBalancedQuotes(
  script: string, 
  result: ValidationResult,
  progressCheck: (progress: number, total: number) => void
): void {
  const lines = script.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    // Check progress and time at intervals
    if (i % 100 === 0) {
      progressCheck(i, lines.length);
    }
    
    let line = lines[i];
    // Skip comments
    if (line.trim().startsWith('//')) continue;
    
    let inSingleQuote = false;
    let inDoubleQuote = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j-1] : '';
      
      // Handle quotes, accounting for escaped quotes
      if (char === "'" && prevChar !== '\\') {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && prevChar !== '\\') {
        inDoubleQuote = !inDoubleQuote;
      }
    }
    
    if (inSingleQuote) {
      result.errors.push(`Line ${i+1}: Unclosed single quote`);
    }
    
    if (inDoubleQuote) {
      result.errors.push(`Line ${i+1}: Unclosed double quote`);
    }
  }
}

/**
 * Validates indicator or strategy declaration
 */
function validateDeclaration(script: string, result: ValidationResult, version: string): void {
  if (!script.includes('indicator(') && !script.includes('strategy(') && !script.includes('library(')) {
    result.errors.push('Missing indicator/strategy/library declaration');
  }
  
  // Check if the script contains both indicator and strategy declarations
  const hasIndicator = /\bindicator\s*\(/g.test(script);
  const hasStrategy = /\bstrategy\s*\(/g.test(script);
  const hasLibrary = /\blibrary\s*\(/g.test(script);
  
  if ((hasIndicator && hasStrategy) || 
      (hasIndicator && hasLibrary) || 
      (hasStrategy && hasLibrary)) {
    result.errors.push('Script cannot contain multiple declarations (indicator/strategy/library)');
  }
}

/**
 * Validates version-specific syntax
 */
function validateVersionSpecificSyntax(
  script: string, 
  result: ValidationResult, 
  version: string,
  progressCheck: (progress: number, total: number) => void
): void {
  // Convert version string to number for comparison
  const versionNum = parseInt(version.replace(/\D/g, ''));
  
  // v3 syntax validation
  if (versionNum <= 3) {
    // Check for array access with [] which was introduced in v4
    if (/\w+\s*\[\s*\d+\s*\]/g.test(script)) {
      result.errors.push('Array access with [] is not supported in PineScript v3 and earlier');
    }
  }
  
  // v4 and newer syntax validation
  if (versionNum >= 4) {
    // Check for old-style security calls
    if (/security\s*\(\s*[^,]+\s*,[^,]+\s*,[^,)]+\)/g.test(script)) {
      // This is just a warning since it might still work
      result.warnings.push('Using old-style security() function. Consider updating to request.security() for v5 and above');
    }
  }
  
  // v5 syntax validation
  if (versionNum >= 5) {
    // Check for use of := without var declaration
    const varDeclared = new Set<string>();
    const lines = script.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      // Check progress and time at intervals
      if (i % 100 === 0) {
        progressCheck(i, lines.length);
      }
      
      const line = lines[i];
      // Skip comments
      if (line.trim().startsWith('//')) continue;
      
      // Capture variable declarations
      const varMatch = line.match(/\bvar\s+(\w+)/);
      if (varMatch) {
        varDeclared.add(varMatch[1]);
      }
      
      // Check for reassignment without var
      const reassignMatch = line.match(/\b(\w+)\s*:=/);
      if (reassignMatch && !varDeclared.has(reassignMatch[1])) {
        result.warnings.push(`Line ${i+1}: Using := without 'var' declaration for '${reassignMatch[1]}'. This may cause issues.`);
      }
    }
  }
}

/**
 * Validates line length (warns for very long lines)
 */
function validateLineLength(script: string, result: ValidationResult): void {
  const lines = script.split('\n');
  const MAX_LINE_LENGTH = 120;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > MAX_LINE_LENGTH) {
      result.warnings.push(`Line ${i+1} exceeds maximum recommended length (${lines[i].length} > ${MAX_LINE_LENGTH})`);
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