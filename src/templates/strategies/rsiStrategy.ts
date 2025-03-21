/**
 * RSI Strategy Template
 * 
 * This strategy uses the Relative Strength Index (RSI) to generate buy and sell signals.
 * Buy when RSI crosses below the oversold level and then back above it.
 * Sell when RSI crosses above the overbought level and then back below it.
 * 
 * Default parameters:
 * - RSI Length: 14 periods
 * - Overbought Level: 70
 * - Oversold Level: 30
 */

export const rsiStrategyTemplate = `
//@version=5
strategy("RSI Strategy", overlay=false)

// Input Parameters
rsiLength = input(14, "RSI Length")
overboughtLevel = input(70, "Overbought Level", minval=50, maxval=100)
oversoldLevel = input(30, "Oversold Level", minval=0, maxval=50)

// Calculate RSI
rsiValue = ta.rsi(close, rsiLength)

// Detect RSI crosses
crossedBelowOversold = ta.crossunder(rsiValue, oversoldLevel)
crossedAboveOversold = ta.crossover(rsiValue, oversoldLevel)
crossedAboveOverbought = ta.crossover(rsiValue, overboughtLevel)
crossedBelowOverbought = ta.crossunder(rsiValue, overboughtLevel)

// State variables to track RSI conditions
var belowOversold = false
var aboveOverbought = false

// Update state based on crosses
if crossedBelowOversold
    belowOversold := true
    
if crossedAboveOverbought
    aboveOverbought := true
    
// Generate buy signal when RSI crosses back above oversold after being below
buySignal = belowOversold and crossedAboveOversold
if buySignal
    belowOversold := false
    
// Generate sell signal when RSI crosses back below overbought after being above
sellSignal = aboveOverbought and crossedBelowOverbought
if sellSignal
    aboveOverbought := false

// Execute Strategy
if (buySignal)
    strategy.entry("Buy", strategy.long)

if (sellSignal)
    strategy.close("Buy")

// Plot RSI and levels
plot(rsiValue, "RSI", color=color.purple)
hline(overboughtLevel, "Overbought Level", color=color.red)
hline(oversoldLevel, "Oversold Level", color=color.green)
hline(50, "Middle Level", color=color.gray, linestyle=hline.style_dotted)

// Plot signals
plotshape(buySignal, "Buy Signal", shape.triangleup, location.bottom, color=color.green, size=size.small)
plotshape(sellSignal, "Sell Signal", shape.triangledown, location.top, color=color.red, size=size.small)
`; 