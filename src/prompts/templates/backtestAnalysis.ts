/**
 * Backtest Analysis Template
 * 
 * This template is used for analyzing backtest results of PineScript trading strategies.
 * It provides a comprehensive analysis of performance metrics, strengths, concerns,
 * and parameter optimization suggestions.
 */

import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../templateStructure.js';

// Example of a good backtest analysis output
const analysisExample = `{
  "overall": {
    "assessment": "The strategy shows promise with a solid profit factor and reasonable win rate, but suffers from excessive drawdown which indicates potential risk management issues.",
    "score": 6.5
  },
  "metrics": {
    "profitFactor": "1.85 - Good, but could be improved to above 2.0 for more robust performance",
    "winRate": "62% - Acceptable, indicating the strategy has a decent edge",
    "drawdown": "18.2% - Concerning, suggests inadequate risk management or stop loss placement",
    "averageWin": "$245 - Reasonable, but only 1.2x average loss which is suboptimal",
    "averageLoss": "$205 - Too high relative to average win, risk-reward ratio needs improvement",
    "sharpeRatio": "1.35 - Below ideal level of 2.0, indicating inconsistent returns"
  },
  "strengths": [
    "Consistent performance across different market conditions",
    "Good entry timing with most trades entering near optimal points",
    "Effective trend identification",
    "Reasonable trade frequency with 3-4 trades per week"
  ],
  "concerns": [
    "Excessive drawdown periods lasting over 3 months",
    "Poor performance during high volatility environments",
    "Several large consecutive losses observed",
    "Position sizing appears to be static rather than adaptive"
  ],
  "suggestions": [
    "Implement adaptive position sizing based on volatility",
    "Add a market regime filter to avoid trading during unfavorable conditions",
    "Consider implementing a maximum daily loss limit",
    "Optimize exit strategy to secure profits more effectively",
    "Incorporate trailing stops to protect gains during strong trends"
  ],
  "parameterAdjustments": [
    {
      "parameter": "EMA length",
      "currentValue": "14",
      "suggestedValue": "21",
      "rationale": "Increasing the EMA length would reduce false signals during choppy market conditions, which account for 65% of losing trades"
    },
    {
      "parameter": "ATR Multiplier",
      "currentValue": "2.0",
      "suggestedValue": "2.5",
      "rationale": "A higher ATR multiplier would reduce the number of premature stop-outs, which account for approximately 40% of losing trades"
    },
    {
      "parameter": "Profit Target",
      "currentValue": "None",
      "suggestedValue": "1.5 × ATR",
      "rationale": "Adding a dynamic profit target would secure gains more reliably and improve the overall risk-reward ratio"
    }
  ]
}`;

// Backtest Analysis template sections
const taskSection: TemplateSection = {
  ...StandardSections.TASK,
  content: `Your task is to analyze the provided backtest results for a PineScript trading strategy and provide a detailed assessment of its performance, including strengths, concerns, and optimization suggestions.`
};

const contextSection: TemplateSection = {
  ...StandardSections.CONTEXT,
  content: `The following are the backtest results for a PineScript trading strategy:

Backtest Results:
\`\`\`json
{{results}}
\`\`\`

Strategy Code:
\`\`\`pinescript
{{strategy}}
\`\`\``
};

const examplesSection: TemplateSection = {
  ...StandardSections.EXAMPLES,
  content: `Here is an example of the expected analysis output:

${analysisExample}`
};

const constraintsSection: TemplateSection = {
  ...StandardSections.CONSTRAINTS,
  content: `Please adhere to these constraints:
1. Focus on practical improvements that could enhance the strategy's performance
2. Base your analysis on the actual metrics provided, not assumptions
3. Provide specific parameter adjustments with clear rationales
4. Consider both risk management and return optimization
5. Be specific about which metrics are concerning and why
6. Use established trading and statistical principles in your analysis`
};

const outputFormatSection: TemplateSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Your response must be in valid JSON format with the following structure:

{
  "overall": {
    "assessment": "string describing overall performance",
    "score": number from 1-10
  },
  "metrics": {
    "profitFactor": "string explanation",
    "winRate": "string explanation",
    "drawdown": "string explanation",
    // Include other relevant metrics
  },
  "strengths": ["string", "string", ...],
  "concerns": ["string", "string", ...],
  "suggestions": ["string", "string", ...],
  "parameterAdjustments": [
    {
      "parameter": "parameter name",
      "currentValue": "current value",
      "suggestedValue": "suggested value",
      "rationale": "explanation for change"
    },
    // More parameter adjustments...
  ]
}`
};

// Backtest-specific introduction
const introductionSection: TemplateSection = {
  ...StandardSections.INTRODUCTION,
  content: `You are an expert financial analyst and algorithmic trading specialist with deep experience in evaluating trading strategy performance based on backtest results.`
};

// Create the template
export const backtestAnalysisTemplate = createTemplate(
  'backtest-analysis',
  'Backtest Analysis',
  'Comprehensive analysis of trading strategy backtest results',
  PromptCategory.BACKTEST,
  [introductionSection, taskSection, contextSection, examplesSection, constraintsSection, outputFormatSection],
  ['results', 'strategy']
);

// Export default
export default backtestAnalysisTemplate; 