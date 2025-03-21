/**
 * Simple test script to validate PineScript directly
 */

// Import the validator directly
import { validatePineScript } from '../../src/validators/syntaxValidator.js';
import { getTestScript } from '../../src/templates/testScript.js';

// Get the minimal test script
const testScript = getTestScript();
console.log('Testing with minimal script:');
console.log('============================');
console.log(testScript);
console.log('============================');

// Validate it
console.log('\nValidating PineScript...');
try {
  const result = validatePineScript(testScript);
  console.log('Validation result:', JSON.stringify(result, null, 2));
  
  if (result.valid) {
    console.log('\nValidation successful - script is syntactically correct!');
  } else {
    console.log('\nValidation failed with errors:', result.errors);
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
  }
} catch (error) {
  console.error('Validation error:', error);
} 