/**
 * Simplified version of the Gold Scalping strategy
 * This smaller version will be easier to validate with the MCP server
 */

export const simplifiedGoldStrategy = `//@version=6
strategy("Simple Gold Scalping Strategy", overlay=true)

// Simple Moving Average Filter
fastMA = ta.ema(close, 20)
slowMA = ta.ema(close, 50)
uptrend = fastMA > slowMA
downtrend = fastMA < slowMA

// Simple Entry Conditions
buyCondition = ta.crossover(close, fastMA) and uptrend
sellCondition = ta.crossunder(close, fastMA) and downtrend

// Basic Stop Loss & Take Profit
longSL = low - low * 0.01
shortSL = high + high * 0.01
longTP = close + (close - longSL) * 1.5
shortTP = close - (shortSL - close) * 1.5

// Execute Trades
if (buyCondition)
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", from_entry="Long", stop=longSL, limit=longTP)

if (sellCondition)
    strategy.entry("Short", strategy.short)
    strategy.exit("Exit Short", from_entry="Short", stop=shortSL, limit=shortTP)

// Plot Buy/Sell Signals
plotshape(series=buyCondition, location=location.belowbar, color=color.green, style=shape.labelup, title="BUY")
plotshape(series=sellCondition, location=location.abovebar, color=color.red, style=shape.labeldown, title="SELL")

// Plot Moving Averages
plot(fastMA, title="Fast EMA", color=color.green, linewidth=1)
plot(slowMA, title="Slow EMA", color=color.red, linewidth=1)
`;

/**
 * Even simpler version for first validation test
 */
export const miniGoldStrategy = `//@version=6
strategy("Mini Gold Strategy", overlay=true)

// Simple Moving Average
ma = ta.sma(close, 20)

// Basic Entry Conditions
buyCondition = close > ma and close > close[1]
sellCondition = close < ma and close < close[1]

// Execute Trades
if (buyCondition)
    strategy.entry("Long", strategy.long)

if (sellCondition)
    strategy.entry("Short", strategy.short)

// Plot MA
plot(ma, title="SMA", color=color.blue, linewidth=1)
`;

/**
 * Export the strategies
 */
export default {
  simplifiedGoldStrategy,
  miniGoldStrategy
}; 