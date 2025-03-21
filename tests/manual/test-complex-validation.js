/**
 * Test script to validate the complex Gold Scalping PineScript strategy
 */

// Import the validator directly
import { validatePineScript } from '../../src/validators/syntaxValidator.js';

// The Gold Scalping strategy with MA Filter
const complexScript = `//@version=5
strategy("Gold Scalping BOS & CHoCH with MA Filter", overlay=true)

// Inputs
useEMA = input(true, title="Use EMA Filter")
fastLength = input(20, title="Fast EMA Length")
slowLength = input(50, title="Slow EMA Length")
atrPeriod = input(14, title="ATR Period")
atrMultiplier = input(1.5, title="ATR Multiplier")
takeProfitMultiplier = input(2, title="Take Profit ATR Multiplier")

// EMA Filter
fastEMA = ta.ema(close, fastLength)
slowEMA = ta.ema(close, slowLength)
uptrend = fastEMA > slowEMA
downtrend = fastEMA < slowEMA

// ATR for stop loss and take profit
atrValue = ta.atr(atrPeriod)
stopDistance = atrValue * atrMultiplier
tpDistance = atrValue * takeProfitMultiplier

// Swing High/Low Detection
swingLength = 5
highestHigh = ta.highest(high, swingLength)
lowestLow = ta.lowest(low, swingLength)

// Detect Break of Structure (BOS)
bosUp = false
bosDown = false
var float prevLow = na
var float prevHigh = na

if low[swingLength] == lowestLow[1] and not na(lowestLow[1])
    prevLow := low[swingLength]
    if close > prevHigh and uptrend
        bosUp := true

if high[swingLength] == highestHigh[1] and not na(highestHigh[1])
    prevHigh := high[swingLength]
    if close < prevLow and downtrend
        bosDown := true

// Detect Change of Character (CHoCH)
var float lastHighPoint = na
var float lastLowPoint = na
chochUp = false
chochDown = false

if bosUp
    lastLowPoint := prevLow
    if not na(lastLowPoint) and close > lastLowPoint
        chochUp := true

if bosDown
    lastHighPoint := prevHigh
    if not na(lastHighPoint) and close < lastHighPoint
        chochDown := true

// Trading Conditions
longCondition = bosUp and chochUp and uptrend
shortCondition = bosDown and chochDown and downtrend

// Strategy Execution
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("TP/SL", "Long", profit = tpDistance, loss = stopDistance)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("TP/SL", "Short", profit = tpDistance, loss = stopDistance)

// Plotting
plot(fastEMA, "Fast EMA", color=color.blue)
plot(slowEMA, "Slow EMA", color=color.red)
plotshape(bosUp and uptrend, "BOS Up", style=shape.triangleup, location=location.belowbar, color=color.green, size=size.small)
plotshape(bosDown and downtrend, "BOS Down", style=shape.triangledown, location=location.abovebar, color=color.red, size=size.small)
plotshape(chochUp and uptrend, "CHoCH Up", style=shape.circle, location=location.belowbar, color=color.green, size=size.small)
plotshape(chochDown and downtrend, "CHoCH Down", style=shape.circle, location=location.abovebar, color=color.red, size=size.small)

// Draw support and resistance levels
plot(prevLow, "Support", color = uptrend ? color.green : color.gray, style = plot.style_circles)
plot(prevHigh, "Resistance", color = downtrend ? color.red : color.gray, style = plot.style_circles)`;

// Create a progress reporting context
const progressContext = {
  reportProgress: (progress) => {
    console.log(`Validation progress: ${progress.progress}/${progress.total}`);
  }
};

// Print script size info
console.log(`Testing complex script (${complexScript.length} characters, ${complexScript.split('\n').length} lines)`);

// Start timer
console.time('Validation time');

// Validate it with our progress context
console.log('\nValidating PineScript...');
try {
  const result = validatePineScript(complexScript, '5', progressContext);
  console.log('Validation result:', JSON.stringify(result, null, 2));
  
  if (result.valid) {
    console.log('\nValidation successful - script is syntactically correct!');
  } else {
    console.log('\nValidation failed with errors:', result.errors);
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
  }
} catch (error) {
  console.error('Validation error:', error);
}

// End timer
console.timeEnd('Validation time'); 