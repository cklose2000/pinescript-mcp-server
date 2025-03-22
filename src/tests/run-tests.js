/**
 * Test Runner Script
 * 
 * This script runs the specified test file using the appropriate Node.js flags
 * for ES modules with TypeScript support.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run a test file with appropriate Node.js flags
 * @param {string} testFile - The path to the test file relative to the tests directory
 */
function runTest(testFile) {
  const fullPath = path.join(__dirname, testFile);
  
  console.log(`Running test: ${testFile}`);
  console.log('-------------------------------------------');
  
  // Create a child process with the appropriate flags for TypeScript ESM
  const testProcess = spawn('node', [
    '--experimental-specifier-resolution=node',
    '--loader=ts-node/esm',
    fullPath
  ], {
    stdio: 'inherit'
  });
  
  // Handle process completion
  testProcess.on('close', (code) => {
    console.log('-------------------------------------------');
    console.log(`Test ${testFile} ${code === 0 ? 'completed successfully' : 'failed with exit code ' + code}`);
  });
}

// Get the test file from command line arguments
const testFile = process.argv[2];

if (!testFile) {
  console.error('Please specify a test file to run.');
  console.log('Usage: node run-tests.js <test-file>');
  console.log('Example: node run-tests.js test-template-manager.ts');
  process.exit(1);
}

// Run the specified test
runTest(testFile); 