#!/usr/bin/env node

/**
 * PineScript MCP CLI
 * 
 * Command-line interface for the PineScript MCP server
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { llmCommand } from './commands/llm.js';
import { testAnthropicCommand } from './commands/test-anthropic.js';
import templatesCommand from './commands/templates.js';

// Initialize the CLI program
const program = new Command()
  .name('pinescript-mcp')
  .description('PineScript MCP CLI - Command-line interface for PineScript tools')
  .version('1.0.0');

// Add all commands
program.addCommand(llmCommand);
program.addCommand(testAnthropicCommand);
program.addCommand(templatesCommand);

// Add help information
program
  .addHelpText('after', `
Example usage:
  $ pinescript-mcp llm analyze my-strategy.pine
  $ pinescript-mcp llm enhance my-strategy.pine -o enhanced-strategies
  $ pinescript-mcp llm config --provider openai --openai-key your-api-key
  $ pinescript-mcp llm config --provider anthropic --anthropic-key your-api-key
  $ pinescript-mcp test-anthropic -p "Describe RSI oscillator" -m haiku
  $ pinescript-mcp templates list
  $ pinescript-mcp templates test
  $ pinescript-mcp templates sync
  $ pinescript-mcp templates optimize strategy.pine -p backtest.txt
  $ pinescript-mcp templates search "volatility strategy"`);

// Parse arguments
program.parse(process.argv);

// Display help if no commands provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 