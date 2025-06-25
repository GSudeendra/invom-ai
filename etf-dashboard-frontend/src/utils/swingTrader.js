/**
 * Swing Trading Utilities for ETF Dashboard
 * Technical indicators, signals, and risk management for ETF trading
 */

// =======================
// TECHNICAL INDICATORS
// =======================

/**
 * Calculate Simple Moving Average (SMA)
 * @param {number[]} prices - Array of prices
 * @param {number} period - Period for SMA calculation
 * @returns {number[]} Array of SMA values
 */
export function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {number[]} prices - Array of prices
 * @param {number} period - Period for EMA calculation
 * @returns {number[]} Array of EMA values
 */
export function calculateEMA(prices, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);
  ema[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {number[]} prices - Array of prices
 * @param {number} period - Period for RSI calculation (default: 14)
 * @returns {number[]} Array of RSI values
 */
export function calculateRSI(prices, period = 14) {
  const gains = [], losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {number[]} prices - Array of prices
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line EMA period (default: 9)
 * @returns {Object} {macd, signal, histogram}
 */
export function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {number[]} prices - Array of prices
 * @param {number} period - Period for calculation (default: 20)
 * @param {number} stdDev - Standard deviation multiplier (default: 2)
 * @returns {Object} {upper, middle, lower}
 */
export function calculateBollingerBands(prices, period = 20, multiplier = 2) {
  const sma = calculateSMA(prices, period);
  const bands = [];
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    bands.push({
      upper: mean + (multiplier * stdDev),
      middle: mean,
      lower: mean - (multiplier * stdDev)
    });
  }
  return bands;
}

/**
 * Calculate Average True Range (ATR)
 * @param {Object[]} ohlcData - Array of OHLC data [{high, low, close}]
 * @param {number} period - Period for ATR calculation (default: 14)
 * @returns {number[]} Array of ATR values
 */
export const calculateATR = (ohlcData, period = 14) => {
  if (ohlcData.length < period + 1) return [];
  
  const trueRanges = [];
  
  for (let i = 1; i < ohlcData.length; i++) {
    const current = ohlcData[i];
    const previous = ohlcData[i - 1];
    
    const tr1 = current.high - current.low;
    const tr2 = Math.abs(current.high - previous.close);
    const tr3 = Math.abs(current.low - previous.close);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  return calculateSMA(trueRanges, period);
};

// =======================
// SIGNAL GENERATION
// =======================

/**
 * Generate signals based on RSI
 * @param {number[]} rsi - Array of RSI values
 * @param {number} oversold - Oversold threshold (default: 30)
 * @param {number} overbought - Overbought threshold (default: 70)
 * @returns {string[]} Array of signals ('BUY', 'SELL', 'HOLD')
 */
export const generateRSISignals = (rsi, oversold = 30, overbought = 70) => {
  return rsi.map(value => {
    if (value < oversold) return 'BUY';
    if (value > overbought) return 'SELL';
    return 'HOLD';
  });
};

/**
 * Generate signals based on MACD crossover
 * @param {Object} macdData - MACD data from calculateMACD
 * @returns {string[]} Array of signals ('BUY', 'SELL', 'HOLD')
 */
export const generateMACDSignals = (macdData) => {
  const { macd, signal } = macdData;
  const signals = ['HOLD']; // First signal is always HOLD
  
  for (let i = 1; i < macd.length; i++) {
    const prevMACD = macd[i - 1];
    const prevSignal = signal[i - 1];
    const currMACD = macd[i];
    const currSignal = signal[i];
    
    // Bullish crossover: MACD crosses above signal line
    if (prevMACD <= prevSignal && currMACD > currSignal) {
      signals.push('BUY');
    }
    // Bearish crossover: MACD crosses below signal line
    else if (prevMACD >= prevSignal && currMACD < currSignal) {
      signals.push('SELL');
    }
    else {
      signals.push('HOLD');
    }
  }
  
  return signals;
};

/**
 * Generate signals based on moving average crossover
 * @param {number[]} prices - Array of prices
 * @param {number} shortPeriod - Short MA period (default: 10)
 * @param {number} longPeriod - Long MA period (default: 20)
 * @returns {string[]} Array of signals ('BUY', 'SELL', 'HOLD')
 */
export const generateMASignals = (prices, shortPeriod = 10, longPeriod = 20) => {
  const shortMA = calculateSMA(prices, shortPeriod);
  const longMA = calculateSMA(prices, longPeriod);
  
  // Align arrays
  const startIndex = longPeriod - shortPeriod;
  const alignedShortMA = shortMA.slice(startIndex);
  
  const signals = ['HOLD']; // First signal is always HOLD
  
  for (let i = 1; i < longMA.length; i++) {
    const prevShort = alignedShortMA[i - 1];
    const prevLong = longMA[i - 1];
    const currShort = alignedShortMA[i];
    const currLong = longMA[i];
    
    // Golden cross: short MA crosses above long MA
    if (prevShort <= prevLong && currShort > currLong) {
      signals.push('BUY');
    }
    // Death cross: short MA crosses below long MA
    else if (prevShort >= prevLong && currShort < currLong) {
      signals.push('SELL');
    }
    else {
      signals.push('HOLD');
    }
  }
  
  return signals;
};

// =======================
// RISK MANAGEMENT
// =======================

/**
 * Calculate position size based on risk percentage
 * @param {number} accountBalance - Total account balance
 * @param {number} riskPercentage - Risk percentage per trade (e.g., 0.02 for 2%)
 * @param {number} entryPrice - Entry price of the position
 * @param {number} stopLoss - Stop loss price
 * @returns {number} Position size (number of shares)
 */
export const calculatePositionSize = (accountBalance, riskPercentage, entryPrice, stopLoss) => {
  const riskAmount = accountBalance * riskPercentage;
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  
  if (riskPerShare === 0) return 0;
  
  return Math.floor(riskAmount / riskPerShare);
};

/**
 * Calculate stop loss and take profit levels
 * @param {number} entryPrice - Entry price
 * @param {number} atrValue - Average True Range value for volatility
 * @param {number} atrMultiplier - ATR multiplier (default: 2)
 * @param {number} riskRewardRatio - Risk/reward ratio (default: 2)
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {Object} {stopLoss, takeProfit}
 */
export const calculateStopLossTakeProfit = (entryPrice, atrValue, atrMultiplier = 2, riskRewardRatio = 2, direction = 'LONG') => {
  const atrDistance = atrValue * atrMultiplier;
  
  if (direction === 'LONG') {
    const stopLoss = entryPrice - atrDistance;
    const takeProfit = entryPrice + (atrDistance * riskRewardRatio);
    return { stopLoss, takeProfit };
  } else {
    const stopLoss = entryPrice + atrDistance;
    const takeProfit = entryPrice - (atrDistance * riskRewardRatio);
    return { stopLoss, takeProfit };
  }
};

// =======================
// TREND ANALYSIS
// =======================

/**
 * Determine market trend based on moving averages
 * @param {number[]} prices - Array of prices
 * @param {number} shortPeriod - Short MA period (default: 10)
 * @param {number} longPeriod - Long MA period (default: 50)
 * @returns {string} 'UPTREND', 'DOWNTREND', or 'SIDEWAYS'
 */
export const determineTrend = (prices, shortPeriod = 10, longPeriod = 50) => {
  const shortMA = calculateSMA(prices, shortPeriod);
  const longMA = calculateSMA(prices, longPeriod);
  
  if (shortMA.length === 0 || longMA.length === 0) return 'SIDEWAYS';
  
  const latestShort = shortMA[shortMA.length - 1];
  const latestLong = longMA[longMA.length - 1];
  
  // Check slope of long MA for trend strength
  const longMASlope = longMA.length > 5 ? 
    (longMA[longMA.length - 1] - longMA[longMA.length - 6]) / 5 : 0;
  
  if (latestShort > latestLong && longMASlope > 0) return 'UPTREND';
  if (latestShort < latestLong && longMASlope < 0) return 'DOWNTREND';
  return 'SIDEWAYS';
};

// =======================
// ETF-SPECIFIC UTILITIES
// =======================

/**
 * Analyze ETF for swing trading opportunities
 * @param {Object} etfData - ETF data object
 * @returns {Object} Analysis results
 */
export const analyzeETFForSwingTrading = (etfData) => {
  const { prices } = etfData;
  
  if (!prices || prices.length < 50) {
    return {
      error: 'Insufficient data for analysis',
      signals: [],
      indicators: {},
      recommendation: 'HOLD'
    };
  }
  
  // Calculate indicators
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const trend = determineTrend(prices);
  
  // Generate signals
  const rsiSignals = generateRSISignals(rsi);
  const macdSignals = generateMACDSignals(macd);
  const maSignals = generateMASignals(prices);
  
  // Get latest values
  const latestRSI = rsi[rsi.length - 1];
  const latestPrice = prices[prices.length - 1];
  const latestRSISignal = rsiSignals[rsiSignals.length - 1];
  const latestMACDSignal = macdSignals[macdSignals.length - 1];
  const latestMASignal = maSignals[maSignals.length - 1];
  
  // Calculate signal strength
  let buySignals = 0;
  let sellSignals = 0;
  
  if (latestRSISignal === 'BUY') buySignals++;
  if (latestRSISignal === 'SELL') sellSignals++;
  if (latestMACDSignal === 'BUY') buySignals++;
  if (latestMACDSignal === 'SELL') sellSignals++;
  if (latestMASignal === 'BUY') buySignals++;
  if (latestMASignal === 'SELL') sellSignals++;
  
  // Determine recommendation
  let recommendation = 'HOLD';
  let confidence = 0;
  
  if (buySignals >= 2) {
    recommendation = 'BUY';
    confidence = (buySignals / 3) * 100;
  } else if (sellSignals >= 2) {
    recommendation = 'SELL';
    confidence = (sellSignals / 3) * 100;
  }
  
  return {
    signals: {
      rsi: latestRSISignal,
      macd: latestMACDSignal,
      ma: latestMASignal
    },
    indicators: {
      rsi: latestRSI,
      price: latestPrice,
      trend,
      sma20: sma20[sma20.length - 1],
      sma50: sma50[sma50.length - 1]
    },
    recommendation,
    confidence: Math.round(confidence),
    buySignals,
    sellSignals,
    analysis: {
      trend,
      volatility: calculateVolatility(prices),
      momentum: calculateMomentum(prices)
    }
  };
};

/**
 * Calculate price volatility
 * @param {number[]} prices - Array of prices
 * @returns {number} Volatility percentage
 */
export const calculateVolatility = (prices) => {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Convert to percentage
};

/**
 * Calculate price momentum
 * @param {number[]} prices - Array of prices
 * @param {number} period - Period for momentum calculation (default: 10)
 * @returns {number} Momentum value
 */
export const calculateMomentum = (prices, period = 10) => {
  if (prices.length < period) return 0;
  
  const currentPrice = prices[prices.length - 1];
  const pastPrice = prices[prices.length - period];
  
  return ((currentPrice - pastPrice) / pastPrice) * 100;
};

// =======================
// UTILITY FUNCTIONS
// =======================

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, decimals = 2) => {
  return parseFloat(price).toFixed(decimals);
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Validate trading signal strength
 * @param {Object} indicators - Object containing various indicator values
 * @returns {Object} Signal strength analysis
 */
export const validateSignalStrength = (indicators) => {
  const { rsi, macd, trend, volume } = indicators;
  let score = 0;
  const signals = [];
  
  // RSI analysis
  if (rsi < 30) {
    score += 1;
    signals.push('RSI oversold - bullish');
  } else if (rsi > 70) {
    score -= 1;
    signals.push('RSI overbought - bearish');
  }
  
  // MACD analysis
  if (macd && macd.histogram > 0) {
    score += 1;
    signals.push('MACD bullish momentum');
  } else if (macd && macd.histogram < 0) {
    score -= 1;
    signals.push('MACD bearish momentum');
  }
  
  // Trend analysis
  if (trend === 'UPTREND') {
    score += 1;
    signals.push('Price in uptrend');
  } else if (trend === 'DOWNTREND') {
    score -= 1;
    signals.push('Price in downtrend');
  }
  
  // Volume confirmation (if provided)
  if (volume && volume > 1.2) { // Above average volume
    score += 0.5;
    signals.push('Strong volume confirmation');
  }
  
  return {
    score,
    strength: Math.abs(score) > 2 ? 'STRONG' : Math.abs(score) > 1 ? 'MODERATE' : 'WEAK',
    direction: score > 0 ? 'BULLISH' : score < 0 ? 'BEARISH' : 'NEUTRAL',
    signals
  };
};

/**
 * Generate comprehensive ETF analysis report
 * @param {Object} etfData - Complete ETF data
 * @returns {Object} Comprehensive analysis report
 */
export const generateETFReport = (etfData) => {
  const analysis = analyzeETFForSwingTrading(etfData);
  
  if (analysis.error) {
    return { error: analysis.error };
  }
  
  const { prices } = etfData;
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];
  const priceChange = calculatePercentageChange(previousPrice, currentPrice);
  
  return {
    summary: {
      symbol: etfData.symbol || 'ETF',
      currentPrice: formatPrice(currentPrice),
      priceChange: formatPrice(priceChange, 2) + '%',
      recommendation: analysis.recommendation,
      confidence: analysis.confidence + '%'
    },
    technical: {
      rsi: formatPrice(analysis.indicators.rsi, 1),
      trend: analysis.indicators.trend,
      volatility: formatPrice(analysis.analysis.volatility, 1) + '%',
      momentum: formatPrice(analysis.analysis.momentum, 1) + '%'
    },
    signals: analysis.signals,
    risk: {
      level: analysis.confidence > 70 ? 'HIGH' : analysis.confidence > 40 ? 'MEDIUM' : 'LOW',
      stopLoss: formatPrice(currentPrice * 0.95, 2), // 5% stop loss
      takeProfit: formatPrice(currentPrice * 1.10, 2) // 10% take profit
    },
    timestamp: new Date().toISOString()
  };
};

// Volume Analysis: returns 'bullish', 'bearish', or 'neutral'
export function analyzeVolume(prices, volume) {
  if (!prices || !volume || prices.length !== volume.length) return 'neutral';
  const priceChange = prices[prices.length - 1] - prices[0];
  const volumeChange = volume[volume.length - 1] - volume[0];
  if (priceChange > 0 && volumeChange > 0) return 'bullish';
  if (priceChange < 0 && volumeChange > 0) return 'bearish';
  return 'neutral';
}

// Support and Resistance Levels
export function findSupportResistance(prices, window = 10) {
  const levels = [];
  for (let i = window; i < prices.length - window; i++) {
    const slice = prices.slice(i - window, i + window + 1);
    const current = prices[i];
    if (current === Math.max(...slice)) {
      levels.push({ price: current, type: 'resistance', index: i });
    }
    if (current === Math.min(...slice)) {
      levels.push({ price: current, type: 'support', index: i });
    }
  }
  return levels;
}

// Swing trading signal engine
export class ETFSwingTrader {
  constructor(prices, volume) {
    this.prices = prices;
    this.volume = volume;
  }

  getSignals() {
    const sma20 = calculateSMA(this.prices, 20);
    const rsi = calculateRSI(this.prices);
    const macd = calculateMACD(this.prices);
    const boll = calculateBollingerBands(this.prices);
    const latestPrice = this.prices[this.prices.length - 1];
    const latestSMA = sma20[sma20.length - 1];
    const latestRSI = rsi;
    const latestMACD = macd.macdLine[macd.macdLine.length - 1];
    const latestSignal = macd.signalLine[macd.signalLine.length - 1];
    let signal = 'HOLD';
    if (latestRSI < 30 && latestPrice > latestSMA && latestMACD > latestSignal) {
      signal = 'BUY';
    } else if (latestRSI > 70 && latestPrice < latestSMA && latestMACD < latestSignal) {
      signal = 'SELL';
    }
    return {
      signal,
      rsi: latestRSI,
      sma: latestSMA,
      macd: latestMACD,
      boll: boll[boll.length - 1]
    };
  }
} 