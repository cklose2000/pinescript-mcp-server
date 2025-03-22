/**
 * Strategy Enhancement Template
 * 
 * This template is used for generating enhanced versions of PineScript trading strategies.
 * It provides a framework for improving existing strategies with better risk management,
 * performance optimizations, and advanced features.
 */

import { createTemplate, PromptCategory, StandardSections, TemplateSection } from '../templateStructure.js';

// Strategy Enhancement template sections
const introductionSection: TemplateSection = {
  ...StandardSections.INTRODUCTION,
  content: `You are an expert PineScript developer and quantitative trading specialist with deep knowledge of technical analysis, algorithmic trading strategies, and financial market behavior. Your task is to enhance existing trading strategies to improve their performance, robustness, and risk management.`
};

const taskSection: TemplateSection = {
  ...StandardSections.TASK,
  content: `Your task is to generate {{count}} improved versions of the provided PineScript strategy. Each enhanced version should address different aspects of the strategy while maintaining its core approach and logic.`
};

const contextSection: TemplateSection = {
  ...StandardSections.CONTEXT,
  content: `Here is the original PineScript strategy that needs to be enhanced:

\`\`\`pinescript
{{strategyContent}}
\`\`\`

Focus on improving these aspects:
1. Risk management (better stop losses, position sizing)
2. Entry and exit conditions (more precise signals, reduced false positives)
3. Adaptability to different market conditions
4. Parameter optimization
5. Adding complementary indicators for confirmation
6. Performance efficiency`
};

const enhancementExamples = `Example 1: Risk Management Enhancement
\`\`\`pinescript
// Strategy with Enhanced Risk Management
// This version adds adaptive position sizing and implements better stop-loss mechanisms
strategy("Enhanced RSI Strategy - Risk Management", overlay=true)

// Original parameters
rsiLength = input(14, "RSI Length")
rsiOverbought = input(70, "RSI Overbought")
rsiOversold = input(30, "RSI Oversold")

// Added risk management parameters
useATRStops = input(true, "Use ATR-based stops")
atrLength = input(14, "ATR Length")
atrMultiplier = input(3.0, "ATR Stop Multiplier")
maxRiskPerTrade = input(2.0, "Max Risk Per Trade (%)")

// Original indicators
rsiValue = rsi(close, rsiLength)
longCondition = crossover(rsiValue, rsiOversold)
shortCondition = crossunder(rsiValue, rsiOverbought)

// Added: ATR for stops
atrValue = atr(atrLength)
stopDistance = atrValue * atrMultiplier

// Calculate position size based on risk
atrRisk = stopDistance / close * 100
positionSize = maxRiskPerTrade / atrRisk * strategy.equity / close
positionSize := math.min(positionSize, strategy.equity / close)

// Execute trades with proper position sizing
if (longCondition)
    strategy.entry("Long", strategy.long, qty=positionSize)
    strategy.exit("Exit Long", "Long", stop=close - stopDistance)
    
if (shortCondition)
    strategy.entry("Short", strategy.short, qty=positionSize)
    strategy.exit("Exit Short", "Short", stop=close + stopDistance)

// Plot indicators
plot(rsiValue, "RSI", color.blue)
hline(rsiOverbought, "Overbought", color.red)
hline(rsiOversold, "Oversold", color.green)
\`\`\`

Example 2: Market Regime Enhancement
\`\`\`pinescript
// Strategy with Market Regime Filter
// This version adds volatility and trend filters to avoid trading in unfavorable conditions
strategy("Enhanced RSI Strategy - Market Regime Filter", overlay=true)

// Original parameters
rsiLength = input(14, "RSI Length")
rsiOverbought = input(70, "RSI Overbought")
rsiOversold = input(30, "RSI Oversold")

// Added market regime parameters
useRegimeFilter = input(true, "Use Market Regime Filter")
adxLength = input(14, "ADX Length")
adxThreshold = input(25, "ADX Threshold")
volPeriod = input(20, "Volatility Period")
volThreshold = input(1.5, "Volatility Threshold")

// Original indicators
rsiValue = rsi(close, rsiLength)
longCondition = crossover(rsiValue, rsiOversold)
shortCondition = crossunder(rsiValue, rsiOverbought)

// Added: Market regime indicators
adxValue = adx(adxLength)
currentVol = stdev(close, volPeriod) / sma(close, volPeriod) * 100
historicalVol = sma(currentVol, 100)
relativeVol = currentVol / historicalVol

// Define favorable market conditions
strongTrend = adxValue > adxThreshold
normalVol = relativeVol < volThreshold
goodRegime = strongTrend and normalVol
tradeCondition = not useRegimeFilter or goodRegime

// Modified entry conditions with regime filter
if (longCondition and tradeCondition)
    strategy.entry("Long", strategy.long)
    
if (shortCondition and tradeCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(rsiValue, "RSI", color.blue)
plot(adxValue, "ADX", color.purple)
hline(rsiOverbought, "Overbought", color.red)
hline(rsiOversold, "Oversold", color.green)
hline(adxThreshold, "ADX Threshold", color.gray)
\`\`\``;

const examplesSection: TemplateSection = {
  ...StandardSections.EXAMPLES,
  content: `Here are examples of enhanced strategies:

${enhancementExamples}`
};

const constraintsSection: TemplateSection = {
  ...StandardSections.CONSTRAINTS,
  content: `Please adhere to these constraints:
1. Each enhanced version MUST be complete, fully functional code that can be directly copied into TradingView Pine Editor
2. Maintain the core strategy concept while adding improvements
3. Include detailed comments explaining the enhancements and their rationale
4. Ensure all enhancements follow Pine Script best practices and syntax
5. Avoid excessive complexity that would make the strategy difficult to understand
6. Respect Pine Script v5 syntax and limitations
7. Generate exactly {{count}} distinct enhanced versions of the strategy
8. Each enhancement should focus on a different aspect (risk management, signal filtering, adaptability, etc.)`
};

const outputFormatSection: TemplateSection = {
  ...StandardSections.OUTPUT_FORMAT,
  content: `Your response must include {{count}} separate enhanced strategies, each presented in this format:

Enhancement #[number]: [Brief Title Describing the Enhancement Focus]

[2-3 sentence description of what this enhancement does and how it improves the strategy]

\`\`\`pinescript
// Complete enhanced strategy code with comments
\`\`\`

Key improvements:
- [bullet point list of specific improvements]

Expected benefits:
- [bullet point list of benefits]`
};

// Create the template
export const strategyEnhancementTemplate = createTemplate(
  'strategy-enhancement',
  'Strategy Enhancement',
  'Generate enhanced versions of PineScript trading strategies with improvements to performance, risk management, and adaptability',
  PromptCategory.ENHANCEMENT,
  [introductionSection, taskSection, contextSection, examplesSection, constraintsSection, outputFormatSection],
  ['strategyContent', 'count']
);

// Export default
export default strategyEnhancementTemplate; 