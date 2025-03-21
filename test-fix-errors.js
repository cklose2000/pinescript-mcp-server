/**
 * Test script to test the PineScript error fixer
 */

// Import the fixer and validator
import { fixPineScriptErrors } from './src/fixers/errorFixer.js';
import { validatePineScript } from './src/validators/syntaxValidator.js';

// Script with common issues
const scriptWithIssues = `//@version=5
indicator("Example With Issues")

//Missing semicolons
var1 = 10
var2 = 20
result = var1 + var2

//Unbalanced brackets
if (close > open {
    var3 = high
}

//Unclosed string
message = "This string is not closed

//Using := without var declaration
counter = 0
counter := counter + 1

//Missing closing parenthesis in function call
plot(close, "Price", color=color.blue`;

// Try to fix the script
console.log('Original script:');
console.log('================');
console.log(scriptWithIssues);
console.log('================\n');

// Validate the original script
console.log('Validating original script...');
const originalValidation = validatePineScript(scriptWithIssues);
console.log('Validation result:', JSON.stringify(originalValidation, null, 2));

// Fix errors
console.log('\nFixing errors...');
const fixedResult = fixPineScriptErrors(scriptWithIssues);
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