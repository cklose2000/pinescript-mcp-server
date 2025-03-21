/**
 * Test script to validate our updated PineScript strategy with volume filter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our modified strategy files
const originalStrategyPath = path.join(__dirname, '..', 'examples', 'Modified_GoldScalping_Strategy.txt');
const updatedStrategyPath = path.join(__dirname, '..', 'examples', 'Modified_GoldScalping_Strategy_With_Volume.txt');

// Function to validate the updated strategy
async function validateUpdatedStrategy() {
  console.log('Validating updated Gold Scalping strategy with volume filter...');
  
  try {
    // Read the updated strategy file
    const strategyScript = fs.readFileSync(updatedStrategyPath, 'utf8');
    console.log(`Updated strategy loaded (${strategyScript.length} chars)`);
    
    // Prepare the request to validate
    const req = {
      jsonrpc: "2.0",
      id: 1,
      method: "validate_pinescript",
      params: {
        script: strategyScript,
        version: "v6"
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Updated strategy validation request sent. Waiting for response...');
  } catch (error) {
    console.error('Error validating updated strategy:', error);
  }
}

// Function to compare original and updated strategies
async function compareStrategies() {
  console.log('Comparing original and updated strategies...');
  
  try {
    // Read both strategy files
    const originalScript = fs.readFileSync(originalStrategyPath, 'utf8');
    const updatedScript = fs.readFileSync(updatedStrategyPath, 'utf8');
    
    // Prepare the request to compare
    const req = {
      jsonrpc: "2.0",
      id: 2,
      method: "compare_pinescript_versions",
      params: {
        old_script: originalScript,
        new_script: updatedScript
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Strategy comparison request sent. Waiting for response...');
  } catch (error) {
    console.error('Error comparing strategies:', error);
  }
}

// Function to format the updated strategy
async function formatUpdatedStrategy() {
  console.log('Formatting updated Gold Scalping strategy...');
  
  try {
    // Read the updated strategy file
    const strategyScript = fs.readFileSync(updatedStrategyPath, 'utf8');
    
    // Prepare the request to format
    const req = {
      jsonrpc: "2.0",
      id: 3,
      method: "format_pinescript",
      params: {
        script: strategyScript,
        indent_size: 4,
        spaces_around_operators: true,
        max_line_length: 100
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Strategy formatting request sent. Waiting for response...');
  } catch (error) {
    console.error('Error formatting updated strategy:', error);
  }
}

// Run the tests in a sequence with delays between them
async function runTests() {
  // First validate the updated strategy
  await validateUpdatedStrategy();
  
  // Wait 2 seconds before comparing strategies
  setTimeout(async () => {
    await compareStrategies();
    
    // Wait 2 seconds before formatting
    setTimeout(async () => {
      await formatUpdatedStrategy();
    }, 2000);
  }, 2000);
}

runTests(); 