/**
 * PineScript Formatter
 * 
 * Formats PineScript code according to best practices and style guidelines.
 */

import { detectVersion } from './versionDetector.js';

/**
 * Formatting options for PineScript code
 */
export interface FormatOptions {
  // Indentation settings
  indentSize: number;        // Number of spaces for each indentation level
  useSpaces: boolean;        // Whether to use spaces (true) or tabs (false)
  
  // Spacing settings
  spacesAroundOperators: boolean;  // Add spaces around operators like +, -, =, etc.
  spaceAfterCommas: boolean;       // Add space after commas in argument lists
  
  // Line break settings
  maxLineLength: number;           // Maximum line length before suggesting breaking
  keepBlankLines: boolean;         // Whether to preserve blank lines in code
  
  // Bracket settings
  bracesOnNewLine: boolean;        // Place opening braces on a new line
  
  // Comment formatting
  alignComments: boolean;          // Align consecutive line comments
  
  // Versioning
  updateVersionComment: boolean;   // Update the version comment if needed
}

/**
 * Default formatting options
 */
export const defaultFormatOptions: FormatOptions = {
  indentSize: 4,
  useSpaces: true,
  spacesAroundOperators: true,
  spaceAfterCommas: true,
  maxLineLength: 80,
  keepBlankLines: true,
  bracesOnNewLine: false,
  alignComments: true,
  updateVersionComment: true
};

/**
 * Result of formatting PineScript code
 */
export interface FormatResult {
  formatted: string;     // The formatted code
  changes: string[];     // List of changes made during formatting
  warnings: string[];    // Any warnings during formatting
}

/**
 * Formats PineScript code according to specified options
 * 
 * @param script The PineScript code to format
 * @param options Formatting options (optional)
 * @returns The formatted code and information about changes
 */
export function formatPineScript(script: string, options: Partial<FormatOptions> = {}): FormatResult {
  // Merge provided options with defaults
  const formatOptions: FormatOptions = { ...defaultFormatOptions, ...options };
  
  // Track changes and warnings
  const changes: string[] = [];
  const warnings: string[] = [];
  
  // Detect script version
  const version = detectVersion(script);
  
  // Split script into lines for processing
  let lines = script.split('\n');
  
  // Process the script
  lines = processVersionComment(lines, version, formatOptions, changes);
  lines = formatIndentation(lines, formatOptions, changes);
  lines = formatSpacing(lines, formatOptions, changes);
  lines = formatBlankLines(lines, formatOptions, changes);
  lines = formatComments(lines, formatOptions, changes);
  
  // Check for lines exceeding max length
  checkLineLengths(lines, formatOptions, warnings);
  
  // Join the lines back into a single string
  const formatted = lines.join('\n');
  
  return {
    formatted,
    changes,
    warnings
  };
}

/**
 * Updates or adds version comment at the top of the script
 */
function processVersionComment(
  lines: string[], 
  version: string, 
  options: FormatOptions, 
  changes: string[]
): string[] {
  if (!options.updateVersionComment) {
    return lines;
  }
  
  const versionPattern = /^\s*\/\/@version\s*=\s*\d+\s*$/;
  const versionNum = version.replace('v', '');
  const versionLine = `//@version=${versionNum}`;
  
  // Check if version comment exists
  const versionLineIndex = lines.findIndex(line => versionPattern.test(line));
  
  if (versionLineIndex >= 0) {
    // Update existing version comment
    const currentVersion = lines[versionLineIndex].match(/\/\/@version\s*=\s*(\d+)/)?.[1];
    if (currentVersion !== versionNum) {
      lines[versionLineIndex] = versionLine;
      changes.push('Updated version comment');
    }
  } else {
    // Add version comment at the top
    lines = [versionLine, '', ...lines];
    changes.push('Added version comment');
  }
  
  return lines;
}

/**
 * Formats indentation throughout the code
 */
function formatIndentation(
  lines: string[], 
  options: FormatOptions, 
  changes: string[]
): string[] {
  const indent = options.useSpaces ? ' '.repeat(options.indentSize) : '\t';
  let indentLevel = 0;
  let indentationChanged = false;
  
  // Keywords that may increase indentation level for subsequent lines
  const indentIncreasingKeywords = [
    'if', 'for', 'while', 'else', 'method', 'function'
  ];
  
  // Process each line
  const formattedLines = lines.map((line, index) => {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('//')) {
      return line;
    }
    
    // Check for closing braces/brackets that decrease indent level
    if (line.trim().startsWith('}') || line.trim().startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Apply current indent level
    const currentIndent = indent.repeat(indentLevel);
    const trimmedLine = line.trimLeft();
    const formattedLine = currentIndent + trimmedLine;
    
    // Check for opening braces that increase indent level
    if (line.includes('{') && !line.includes('}')) {
      indentLevel++;
    }
    // Check for keywords that might increase indentation
    else if (indentIncreasingKeywords.some(keyword => {
      const pattern = new RegExp(`^\\s*${keyword}\\b`);
      return pattern.test(line);
    }) && !line.includes('{') && !line.endsWith(';')) {
      indentLevel++;
    }
    
    // Check if line has changed
    if (line !== formattedLine) {
      indentationChanged = true;
    }
    
    return formattedLine;
  });
  
  if (indentationChanged) {
    changes.push('Standardized indentation');
  }
  
  return formattedLines;
}

/**
 * Formats spacing around operators and after commas
 */
