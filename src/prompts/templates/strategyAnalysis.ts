/**
 * Strategy Analysis Template
 * 
 * This template is used for analyzing PineScript trading strategies.
 * It provides a comprehensive analysis of parameters, logic, risk management,
 * and performance considerations.
 */

import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../templateStructure.js';

// Example of a good strategy analysis output
const analysisExample = `{
  "parameters": {
    "identified": [
      "length (14): Period for RSI calculation",
      "overbought (70): Level to determine overbought conditions",
      "oversold (30): Level to determine oversold conditions",
      "source (close): Price data used for calculations"
    ],
    "suggestions": [
      "Consider adding an ATR parameter for dynamic stop-loss calculation",
      "Add filter parameters to reduce false signals during choppy markets"
    ]
  },
  "logic": {
    "strengths": [
      "Clear entry and exit conditions based on RSI levels",
      "Simple and easy to understand approach with minimal complexity",
      "Good use of crossover/crossunder for signal generation"
    ],
    "weaknesses": [
      "No market regime filter leads to poor performance in trending markets",
      "Single indicator approach without confirmation signals",
      "No consideration for volatility environments"
    ],
    "improvements": [
      "Add a trend filter (e.g., moving average direction)",
      "Implement signal confirmation with volume or price action",
      "Consider adaptive parameters based on volatility"
    ]
  },
  "risk": {
    "assessment": "Medium to high risk due to lack of explicit stop-loss mechanisms and position sizing rules",
    "recommendations": [
      "Implement ATR-based stops to adapt to market volatility",
      "Add position sizing based on account risk percentage",
      "Consider time-based exits for trades that don't trigger profit targets",
      "Implement maximum loss per trade rules"
    ]
  },
  "performance": {
    "bottlenecks": [
      "Multiple redundant calculations of RSI",
      "Inefficient use of variables for signal generation"
    ],
    "optimizations": [
      "Store RSI value in a variable to avoid recalculation",
      "Consider using security() for higher timeframe analysis if needed",
      "Simplify plotting code for better execution speed"
    ]
  }
}`;

// Strategy Analysis template sections
const taskSection: TemplateSection = {
  ...StandardSections.TASK,
  content: `Your task is to analyze the provided PineScript trading strategy and provide a detailed assessment of its parameters, logic, risk management approach, and performance characteristics.`
};

const contextSection: TemplateSection = {
  ...StandardSections.CONTEXT,
  content: `Here is the PineScript code for the trading strategy to analyze:

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
1. Focus on practical improvements that could enhance the strategy
2. Include specific parameter suggestions with explanations
3. Consider both risk management and signal generation logic
4. Be specific about performance bottlenecks and how to address them
5. Consider standard trading best practices
6. Identify any missing components that should be added to the strategy`
};

const outputFormatSection: TemplateSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Your response must be in valid JSON format with the following structure:

{
  "parameters": {
    "identified": ["parameter description", ...],
    "suggestions": ["parameter suggestion", ...]
  },
  "logic": {
    "strengths": ["strength description", ...],
    "weaknesses": ["weakness description", ...],
    "improvements": ["improvement suggestion", ...]
  },
  "risk": {
    "assessment": "overall risk assessment",
    "recommendations": ["risk management suggestion", ...]
  },
  "performance": {
    "bottlenecks": ["bottleneck description", ...],
    "optimizations": ["optimization suggestion", ...]
  }
}`
};

// Create the template
export const strategyAnalysisTemplate = createTemplate(
  'strategy-analysis',
  'Strategy Analysis',
  'Comprehensive analysis of PineScript trading strategies',
  PromptCategory.ANALYSIS,
  [StandardSections.INTRODUCTION, taskSection, contextSection, examplesSection, constraintsSection, outputFormatSection],
  ['strategy']
);

// Export default
export default strategyAnalysisTemplate; 