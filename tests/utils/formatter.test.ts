/**
 * Tests for PineScript formatter
 */

import { expect, test, describe, it } from '@jest/globals';
import { formatPineScript, defaultFormatOptions, FormatOptions } from '../../src/utils/formatter';

describe('PineScript Formatter', () => {
  it('should add version comment if missing', () => {
    const script = `indicator("My Indicator", overlay=true)
var counter = 0
counter := counter + 1
plot(counter)`;

    const result = formatPineScript(script);
    
    expect(result.formatted).toContain('//@version=5');
    expect(result.changes).toContain('Added version comment');
  });
  
  it('should update existing version comment if needed', () => {
    const script = `//@version=4
indicator("My Indicator", overlay=true)
var counter = 0
counter := counter + 1
plot(counter)`;

    const result = formatPineScript(script);
    
    expect(result.formatted).toContain('//@version=5');
    expect(result.changes).toContain('Updated version comment');
  });
  
  it('should format indentation correctly', () => {
    const script = `//@version=5
indicator("Indentation Test")
if (close > open) {
plot(close)
}`;

    const result = formatPineScript(script);
    
    // The if block should be indented properly
    expect(result.formatted).toContain('if (close > open) {');
    expect(result.formatted).toContain('    plot(close)');
    expect(result.changes).toContain('Standardized indentation');
  });
  
  it('should add spaces around operators', () => {
    const script = `//@version=5
indicator("Operator Spacing")
a=b+c*2
d=e-f/3`;

    const result = formatPineScript(script);
    
    expect(result.formatted).toContain('a = b + c * 2');
    expect(result.formatted).toContain('d = e - f / 3');
    expect(result.changes).toContain('Standardized spacing around operators and commas');
  });
  
  it('should add spaces after commas', () => {
    const script = `//@version=5
indicator("Comma Spacing")
ma = ta.sma(close,14)
plot(ma,color=color.red)`;

    const result = formatPineScript(script);
    
    expect(result.formatted).toContain('ma = ta.sma(close, 14)');
    expect(result.formatted).toContain('plot(ma, color=color.red)');
    expect(result.changes).toContain('Standardized spacing around operators and commas');
  });
  
  it('should normalize blank lines', () => {
    const script = `//@version=5
indicator("Blank Lines")


var a = 1



var b = 2
plot(a+b)`;

    const options: Partial<FormatOptions> = {
      keepBlankLines: false
    };
    
    const result = formatPineScript(script, options);
    
    // There should be only one blank line between statements
    const lines = result.formatted.split('\n');
    expect(lines.filter(line => line.trim() === '').length).toBeLessThan(5);
    expect(result.changes).toContain('Normalized blank lines');
  });
  
  it('should align comment blocks', () => {
    const script = `//@version=5
indicator("Comment Alignment")
// This is a comment block
   // With varying indentation
// That should be aligned
var a = 1
plot(a)`;

    const result = formatPineScript(script);
    
    // All comments should have the same indentation
    const commentLines = result.formatted.split('\n').filter(line => line.trim().startsWith('//'));
    const indentations = commentLines.map(line => line.indexOf('//'));
    
    expect(new Set(indentations).size).toBe(1);
    expect(result.changes).toContain('Aligned comment blocks');
  });
  
  it('should warn about long lines', () => {
    const longLine = 'var reallyLongVariableName = "This is an extremely long string that will definitely exceed the maximum line length set in the formatter options"';
    const script = `//@version=5
indicator("Long Lines")
${longLine}
plot(1)`;

    const options: Partial<FormatOptions> = {
      maxLineLength: 80
    };
    
    const result = formatPineScript(script, options);
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('exceeds maximum line length');
  });
  
  it('should respect custom formatting options', () => {
    const script = `//@version=5
indicator("Custom Options")
if (condition) {
code
}`;

    const customOptions: Partial<FormatOptions> = {
      indentSize: 2,
      useSpaces: true,
      bracesOnNewLine: true
    };
    
    const result = formatPineScript(script, customOptions);
    
    // Should use 2 spaces for indentation
    expect(result.formatted).toContain('  code');
  });
  
  it('should handle PineScript v6 syntax elements', () => {
    const script = `
indicator("V6 Elements")
import ta
method calculateRSI(source, length) {
    return ta.rsi(source, length)
}
let rsiValue = calculateRSI(close, 14)
plot(rsiValue)`;

    const result = formatPineScript(script);
    
    expect(result.formatted).toContain('//@version=6');
    expect(result.formatted).toContain('import ta');
    expect(result.formatted).toContain('method calculateRSI(source, length) {');
    expect(result.formatted).toContain('    return ta.rsi(source, length)');
    expect(result.formatted).toContain('let rsiValue = calculateRSI(close, 14)');
  });
  
  it('should not modify code semantics', () => {
    const script = `//@version=5
indicator("Preserve Semantics")
a = 1+2
b = "string,with,commas"
c = [1,2,3,4]
plot(a+b+c)`;

    const result = formatPineScript(script);
    
    // Should preserve string contents and important semantics
    expect(result.formatted).toContain('a = 1 + 2');
    expect(result.formatted).toContain('b = "string,with,commas"');
    expect(result.formatted).toContain('c = [1, 2, 3, 4]');
  });
}); 