function formatSpacing(
  lines: string[], 
  options: FormatOptions, 
  changes: string[]
): string[] {
  if (!options.spacesAroundOperators && !options.spaceAfterCommas) {
    return lines;
  }
  
  let spacingChanged = false;
  
  // Process each line
  const formattedLines = lines.map(line => {
    // Skip comment lines
    if (line.trim().startsWith('//')) {
      return line;
    }
    
    let formattedLine = line;
    
    // We need to handle strings carefully to not modify their contents
    const stringSegments: string[] = [];
    // Replace strings with placeholders to protect their content
    formattedLine = formattedLine.replace(/"([^"\\]|\\.)*"/g, (match) => {
      const placeholder = `__STRING_${stringSegments.length}__`;
      stringSegments.push(match);
      return placeholder;
    });
    
    // Format spaces around operators
    if (options.spacesAroundOperators) {
      const originalLine = formattedLine;
      
      // Binary operators need spaces on both sides
      formattedLine = formattedLine
        // Basic operators: + - * / % = == != < > <= >= && || 
        .replace(/([^\s=!<>+\-*/%&|^])([+\-*\/%=<>!&|^]+)([^\s=])/g, '$1 $2 $3')
        // Handle potential double spaces that might have been created
        .replace(/\s{2,}/g, ' ')
        // Make sure operators like +=, -=, etc. have spaces
        .replace(/([^\s])(\+=|-=|\*=|\/=|%=)([^\s])/g, '$1 $2 $3')
        // Fix spaces after/before parentheses that might have been added
        .replace(/\s+\)/g, ')')
        .replace(/\(\s+/g, '(');
      
      if (originalLine !== formattedLine) {
        spacingChanged = true;
      }
    }
    
    // Format spaces after commas
    if (options.spaceAfterCommas) {
      const originalLine = formattedLine;
      
      // Add space after commas except in strings
      formattedLine = formattedLine.replace(/,([^\s])/g, ', $1');
      
      if (originalLine !== formattedLine) {
        spacingChanged = true;
      }
    }
    
    // Restore strings
    stringSegments.forEach((str, i) => {
      formattedLine = formattedLine.replace(`__STRING_${i}__`, str);
    });
    
    return formattedLine;
  });
  
  if (spacingChanged) {
    changes.push('Standardized spacing around operators and commas');
  }
  
  return formattedLines;
}

/**
 * Handles blank lines according to options
 */
function formatBlankLines(
  lines: string[], 
  options: FormatOptions, 
  changes: string[]
): string[] {
  if (options.keepBlankLines) {
    return lines;
  }
  
  // Replace multiple consecutive blank lines with a single one
  const formattedLines: string[] = [];
  let previousLineBlank = false;
  
  for (const line of lines) {
    const isBlankLine = line.trim() === '';
    
    if (isBlankLine) {
      if (!previousLineBlank) {
        formattedLines.push('');
      }
      previousLineBlank = true;
    } else {
      formattedLines.push(line);
      previousLineBlank = false;
    }
  }
  
  if (formattedLines.length !== lines.length) {
    changes.push('Normalized blank lines');
  }
  
  return formattedLines;
}

/**
 * Aligns and formats comments
 */
function formatComments(
  lines: string[], 
  options: FormatOptions, 
  changes: string[]
): string[] {
  if (!options.alignComments) {
    return lines;
  }
  
  // Find blocks of consecutive line comments
  const formattedLines = [...lines];
  const commentBlocks: { start: number, end: number }[] = [];
  let blockStart: number | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimRight();
    const commentMatch = line.match(/^(\s*)\/\/(.*)$/);
    
    if (commentMatch) {
      if (blockStart === null) {
        blockStart = i;
      }
    } else if (blockStart !== null) {
      commentBlocks.push({ start: blockStart, end: i - 1 });
      blockStart = null;
    }
  }
  
  // If there's a comment block at the end
  if (blockStart !== null) {
    commentBlocks.push({ start: blockStart, end: lines.length - 1 });
  }
  
  // Format each comment block
  if (commentBlocks.length > 0) {
    let commentsAligned = false;
    
    commentBlocks.forEach(block => {
      // Skip single-line comment blocks
      if (block.start === block.end) {
        return;
      }
      
      // Align multi-line comment blocks
      let commonIndent = '';
      // Find the common indent
      for (let i = block.start; i <= block.end; i++) {
        const line = lines[i];
        const indentMatch = line.match(/^(\s*)\/\//);
        
        if (indentMatch) {
          const indent = indentMatch[1];
          
          if (commonIndent === '' || indent.length < commonIndent.length) {
            commonIndent = indent;
          }
        }
      }
      
      // Apply alignment
      for (let i = block.start; i <= block.end; i++) {
        const line = lines[i];
        const trimmed = line.trimLeft();
        
        if (line !== commonIndent + trimmed) {
          formattedLines[i] = commonIndent + trimmed;
          commentsAligned = true;
        }
      }
    });
    
    if (commentsAligned) {
      changes.push('Aligned comment blocks');
    }
  }
  
  return formattedLines;
}

/**
 * Checks for lines that exceed the maximum line length
 */
function checkLineLengths(
  lines: string[], 
  options: FormatOptions, 
  warnings: string[]
): void {
  const maxLength = options.maxLineLength;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.length > maxLength) {
      warnings.push(`Line ${i + 1} exceeds maximum line length of ${maxLength} characters`);
    }
  }
} 