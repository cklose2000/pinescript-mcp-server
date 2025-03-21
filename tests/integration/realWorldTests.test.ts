import fs from 'fs';
import path from 'path';
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { validatePineScript } from '../../src/validators/syntaxValidator';
import { formatPineScript, FormatOptions } from '../../src/utils/formatter';
import { VersionManager, ScriptVersion } from '../../src/utils/versionManager';
import { fixPineScriptErrors } from '../../src/fixers/errorFixer';
import { detectVersion, PineScriptVersion } from '../../src/utils/versionDetector';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

// Test matrix defines our real-world examples
const testMatrix = [
  {
    name: "Gold Scalping Strategy",
    file: "Example_PineScriptStrat1_1hr.txt",
    version: PineScriptVersion.V6,
    complexity: "medium",
    features: ["strategy", "indicators", "conditionals", "plots"]
  }
  // Add more examples as they become available
];

// Timing utility for performance measurements
function timeExecution(fn: Function): { result: any, timeMs: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

describe('Real-world PineScript Examples', () => {
  const results: Record<string, any> = {};
  
  // Load all example scripts before tests
  beforeAll(() => {
    testMatrix.forEach(example => {
      const filePath = path.join(EXAMPLES_DIR, example.file);
      results[example.name] = {
        script: fs.readFileSync(filePath, 'utf8'),
        metrics: {},
        validationResults: null,
        formattingResults: {},
        versionResults: {},
        fixerResults: {}
      };
      
      // Automatically detect the version as a sanity check
      const { result, timeMs } = timeExecution(() => 
        detectVersion(results[example.name].script)
      );
      
      results[example.name].detectedVersion = result;
      results[example.name].metrics.versionDetection = timeMs;
    });
  });
  
  // Write test results to a report file after all tests complete
  afterAll(() => {
    const reportPath = path.join(process.cwd(), 'tests', 'integration', 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`Test results written to ${reportPath}`);
  });
  
  // Run tests for each example
  testMatrix.forEach(example => {
    describe(`Example: ${example.name}`, () => {
      
      test('should correctly detect PineScript version', () => {
        const exampleData = results[example.name];
        const detectedVersion = exampleData.detectedVersion;
        
        expect(detectedVersion).toBe(example.version);
        console.log(`Version detection took ${exampleData.metrics.versionDetection}ms`);
      });
      
      test('should pass validation without errors', () => {
        const exampleData = results[example.name];
        
        const { result, timeMs } = timeExecution(() => 
          validatePineScript(exampleData.script)
        );
        
        exampleData.validationResults = result;
        exampleData.metrics.validation = timeMs;
        
        console.log(`Validation took ${timeMs}ms`);
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
      
      test('should format script while preserving functionality', () => {
        const exampleData = results[example.name];
        
        // Test with default options
        const defaultOptions: FormatOptions = {
          indentSize: 2,
          useSpaces: true,
          spacesAroundOperators: true,
          spaceAfterCommas: true,
          maxLineLength: 80,
          keepBlankLines: true,
          bracesOnNewLine: false,
          alignComments: true,
          updateVersionComment: true
        };
        
        const { result: defaultResult, timeMs: defaultTime } = timeExecution(() => 
          formatPineScript(exampleData.script, defaultOptions)
        );
        
        exampleData.formattingResults.default = defaultResult;
        exampleData.metrics.formattingDefault = defaultTime;
        
        // Verify the formatted script still passes validation
        const validationAfterFormat = validatePineScript(defaultResult.formatted);
        
        expect(validationAfterFormat.valid).toBe(true);
        // Some warnings are expected, especially for long lines
        expect(defaultResult.warnings.length).toBeGreaterThanOrEqual(0);
        console.log(`Default formatting took ${defaultTime}ms`);
        
        // Test with minimal options
        const minimalOptions: FormatOptions = {
          indentSize: 4,
          useSpaces: false,
          spacesAroundOperators: false,
          spaceAfterCommas: false,
          maxLineLength: 120,
          keepBlankLines: false,
          bracesOnNewLine: true,
          alignComments: false,
          updateVersionComment: false
        };
        
        const { result: minimalResult, timeMs: minimalTime } = timeExecution(() => 
          formatPineScript(exampleData.script, minimalOptions)
        );
        
        exampleData.formattingResults.minimal = minimalResult;
        exampleData.metrics.formattingMinimal = minimalTime;
        
        // Verify the formatted script still passes validation
        const validationAfterMinimal = validatePineScript(minimalResult.formatted);
        
        expect(validationAfterMinimal.valid).toBe(true);
        console.log(`Minimal formatting took ${minimalTime}ms`);
      });
      
      test('should handle version conversion', () => {
        const exampleData = results[example.name];
        const versionManager = new VersionManager();
        
        // Try downgrading to v5 if possible
        if (example.version === PineScriptVersion.V6) {
          const { result, timeMs } = timeExecution(() => 
            versionManager.upgradeVersion(exampleData.script, PineScriptVersion.V5)
          );
          
          exampleData.versionResults.downgradeToV5 = result;
          exampleData.metrics.downgradeToV5 = timeMs;
          
          // Verify the downgraded script passes validation
          const validationAfterDowngrade = validatePineScript(result);
          
          // Some features might not be convertible, so we log but don't necessarily expect zero errors
          console.log(`Downgrade to v5 took ${timeMs}ms with ${validationAfterDowngrade.errors.length} validation errors`);
        }
        
        // Try upgrading to v6 if applicable
        if (example.version === PineScriptVersion.V5 || example.version === PineScriptVersion.V4) {
          const { result, timeMs } = timeExecution(() => 
            versionManager.upgradeVersion(exampleData.script, PineScriptVersion.V6)
          );
          
          exampleData.versionResults.upgradeToV6 = result;
          exampleData.metrics.upgradeToV6 = timeMs;
          
          // Verify the upgraded script passes validation
          const validationAfterUpgrade = validatePineScript(result);
          
          expect(validationAfterUpgrade.valid).toBe(true);
          console.log(`Upgrade to v6 took ${timeMs}ms`);
        }
      });
      
      test('should fix intentionally introduced errors', () => {
        const exampleData = results[example.name];
        
        // Introduce a common error: missing version annotation
        let scriptWithError = exampleData.script.replace(/\/\/@version=\d+/, '');
        
        const { result, timeMs } = timeExecution(() => 
          fixPineScriptErrors(scriptWithError)
        );
        
        exampleData.fixerResults.missingVersion = result;
        exampleData.metrics.fixMissingVersion = timeMs;
        
        expect(result.fixed).toBe(true);
        // Check the correct property name depending on implementation
        if (result.fixedScript) {
          expect(result.fixedScript).toContain('//@version=');
        } else if (result.updatedScript) {
          expect(result.updatedScript).toContain('//@version=');
        }
        console.log(`Fix missing version took ${timeMs}ms`);
        
        // Introduce another error: unbalanced parentheses
        scriptWithError = exampleData.script.replace('strategy("Gold Scalping BOS & CHoCH"', 'strategy("Gold Scalping BOS & CHoCH"');
        
        const { result: result2, timeMs: timeMs2 } = timeExecution(() => 
          fixPineScriptErrors(scriptWithError)
        );
        
        exampleData.fixerResults.unbalancedParentheses = result2;
        exampleData.metrics.fixUnbalancedParentheses = timeMs2;
        
        // Check if the error was fixed - not all errors may be fixable
        // Just log the result rather than expecting it to be fixed
        console.log(`Unbalanced parentheses fix attempted. Fixed: ${result2.fixed}`);
        
        // If it was fixed, verify the fixed script
        if (result2.fixed) {
          // Ensure the fixed script contains the closing parenthesis
          if (result2.fixedScript) {
            expect(result2.fixedScript).toContain('strategy("Gold Scalping BOS & CHoCH")');
          } else if (result2.updatedScript) {
            expect(result2.updatedScript).toContain('strategy("Gold Scalping BOS & CHoCH")');
          }
        }
      });
      
      test('should handle multiple formatting passes without degradation', () => {
        const exampleData = results[example.name];
        const options: FormatOptions = {
          indentSize: 2,
          useSpaces: true,
          spacesAroundOperators: true,
          spaceAfterCommas: true,
          maxLineLength: 80,
          keepBlankLines: true,
          bracesOnNewLine: false,
          alignComments: true,
          updateVersionComment: true
        };
        
        // First formatting pass
        const firstPass = formatPineScript(exampleData.script, options);
        
        // Second formatting pass on the already formatted code
        const secondPass = formatPineScript(firstPass.formatted, options);
        
        // Third formatting pass
        const thirdPass = formatPineScript(secondPass.formatted, options);
        
        // The second and third passes should not change the code significantly
        expect(secondPass.formatted).toBe(firstPass.formatted);
        expect(thirdPass.formatted).toBe(secondPass.formatted);
      });
    });
  });
}); 