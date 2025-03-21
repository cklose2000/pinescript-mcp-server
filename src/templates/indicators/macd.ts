/**
 * MACD Indicator Template
 * 
 * The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator
 * that shows the relationship between two moving averages of a security's price.
 * 
 * MACD is calculated by subtracting the 26-period EMA from the 12-period EMA.
 * A 9-period EMA of the MACD, called the "signal line", is then plotted on top of the MACD.
 * 
 * Default parameters:
 * - Fast Length: 12 periods
 * - Slow Length: 26 periods
 * - Signal Length: 9 periods
 * - Source: close price
 */

export const macdTemplate = `
//@version=5
indicator("MACD - Moving Average Convergence/Divergence", shorttitle="MACD")

// Input Parameters
fastLength = input(12, "Fast Length")
slowLength = input(26, "Slow Length")
signalLength = input(9, "Signal Length")
src = input(close, "Source")

// Calculate MACD
fastMA = ta.ema(src, fastLength)
slowMA = ta.ema(src, slowLength)
macd = fastMA - slowMA
signal = ta.ema(macd, signalLength)
histogram = macd - signal

// Plot MACD
plot(macd, "MACD", color=color.blue)
plot(signal, "Signal", color=color.orange)
plot(histogram, "Histogram", color=(histogram >= 0 ? (histogram[1] < histogram ? color.green : color.lime) : (histogram[1] > histogram ? color.red : color.maroon)), style=plot.style_columns)
hline(0, "Zero Line", color=color.gray)

// Calculate Signal Crossings
signalCrossUp = ta.crossover(macd, signal)
signalCrossDown = ta.crossunder(macd, signal)
zeroLineUp = ta.crossover(macd, 0)
zeroLineDown = ta.crossunder(macd, 0)

// Alert Conditions
alertcondition(signalCrossUp, "MACD crossed above Signal", "MACD Line crossed above Signal Line")
alertcondition(signalCrossDown, "MACD crossed below Signal", "MACD Line crossed below Signal Line")
alertcondition(zeroLineUp, "MACD crossed above Zero", "MACD Line crossed above Zero Line")
alertcondition(zeroLineDown, "MACD crossed below Zero", "MACD Line crossed below Zero Line")
`; 