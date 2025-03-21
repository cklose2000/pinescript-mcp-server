/**
 * Moving Average Crossover Strategy Template
 * 
 * This strategy generates buy signals when a fast moving average crosses above a slow moving average,
 * and sell signals when the fast moving average crosses below the slow moving average.
 * 
 * Default parameters:
 * - Fast MA Length: 9 periods
 * - Slow MA Length: 21 periods
 * - MA Type: SMA (Simple Moving Average)
 */

export const movingAverageCrossTemplate = `
//@version=5
strategy("Moving Average Crossover Strategy", overlay=true)

// Input Parameters
fastLength = input(9, "Fast MA Length")
slowLength = input(21, "Slow MA Length")
maType = input.string("SMA", "MA Type", options=["SMA", "EMA", "WMA", "VWMA"])

// Calculate Moving Averages
fastMA = switch maType
    "SMA" => ta.sma(close, fastLength)
    "EMA" => ta.ema(close, fastLength)
    "WMA" => ta.wma(close, fastLength)
    "VWMA" => ta.vwma(close, fastLength)

slowMA = switch maType
    "SMA" => ta.sma(close, slowLength)
    "EMA" => ta.ema(close, slowLength)
    "WMA" => ta.wma(close, slowLength)
    "VWMA" => ta.vwma(close, slowLength)

// Generate Trading Signals
buySignal = ta.crossover(fastMA, slowMA)
sellSignal = ta.crossunder(fastMA, slowMA)

// Execute Strategy
if (buySignal)
    strategy.entry("Buy", strategy.long)

if (sellSignal)
    strategy.close("Buy")

// Plot Moving Averages
plot(fastMA, "Fast MA", color=#00BFFF, linewidth=2)
plot(slowMA, "Slow MA", color=#FF6347, linewidth=2)

// Plot Buy/Sell Signals
plotshape(buySignal, "Buy Signal", shape.triangleup, location.belowbar, color=color.green, size=size.small)
plotshape(sellSignal, "Sell Signal", shape.triangledown, location.abovebar, color=color.red, size=size.small)
`; 