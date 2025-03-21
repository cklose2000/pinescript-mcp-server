/**
 * Utility for detecting syntax errors in PineScript code
 */

/**
 * Analyzes a PineScript script and detects common syntax errors
 * @param script PineScript code to analyze
 * @returns Array of error message strings
 */
export function detectPinescriptSyntaxErrors(script: string): string[] {
  if (!script || script.trim() === '') {
    return [];
  }

  const errors: string[] = [];
  const lines = script.split('\n');

  // Check for unclosed string literals
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let inString = false;
    let quoteChar = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      // Handle escape sequences
      if (char === '\\' && j < line.length - 1) {
        j++; // Skip the next character
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quoteChar = char;
      } else if (char === quoteChar && inString) {
        inString = false;
        quoteChar = '';
      }
    }
    
    if (inString) {
      errors.push(`Unclosed string literal in line ${i + 1}`);
    }
  }

  // Check for balanced parentheses and brackets
  const openingChars = ['(', '[', '{'];
  const closingChars = [')', ']', '}'];
  const stack: { char: string, line: number }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let inString = false;
    let quoteChar = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      // Skip characters in string literals
      if ((char === '"' || char === "'") && (j === 0 || line[j-1] !== '\\')) {
        if (!inString) {
          inString = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inString = false;
          quoteChar = '';
        }
        continue;
      }
      
      if (!inString) {
        if (openingChars.includes(char)) {
          stack.push({ char, line: i + 1 });
        } else if (closingChars.includes(char)) {
          const openingIndex = closingChars.indexOf(char);
          const expectedOpening = openingChars[openingIndex];
          
          if (stack.length === 0) {
            errors.push(`Unexpected closing ${char === ')' ? 'parenthesis' : char === ']' ? 'bracket' : 'brace'} in line ${i + 1}`);
          } else if (stack[stack.length - 1].char !== expectedOpening) {
            errors.push(`Mismatched brackets: found ${char} in line ${i + 1}, but expected closing match for ${stack[stack.length - 1].char} from line ${stack[stack.length - 1].line}`);
          }
          
          if (stack.length > 0) {
            stack.pop();
          }
        }
      }
    }
  }
  
  // Report unclosed opening brackets/parentheses
  if (stack.length > 0) {
    for (const item of stack) {
      errors.push(`Unclosed ${item.char === '(' ? 'opening parenthesis' : item.char === '[' ? 'opening bracket' : 'opening brace'} from line ${item.line}`);
    }
  }

  // Check for missing version annotation
  if (!script.includes('@version=')) {
    errors.push('Missing version annotation. Consider adding //@version=5 at the beginning of your script');
  }

  // Check for missing commas in function arguments
  const funcCallRegex = /(\w+)\s*\(((?:[^()]|\([^()]*\))*)\)/g;
  let match: RegExpExecArray | null;
  let scriptCopy = script;
  
  while ((match = funcCallRegex.exec(scriptCopy)) !== null) {
    const funcName = match[1];
    const args = match[2];
    
    if (args && args.trim() !== '') {
      const argsWithoutStrings = args.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '');
      
      // Check for args separated by space without comma
      if (/[a-zA-Z0-9_"']\s+[a-zA-Z0-9_"']/.test(argsWithoutStrings) && !argsWithoutStrings.includes(',')) {
        // Find the line number
        const matchPos = match.index;
        let lineCount = 0;
        let pos = 0;
        
        for (let i = 0; i < lines.length; i++) {
          pos += lines[i].length + 1; // +1 for newline
          if (pos > matchPos) {
            lineCount = i + 1;
            break;
          }
        }
        
        errors.push(`Possible missing comma in arguments for function '${funcName}' near line ${lineCount}`);
      }
    }
  }

  return errors;
} 