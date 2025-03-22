/**
 * Strategy Optimization Template
 * 
 * This template is used for suggesting parameter optimizations for PineScript strategies.
 * It provides recommendations for parameter tuning based on performance analysis.
 */

import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../templateStructure.js';

// Example of a good optimization output
const optimizationExample = `{
  "parameterSuggestions": [
    {
      "name": "fastLength",
      "currentValue": 9,
      "suggestedValue": 12,
      "rationale": "Increasing the fast MA length reduces noise and false signals in volatile market conditions while still capturing meaningful trends.",
      "expectedImpact": "Higher win rate but potentially fewer trades. Expected Sharpe ratio improvement: ~15%."
    },
    {
      "name": "slowLength",
      "currentValue": 21,
      "suggestedValue": 26,
      "rationale": "A longer slow MA period creates better trend identification and reduces whipsaws during consolidation periods.",
      "expectedImpact": "Improved profit factor and reduced drawdown. Expected drawdown reduction: ~20%."
    },
    {
      "name": "stopLoss",
      "currentValue": "N/A - Not implemented",
      "suggestedValue": "2 * ATR(14)",
      "rationale": "Adding a dynamic ATR-based stop loss will protect capital during adverse moves while adapting to market volatility.",
      "expectedImpact": "Reduced average loss size and improved risk management. Expected risk-adjusted return improvement: ~25%."
    }
  ],
  "optimizationApproach": {
    "methodology": "Walk-forward optimization with 70/30 in-sample/out-of-sample testing",
    "metrics": ["Sharpe Ratio", "Maximum Drawdown", "Profit Factor"],
    "timeframes": ["Current timeframe", "One timeframe higher for confirmation"]
  },
  "marketConditions": {
    "bestPerforming": ["Trending markets with clear directional momentum", "Low to moderate volatility environments"],
    "worstPerforming": ["Choppy, range-bound markets", "Extreme volatility regimes"],
    "recommendations": ["Add market regime filter based on ADX > 20 to only trade in trending conditions", 
                        "Implement volatility adjustment using ATR percentile"]
  },
  "implementationPriority": [
    {
      "change": "Add stop loss mechanism",
      "priority": "High",
      "complexity": "Medium",
      "impact": "High"
    },
    {
      "change": "Adjust MA lengths",
      "priority": "Medium",
      "complexity": "Low",
      "impact": "Medium"
    },
    {
      "change": "Add market regime filter",
      "priority": "Medium",
      "complexity": "Medium",
      "impact": "High"
    }
  ]
}`;

// Strategy Optimization template sections
const taskSection: TemplateSection = {
  ...StandardSections.TASK,
  content: `Your task is to analyze the provided strategy and its current parameters, then suggest optimization opportunities to improve its performance. You should provide specific parameter adjustments with rationale and expected impact.`
};

const contextSection: TemplateSection = {
  ...StandardSections.CONTEXT,
  content: `Here are the details of the trading strategy to optimize:

Strategy Code:
\`\`\`pinescript
{{strategy}}
\`\`\`

Current Performance Metrics:
\`\`\`
{{performance}}
\`\`\`

Suggested parameters to focus on (if empty, analyze all parameters):
{{parameters}}
`
};

const examplesSection: TemplateSection = {
  ...StandardSections.EXAMPLES,
  content: `Here is an example of the expected optimization output:

${optimizationExample}`
};

const constraintsSection: TemplateSection = {
  ...StandardSections.CONSTRAINTS,
  content: `Please adhere to these constraints:
1. Focus on parameter adjustments that are practical and implementable
2. Provide clear rationale for each suggested change
3. Quantify the expected impact whenever possible
4. Consider different market conditions in your suggestions
5. Prioritize changes based on impact and implementation difficulty
6. Only suggest changes that are statistically sound and avoid overfitting
7. Respect the original strategy's design philosophy and approach`
};

const outputFormatSection: TemplateSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Your response must be in valid JSON format with the following structure:

{
  "parameterSuggestions": [
    {
      "name": "parameter name",
      "currentValue": current value,
      "suggestedValue": suggested value,
      "rationale": "explanation for this suggestion",
      "expectedImpact": "expected performance improvement"
    }
  ],
  "optimizationApproach": {
    "methodology": "suggested optimization method",
    "metrics": ["primary metrics to optimize for"],
    "timeframes": ["relevant timeframes to consider"]
  },
  "marketConditions": {
    "bestPerforming": ["market conditions where strategy works best"],
    "worstPerforming": ["market conditions where strategy struggles"],
    "recommendations": ["adaptations for different market regimes"]
  },
  "implementationPriority": [
    {
      "change": "specific change to implement",
      "priority": "High/Medium/Low",
      "complexity": "High/Medium/Low",
      "impact": "High/Medium/Low"
    }
  ]
}`
};

// Create the template
export const optimizationTemplate = createTemplate(
  'strategy-optimization',
  'Strategy Parameter Optimization',
  'Provides data-driven suggestions for optimizing strategy parameters',
  PromptCategory.OPTIMIZATION,
  [StandardSections.INTRODUCTION, taskSection, contextSection, examplesSection, constraintsSection, outputFormatSection],
  ['strategy', 'performance', 'parameters']
);

// Export default
export default optimizationTemplate; 