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
          console.log(`Identified: ${analysis.parameters?.identified?.join(', ') || 'None identified'}`);
          console.log(`Suggestions: ${analysis.parameters?.suggestions?.join('\n             ') || 'No suggestions'}`);
          
          // Logic
          console.log(chalk.yellow('\nLogic:'));
          console.log(`Strengths: ${analysis.logic?.strengths?.join(', ') || 'None identified'}`);
          console.log(`Weaknesses: ${analysis.logic?.weaknesses?.join('\n            ') || 'None identified'}`);
          console.log(`Improvements: ${analysis.logic?.improvements?.join('\n               ') || 'No suggestions'}`);
          
          // Risk
          console.log(chalk.yellow('\nRisk:'));
          console.log(`Assessment: ${analysis.risk?.assessment || 'No assessment'}`);
          console.log(`Recommendations: ${analysis.risk?.recommendations?.join('\n                  ') || 'No recommendations'}`);
          
          // Performance
          console.log(chalk.yellow('\nPerformance:'));
          console.log(`Bottlenecks: ${analysis.performance?.bottlenecks?.join('\n             ') || 'None identified'}`);
          console.log(`Optimizations: ${analysis.performance?.optimizations?.join('\n               ') || 'No suggestions'}`);
          
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
          const enhancements = await llmService.enhanceStrategy(
            strategy,
            parseInt(options.count)
          );
          
          // Save enhanced versions
          console.log(chalk.green('\nEnhanced strategies generated:'));
          
          enhancements.forEach((enhancement: any, index: number) => {
            const fileName = path.basename(file, path.extname(file)) + 
              `_enhanced_${index + 1}${path.extname(file)}`;
            const outputPath = path.join(outputDir, fileName);
            
            fs.writeFileSync(outputPath, enhancement.code || '');
            
            console.log(chalk.yellow(`\n${enhancement.version || `Version ${index + 1}`}:`));
            console.log(`File: ${outputPath}`);
            console.log(`Explanation: ${enhancement.explanation || 'No explanation provided'}`);
            if (enhancement.expectedImprovements && Array.isArray(enhancement.expectedImprovements)) {
              console.log(`Expected improvements: ${enhancement.expectedImprovements.join(', ')}`);
            }
          });
          
        } catch (error) {
          console.error(chalk.red(`Error enhancing strategy: ${error}`));
        }
      })
  )
  .addCommand(
    new Command('analyze-backtest')
      .description('Analyze backtest results for a strategy')
      .argument('<results>', 'JSON file containing backtest results')
      .argument('<strategy>', 'PineScript file that was backtested')
      .action(async (resultsFile: string, strategyFile: string) => {
        try {
          // Check if files exist
          const resultsPath = path.resolve(resultsFile);
          const strategyPath = path.resolve(strategyFile);
          
          if (!fs.existsSync(resultsPath)) {
            console.error(chalk.red(`Results file not found: ${resultsPath}`));
            return;
          }
          
          if (!fs.existsSync(strategyPath)) {
            console.error(chalk.red(`Strategy file not found: ${strategyPath}`));
            return;
          }
          
          // Read file contents
          const resultsContent = fs.readFileSync(resultsPath, 'utf8');
          const strategyContent = fs.readFileSync(strategyPath, 'utf8');
          
          // Analyze backtest results
          console.log(chalk.cyan('Analyzing backtest results...'));
          const analysis = await llmService.analyzeBacktest(resultsContent, strategyContent);
          
          // Display results
          console.log(chalk.green('\nBacktest Analysis:'));
          
          // Overall assessment
          if (analysis.overall) {
            console.log(chalk.yellow('\nOverall Assessment:'));
            console.log(`${analysis.overall.assessment}`);
            if (analysis.overall.score) {
              console.log(`Score: ${analysis.overall.score}/10`);
            }
          }
          
          // Metrics
          if (analysis.metrics) {
            console.log(chalk.yellow('\nMetrics:'));
            for (const [key, value] of Object.entries(analysis.metrics)) {
              console.log(`${key}: ${value}`);
            }
          }
          
          // Concerns
          console.log(chalk.yellow('\nConcerns:'));
          console.log(analysis.concerns?.map(concern => `- ${concern}`).join('\n') || '- None identified');
          
          // Suggestions
          console.log(chalk.yellow('\nSuggestions:'));
          console.log(analysis.suggestions?.map(suggestion => `- ${suggestion}`).join('\n') || '- No suggestions');
          
          // Parameter adjustments
          if (analysis.parameterAdjustments && analysis.parameterAdjustments.length > 0) {
            console.log(chalk.yellow('\nParameter Adjustments:'));
            analysis.parameterAdjustments.forEach(param => {
              console.log(`- Parameter: ${param.parameter || 'Unnamed parameter'}`);
              console.log(`  Current: ${param.currentValue || 'Not specified'}`);
              console.log(`  Suggested: ${param.suggestedValue || 'Not specified'}`);
              console.log(`  Rationale: ${param.rationale || 'No rationale provided'}`);
            });
          } else {
            console.log(chalk.yellow('\nParameter Adjustments:'));
            console.log('- No parameter adjustments suggested');
          }
          
        } catch (error) {
          console.error(chalk.red(`Error analyzing backtest results: ${error}`));
        }
      })
  )
  .addCommand(
    new Command('config')
      .description('Configure LLM settings')
      .option('--provider <provider>', 'Set the default LLM provider (openai, anthropic, mock)')
      .option('--openai-key <key>', 'Set the OpenAI API key')
      .option('--openai-model <model>', 'Set the default OpenAI model (e.g., gpt-4-turbo)')
      .option('--anthropic-key <key>', 'Set the Anthropic API key')
      .option('--anthropic-model <model>', 'Set the default Anthropic model (e.g., claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307)')
      .action((options) => {
        // Validate provider option
        if (options.provider && !['openai', 'anthropic', 'mock'].includes(options.provider)) {
          console.error(chalk.red(`Invalid provider: ${options.provider}. Must be one of: openai, anthropic, mock`));
          return;
        }
        
        // Validate Anthropic model if provided
        if (options.anthropicModel && 
            !['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'].includes(options.anthropicModel)) {
          console.warn(chalk.yellow(`Warning: Unrecognized Anthropic model: ${options.anthropicModel}`));
          console.warn(chalk.yellow(`Available models: claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307`));
        }
        
        // Update config with provided options
        configureLLM({
          provider: options.provider as 'openai' | 'anthropic' | 'mock',
          openaiKey: options.openaiKey,
          openaiModel: options.openaiModel,
          anthropicKey: options.anthropicKey,
          anthropicModel: options.anthropicModel
        });
        
        console.log(chalk.green('LLM configuration updated successfully'));
      })
  ); 