/**
 * Test script to validate our modified PineScript strategy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { miniGoldStrategy, simplifiedGoldStrategy } from './templates/simplified-gold-strategy.js';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our modified strategy file
const strategyFilePath = path.join(__dirname, '..', 'examples', 'Modified_GoldScalping_Strategy.txt');

// First test the connection with a minimal script
async function testConnection() {
  console.log('Testing MCP server connection with minimal script...');
  
  try {
    // Create a minimal test script
    const testScript = `//@version=5
indicator("Simple Test", overlay=true)
plot(close, "Price", color=color.blue)`;
    
    // Prepare the request to validate
    const req = {
      jsonrpc: "2.0",
      id: 1,
      method: "test_connection",
      params: {
        version: "5"
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Test connection request sent. Waiting for response...');
    
    // Note: In a real scenario, we would need to handle the response
    // but for this test we'll just let the MCP server output to console
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

// Function to validate mini strategy
async function validateMiniStrategy() {
  console.log('Validating mini Gold strategy...');
  
  try {
    // Prepare the request to validate
    const req = {
      jsonrpc: "2.0",
      id: 2,
      method: "validate_pinescript",
      params: {
        script: miniGoldStrategy,
        version: "v6"
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Mini strategy validation request sent. Waiting for response...');
  } catch (error) {
    console.error('Error validating mini strategy:', error);
  }
}

// Function to validate simplified strategy
async function validateSimplifiedStrategy() {
  console.log('Validating simplified Gold Scalping strategy...');
  
  try {
    // Prepare the request to validate
    const req = {
      jsonrpc: "2.0",
      id: 3,
      method: "validate_pinescript",
      params: {
        script: simplifiedGoldStrategy,
        version: "v6"
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Simplified strategy validation request sent. Waiting for response...');
  } catch (error) {
    console.error('Error validating simplified strategy:', error);
  }
}

// Function to validate our full strategy
async function validateFullStrategy() {
  console.log('Validating full Gold Scalping strategy...');
  
  try {
    // Read the strategy file
    const strategyScript = fs.readFileSync(strategyFilePath, 'utf8');
    console.log(`Strategy loaded (${strategyScript.length} chars)`);
    
    // Prepare the request to validate
    const req = {
      jsonrpc: "2.0",
      id: 4,
      method: "validate_pinescript",
      params: {
        script: strategyScript,
        version: "v6"
      }
    };
    
    // Send the request to stdin
    process.stdout.write(JSON.stringify(req) + '\n');
    
    console.log('Full strategy validation request sent. Waiting for response...');
  } catch (error) {
    console.error('Error validating full strategy:', error);
  }
}

// Run the tests in a sequence with delays between them
async function runTests() {
  // First test connection with minimal script
  await testConnection();
  
  // Wait 2 seconds before trying the mini strategy
  setTimeout(async () => {
    await validateMiniStrategy();
    
    // Wait 2 seconds before trying the simplified strategy
    setTimeout(async () => {
      await validateSimplifiedStrategy();
      
      // Wait 2 seconds before trying the full strategy
      setTimeout(async () => {
        await validateFullStrategy();
      }, 2000);
    }, 2000);
  }, 2000);
}

runTests(); 