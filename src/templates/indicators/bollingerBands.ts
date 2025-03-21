/**
 * Bollinger Bands Indicator Template
 * 
 * This indicator plots Bollinger Bands, which are a volatility-based envelope around a moving average.
 * Bollinger Bands consist of:
 * - A middle band (moving average)
 * - An upper band (middle band + standard deviations)
 * - A lower band (middle band - standard deviations)
 * 
 * Default parameters:
 * - Length: 20 periods
 * - Standard Deviation Multiplier: 2
 * - Source: close price
 */

export const bollingerBandsTemplate = `
//@version=5
indicator("Bollinger Bands", overlay=true)

// Input Parameters
length = input(20, "Length")
mult = input.float(2.0, "Std Dev Multiplier", minval=0.1, maxval=5)
src = input(close, "Source")

// Calculate Bollinger Bands
basis = ta.sma(src, length)
stdev = ta.stdev(src, length)
upper = basis + mult * stdev
lower = basis - mult * stdev

// Plot Bands
plot(basis, "Basis", color=color.yellow)
p1 = plot(upper, "Upper", color=color.blue)
p2 = plot(lower, "Lower", color=color.blue)
fill(p1, p2, color=color.new(color.blue, 95))

// Calculate %B
percentB = (src - lower) / (upper - lower)

// Calculate Bandwidth
bandwidth = (upper - lower) / basis * 100

// Alerts
upperCross = ta.crossover(src, upper)
lowerCross = ta.crossunder(src, lower)
middleCrossUp = ta.crossover(src, basis)
middleCrossDown = ta.crossunder(src, basis)

// Alert conditions
alertcondition(upperCross, "Price crossed above upper band", "Price crossed above the upper Bollinger Band")
alertcondition(lowerCross, "Price crossed below lower band", "Price crossed below the lower Bollinger Band")
alertcondition(middleCrossUp, "Price crossed above middle band", "Price crossed above the middle Bollinger Band")
alertcondition(middleCrossDown, "Price crossed below middle band", "Price crossed below the middle Bollinger Band")
`; 