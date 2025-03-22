/**
 * Test command for Anthropic provider
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { AnthropicProvider } from '../../services/anthropicProvider.js';

export const testAnthropicCommand = new Command('test-anthropic')
  .description('Test Anthropic API integration')
  .option('-p, --prompt <text>', 'Custom prompt to send', 'Explain the basic concept of a moving average in trading in 2-3 sentences.')
  .option('-m, --model <model>', 'Model to use (opus, sonnet, haiku)', 'sonnet')
  .action(async (options) => {
    console.log(chalk.cyan('Testing Anthropic API integration...'));
    
    // Map model shorthand to full model name
    const modelMap: Record<string, string> = {
      'opus': 'claude-3-opus-20240229',
      'sonnet': 'claude-3-sonnet-20240229',
      'haiku': 'claude-3-haiku-20240307'
    };
    
    const modelName = modelMap[options.model] || options.model;
    
    try {
      const provider = new AnthropicProvider();
      
      console.log(chalk.yellow(`Sending prompt to ${modelName}:`));
      console.log(options.prompt);
      console.log(chalk.yellow('Response:'));
      
      const startTime = Date.now();
      const response = await provider.sendPrompt(options.prompt, {
        model: modelName
      });
      const endTime = Date.now();
      
      console.log(chalk.green(response));
      console.log(chalk.yellow(`Response time: ${(endTime - startTime) / 1000} seconds`));
      
    } catch (error) {
      console.error(chalk.red(`Error testing Anthropic API: ${error}`));
    }
  }); 