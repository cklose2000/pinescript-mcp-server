/**
 * Basic PineScript Validation Example
 * 
 * This example demonstrates how to use the PineScript MCP server to validate code.
 */

// Sample PineScript code for a simple strategy
const pineScriptCode = `
//@version=5
strategy("My Strategy", overlay=true)

// Input parameters
fastLength = input(12, "Fast Length")
slowLength = input(26, "Slow Length")

// Calculate indicators
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Define trading conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(fastMA, "Fast MA", color.blue)
plot(slowMA, "Slow MA", color.red)
`;

// Sample code with an error
const pineScriptWithError = `
//@version=5
strategy("My Strategy", overlay=true)

// Input parameters
fastLength = input(12, "Fast Length")
slowLength = input(26, "Slow Length")

// Calculate indicators
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Define trading conditions
longCondition = ta.crossover(fastMA, slowMA
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(fastMA, "Fast MA", color.blue)
plot(slowMA, "Slow MA", color.red)
`;

// Example of how to use the validation
console.log("Validating correct PineScript code...");
// In a real implementation, you would call the MCP server here
console.log("Sample code would be validated by MCP server");

console.log("\nValidating PineScript code with syntax error...");
// In a real implementation, you would call the MCP server here
console.log("Sample code with error would be validated by MCP server");

// Example of using the template functionality
console.log("\nGetting a strategy template...");
// In a real implementation, you would call the MCP server here
console.log("MCP server would return a strategy template"); 