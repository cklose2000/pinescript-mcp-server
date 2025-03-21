/**
 * Test script to fix a single error - unclosed string
 */

// Import the fixer and validator
import { fixPineScriptErrors } from '../../src/fixers/errorFixer.js';
import { validatePineScript } from '../../src/validators/syntaxValidator.js';

// Script with unclosed string
const scriptWithIssue = `//@version=5
indicator("Example With Unclosed String")

message = "This string is not closed

plot(close, "Price", color=color.blue)`;

// Try to fix the script
console.log('Original script:');
console.log('================');
console.log(scriptWithIssue);
console.log('================\n');

// Validate the original script
console.log('Validating original script...');
const originalValidation = validatePineScript(scriptWithIssue);
console.log('Validation result:', JSON.stringify(originalValidation, null, 2));

// Fix errors
console.log('\nFixing errors...');
const fixedResult = fixPineScriptErrors(scriptWithIssue);
console.log('Fix result:', JSON.stringify(fixedResult, null, 2));

// Validate the fixed script
console.log('\nValidating fixed script...');
const fixedValidation = validatePineScript(fixedResult.script);
console.log('Validation result:', JSON.stringify(fixedValidation, null, 2));

// Show the improvement
console.log('\nImprovement: ' + 
            (fixedValidation.errors.length < originalValidation.errors.length ? 
             'Fixed ' + (originalValidation.errors.length - fixedValidation.errors.length) + ' errors' : 
             'No improvement'));

console.log('\nFixed script:');
console.log('============');
console.log(fixedResult.script);
console.log('============'); 