/**
 * Handles automatic fixing of common PineScript syntax errors
 */

import { detectPinescriptSyntaxErrors } from '../utils/errorDetector';

export interface FixResult {
  fixed: boolean;
  script: string;
  changes: string[];
}

/**
 * Attempts to fix common syntax errors in PineScript code.
 * @param script The PineScript code to fix
 * @returns Object containing the fixed script, whether fixes were applied, and a list of changes made
 */
export function fixPineScriptErrors(script: string): FixResult {
  const result: FixResult = {
    fixed: false,
    script: script,
    changes: []
  };

  if (!script || !script.trim()) {
    return result;
  }

  // Check for version annotation
  if (!script.includes('@version=')) {
    const lines = script.split('\n');
    if (lines.length > 0) {
      // Add version annotation to the beginning
      lines.unshift('//@version=5');
      result.script = lines.join('\n');
      result.changes.push('Added missing version annotation (@version=5)');
      result.fixed = true;
    }
  }

  // Fix unbalanced parentheses/brackets/braces
  const openingChars = ['(', '[', '{'];
  const closingChars = [')', ']', '}'];
  const bracketPairs = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  const stack: string[] = [];
  const lines = result.script.split('\n');
  let lineIndex = 0;

  // First analyze the current state of brackets/parentheses
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let inString = false;
    let stringChar = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      // Handle string literals to avoid counting parentheses inside strings
      if ((char === '"' || char === "'") && (j === 0 || line[j-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
        continue;
      }
      
      if (!inString) {
        if (openingChars.includes(char)) {
          stack.push(char);
        } else if (closingChars.includes(char)) {
          const openingIndex = closingChars.indexOf(char);
          const expectedOpening = openingChars[openingIndex];
          
          if (stack.length === 0 || stack[stack.length - 1] !== expectedOpening) {
            // Mismatched closing bracket - we'll handle this later
          } else {
            stack.pop();
          }
        }
      }
    }
    lineIndex = i;
  }

  // Fix any unclosed brackets/parentheses
  if (stack.length > 0) {
    let modification = false;
    
    // Add missing closing brackets in reverse order
    while (stack.length > 0) {
      const lastOpening = stack.pop() as keyof typeof bracketPairs;
      const closingBracket = bracketPairs[lastOpening];
      
      // Check if the script ends with a closing bracket already
      if (!result.script.trimEnd().endsWith(closingBracket)) {
        result.script += closingBracket;
        result.changes.push(`Added missing ${closingBracket === ')' ? 'closing parenthesis' : 
                           closingBracket === ']' ? 'closing bracket' : 
                           'closing brace'} on line ${lineIndex + 1}`);
        modification = true;
      }
    }
    
    if (modification) {
      result.fixed = true;
    }
  }

  // Check for unclosed string literals
  const errorLines = detectPinescriptSyntaxErrors(result.script);
  for (const error of errorLines) {
    if (error.toLowerCase().includes('unclosed string literal')) {
      const match = error.match(/line (\d+)/i);
      if (match && match[1]) {
        const lineNum = parseInt(match[1]) - 1;
        if (lineNum >= 0 && lineNum < lines.length) {
          // Add closing quote at the end of the line
          if (!lines[lineNum].trimEnd().endsWith('"') && 
              !lines[lineNum].trimEnd().endsWith("'")) {
            if (lines[lineNum].includes('"') && !lines[lineNum].endsWith('"')) {
              lines[lineNum] += '"';
              result.changes.push(`Fixed unclosed string literal in line ${lineNum + 1}`);
              result.fixed = true;
            } else if (lines[lineNum].includes("'") && !lines[lineNum].endsWith("'")) {
              lines[lineNum] += "'";
              result.changes.push(`Fixed unclosed string literal in line ${lineNum + 1}`);
              result.fixed = true;
            }
          }
        }
      }
    }
  }

  // Update script if string literals were fixed
  if (result.changes.some(change => change.includes('unclosed string literal'))) {
    result.script = lines.join('\n');
  }

  // Check for missing commas in function calls
  let scriptCopy = result.script;
  
  // Specific check for input without comma pattern that comes up in tests
  const inputPattern = /input\s*\(\s*(\d+)\s+("[^"]*")/g;
  let hasInputFixes = false;
  
  result.script = result.script.replace(inputPattern, (match, num, str) => {
    hasInputFixes = true;
    return `input(${num}, ${str}`;
  });
  
  if (hasInputFixes) {
    result.changes.push('Added missing comma in function call to input');
    result.fixed = true;
  }
  
  // General check for other missing commas
  const funcCallRegex = /(\w+)\s*\(((?:[^()]|\([^()]*\))*)\)/g;
  let match: RegExpExecArray | null;
  
  while ((match = funcCallRegex.exec(scriptCopy)) !== null) {
    const funcName = match[1];
    const args = match[2];
    
    if (args && args.trim() !== '') {
      const argsWithoutStrings = args.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '');
      
      // Check for args separated by space without comma
      if (/[a-zA-Z0-9_"']\s+[a-zA-Z0-9_"']/.test(argsWithoutStrings)) {
        // Before modifying, check if this is an actual error and not a feature of the language
        // This is a simplistic check - a more comprehensive solution would need syntax analysis
        if (!argsWithoutStrings.includes(',')) {
          const fixedArgs = args.replace(/([a-zA-Z0-9_"'])\s+([a-zA-Z0-9_"'])/g, '$1, $2');
          const originalCall = match[0];
          const fixedCall = `${funcName}(${fixedArgs})`;
          
          if (originalCall !== fixedCall) {
            result.script = result.script.replace(originalCall, fixedCall);
            result.changes.push(`Added missing comma in function call to ${funcName}`);
            result.fixed = true;
          }
        }
      }
    }
  }

  // Fix deprecated study() function calls
  if (result.script.includes('study(')) {
    const studyPattern = /study\s*\(\s*("[^"]*")(?:,\s*(.+?))?\)/g;
    result.script = result.script.replace(studyPattern, (match, title, options) => {
      if (options) {
        return `indicator(${title}, ${options})`;
      }
      return `indicator(${title})`;
    });
    result.changes.push('Replaced deprecated study() function with indicator()');
    result.fixed = true;
  }

  // Check for deprecated functions and suggest alternative
  const deprecatedFuncs = {
    'cross': 'ta.cross',
    'sma': 'ta.sma',
    'ema': 'ta.ema',
    'rsi': 'ta.rsi',
    'macd': 'ta.macd',
    'highest': 'ta.highest',
    'lowest': 'ta.lowest'
  };
  
  for (const [oldFunc, newFunc] of Object.entries(deprecatedFuncs)) {
    const regex = new RegExp(`\\b${oldFunc}\\s*\\(`, 'g');
    if (regex.test(result.script) && !result.script.includes(`${newFunc}(`)) {
      result.script = result.script.replace(regex, `${newFunc}(`);
      result.changes.push(`Updated deprecated function ${oldFunc}() to ${newFunc}()`);
      result.fixed = true;
    }
  }

  // Check for incorrect variable export syntax
  if (result.script.includes('export var') || result.script.includes('export const')) {
    const exportVarPattern = /export\s+(var|const)\s+(\w+)\s*=\s*([^;]+)/g;
    result.script = result.script.replace(exportVarPattern, (match, varType, varName, value) => {
      return `var ${varName} = ${value}\nexport ${varName}`;
    });
    result.changes.push('Fixed incorrect variable export syntax');
    result.fixed = true;
  }

  return result;
} 