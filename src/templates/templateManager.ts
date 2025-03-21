/**
 * PineScript Template Manager
 * 
 * Manages templates for strategies and indicators
 */

// Import our strategy templates
import { movingAverageCrossTemplate } from './strategies/movingAverageCross.js';
import { rsiStrategyTemplate } from './strategies/rsiStrategy.js';

// Import our indicator templates
import { bollingerBandsTemplate } from './indicators/bollingerBands.js';
import { macdTemplate } from './indicators/macd.js';

/**
 * Template types
 */
export enum TemplateType {
  STRATEGY = 'strategy',
  INDICATOR = 'indicator'
}

/**
 * Gets a template by type and name
 * 
 * @param type The template type
 * @param name The template name
 * @returns The template code
 */
export function getTemplate(type: TemplateType, name: string): string {
  // Get template based on type
  if (type === TemplateType.STRATEGY) {
    return getStrategyTemplate(name);
  } else if (type === TemplateType.INDICATOR) {
    return getIndicatorTemplate(name);
  }
  
  throw new Error(`Unknown template type: ${type}`);
}

/**
 * Gets a strategy template by name
 * 
 * @param name The template name
 * @returns The strategy template code
 */
function getStrategyTemplate(name: string): string {
  // Check if template exists
  switch (name.toLowerCase()) {
    case 'macd':
      return `
//@version=5
strategy("MACD Strategy", overlay=true)

// Input parameters
fastLength = input(12, "Fast Length")
slowLength = input(26, "Slow Length")
signalLength = input(9, "Signal Length")

// Calculate indicators
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Define trading conditions
longCondition = ta.crossover(macdLine, signalLine)
shortCondition = ta.crossunder(macdLine, signalLine)

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(macdLine, "MACD Line", color.blue)
plot(signalLine, "Signal Line", color.red)
plot(histLine, "Histogram", color.purple, style=plot.style_histogram)
      `;
    case 'movingaveragecross':
    case 'ma_cross':
    case 'ma cross':
      return movingAverageCrossTemplate;
    case 'rsi':
    case 'rsistrategy':
    case 'rsi strategy':
      return rsiStrategyTemplate;
    default:
      // Return a custom named template
      return `
//@version=5
strategy("${name}", overlay=true)

// Input parameters
length = input(14, "Length")

// Your custom strategy logic here

// Plot indicators
plot(close, "Price", color.blue)
      `;
  }
}

/**
 * Gets an indicator template by name
 * 
 * @param name The template name
 * @returns The indicator template code
 */
function getIndicatorTemplate(name: string): string {
  // Check if template exists
  switch (name.toLowerCase()) {
    case 'rsi':
      return `
//@version=5
indicator("RSI", overlay=false)

// Input parameters
length = input(14, "Length")

// Calculate indicator
rsiValue = ta.rsi(close, length)

// Define levels
overbought = 70
oversold = 30

// Plot indicator
plot(rsiValue, "RSI", color.purple)
hline(overbought, "Overbought", color.red)
hline(oversold, "Oversold", color.green)
      `;
    case 'bollinger':
    case 'bollingerbands':
    case 'bollinger bands':
      return bollingerBandsTemplate;
    case 'macd':
      return macdTemplate;
    default:
      // Return a custom named template
      return `
//@version=5
indicator("${name}", overlay=false)

// Input parameters
length = input(14, "Length")

// Your custom indicator logic here

// Plot indicator
plot(ta.sma(close, length), "SMA", color.blue)
      `;
  }
} 