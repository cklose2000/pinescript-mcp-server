import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { llmService } from '../../services/llmService.js';
import { configureLLM } from '../../config/userConfig.js';
import chalk from 'chalk';

interface EnhanceOptions {
  count: string;
  output: string;
}

interface ConfigOptions {
  provider?: string;
  openaiKey?: string;
  openaiModel?: string;
  anthropicKey?: string;
  anthropicModel?: string;
}

/**
 * CLI command for LLM-related functionality
 */
export const llmCommand = new Command('llm')
  .description('Use LLM to analyze and improve PineScript strategies')
  .addCommand(
    new Command('analyze')
      .description('Analyze a PineScript strategy')
      .argument('<file>', 'PineScript file to analyze')
      .action(async (file: string) => {
        try {
          // Check if file exists
          const filePath = path.resolve(file);
          if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`File not found: ${filePath}`));
            return;
          }

          // Read strategy content
          const strategy = fs.readFileSync(filePath, 'utf8');
          
          console.log(chalk.cyan('Analyzing strategy...'));
          const analysis = await llmService.analyzeStrategy(strategy);
          
          console.log(chalk.green('\nStrategy Analysis:'));
          
          // Parameters
          console.log(chalk.yellow('\nParameters:'));
          console.log(`Identified: ${analysis.parameters.identified.join(', ')}`);
          console.log(`Suggestions: ${analysis.parameters.suggestions.join('\n             ')}`);
          
          // Logic
          console.log(chalk.yellow('\nLogic:'));
          console.log(`Strengths: ${analysis.logic.strengths.join(', ')}`);
          console.log(`Weaknesses: ${analysis.logic.weaknesses.join('\n            ')}`);
          console.log(`Improvements: ${analysis.logic.improvements.join('\n               ')}`);
          
          // Risk
          console.log(chalk.yellow('\nRisk:'));
          console.log(`Assessment: ${analysis.risk.assessment}`);
          console.log(`Recommendations: ${analysis.risk.recommendations.join('\n                  ')}`);
          
          // Performance
          console.log(chalk.yellow('\nPerformance:'));
          console.log(`Bottlenecks: ${analysis.performance.bottlenecks.join('\n             ')}`);
          console.log(`Optimizations: ${analysis.performance.optimizations.join('\n               ')}`);
          
        } catch (error) {
          console.error(chalk.red(`Error analyzing strategy: ${error}`));
        }
      })
  )
  .addCommand(
    new Command('enhance')
      .description('Generate enhanced versions of a strategy')
      .argument('<file>', 'PineScript file to enhance')
      .option('-c, --count <number>', 'Number of variations to generate', '3')
      .option('-o, --output <dir>', 'Output directory for enhanced strategies', './enhanced')
      .action(async (file: string, options: EnhanceOptions) => {
        try {
          // Check if file exists
          const filePath = path.resolve(file);
          if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`File not found: ${filePath}`));
            return;
          }
          
          // Create output directory if it doesn't exist
          const outputDir = path.resolve(options.output);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          
          // Read strategy content
          const strategy = fs.readFileSync(filePath, 'utf8');
          
          // First analyze the strategy
          console.log(chalk.cyan('Analyzing strategy...'));
          const analysis = await llmService.analyzeStrategy(strategy);
          
          // Then generate enhancements
          console.log(chalk.cyan(`Generating ${options.count} enhanced versions...`));
          const enhancements = await llmService.generateEnhancements(
            JSON.stringify(analysis), 
            strategy, 
            parseInt(options.count)
          );
          
          // Save enhanced versions
          console.log(chalk.green('\nEnhanced strategies generated:'));
          
          enhancements.forEach((enhancement, index) => {
            const fileName = path.basename(file, path.extname(file)) + 
              `_enhanced_${index + 1}${path.extname(file)}`;
            const outputPath = path.join(outputDir, fileName);
            
            fs.writeFileSync(outputPath, enhancement.code);
            
            console.log(chalk.yellow(`\n${enhancement.version}:`));
            console.log(`File: ${outputPath}`);
            console.log(`Explanation: ${enhancement.explanation}`);
            console.log(`Expected improvements: ${enhancement.expectedImprovements.join(', ')}`);
          });
          
        } catch (error) {
          console.error(chalk.red(`Error enhancing strategy: ${error}`));
        }
      })
  )
  .addCommand(
    new Command('config')
      .description('Configure LLM settings')
      .option('--provider <provider>', 'Set default LLM provider (openai, anthropic, mock)')
      .option('--openai-key <key>', 'Set OpenAI API key')
      .option('--openai-model <model>', 'Set OpenAI model (e.g. gpt-4-turbo, gpt-3.5-turbo)')
      .option('--anthropic-key <key>', 'Set Anthropic API key')
      .option('--anthropic-model <model>', 'Set Anthropic model (e.g. claude-3-opus, claude-3-sonnet)')
      .action((options: ConfigOptions) => {
        try {
          const llmConfig: any = {};
          
          if (options.provider) {
            llmConfig.defaultProvider = options.provider;
          }
          
          if (options.openaiKey || options.openaiModel) {
            llmConfig.openai = {};
            
            if (options.openaiKey) {
              llmConfig.openai.apiKey = options.openaiKey;
            }
            
            if (options.openaiModel) {
              llmConfig.openai.defaultModel = options.openaiModel;
            }
          }
          
          if (options.anthropicKey || options.anthropicModel) {
            llmConfig.anthropic = {};
            
            if (options.anthropicKey) {
              llmConfig.anthropic.apiKey = options.anthropicKey;
            }
            
            if (options.anthropicModel) {
              llmConfig.anthropic.defaultModel = options.anthropicModel;
            }
          }
          
          // Update config
          configureLLM(llmConfig);
          console.log(chalk.green('LLM configuration updated successfully'));
          
        } catch (error) {
          console.error(chalk.red(`Error updating LLM configuration: ${error}`));
        }
      })
  ); 