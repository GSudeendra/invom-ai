// ETF Swing Trading System for Backend
class ETFSwingTrader {
  constructor() {
    this.positions = [];
    this.signals = [];
    this.indicators = {};
  }

  // ==========================================
  // TECHNICAL INDICATORS
  // ==========================================

  // Simple Moving Average (SMA)
  calculateSMA(prices, period) {
    if (prices.length < period) return [];
    
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Exponential Moving Average (EMA)
  calculateEMA(prices, period) {
    if (prices.length === 0) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    ema[0] = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    return ema;
  }

  // Relative Strength Index (RSI)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
    
    const rsiValues = [];
    
    for (let i = period; i < gains.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }
    
    return rsiValues;
  }

  // MACD (Moving Average Convergence Divergence)
  calculateMACD(prices) {
    if (prices.length < 26) return null;
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macdLine = [];
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, 9);
    const histogram = [];
    
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push(macdLine[i] - signalLine[i]);
    }
    
    return { macdLine, signalLine, histogram };
  }

  // Bollinger Bands
  calculateBollingerBands(prices, period = 20, multiplier = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    const bands = [];
    
    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = sma[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      bands.push({
        upper: mean + (multiplier * stdDev),
        middle: mean,
        lower: mean - (multiplier * stdDev),
        bandwidth: (multiplier * stdDev * 2) / mean * 100,
        bPercent: ((prices[i + period - 1] - mean) / (multiplier * stdDev)) * 100
      });
    }
    
    return bands;
  }

  // Support and Resistance Levels
  findSupportResistance(prices, window = 10) {
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

  // Average True Range (ATR) for volatility
  calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return null;
    
    const trueRanges = [];
    for (let i = 1; i < highs.length; i++) {
      const highLow = highs[i] - lows[i];
      const highClose = Math.abs(highs[i] - closes[i - 1]);
      const lowClose = Math.abs(lows[i] - closes[i - 1]);
      trueRanges.push(Math.max(highLow, highClose, lowClose));
    }
    
    const atr = [];
    let sum = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);
    
    for (let i = period; i < trueRanges.length; i++) {
      sum = sum - trueRanges[i - period] + trueRanges[i];
      atr.push(sum / period);
    }
    
    return atr;
  }

  // Stochastic Oscillator
  calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
    if (highs.length < kPeriod) return null;
    
    const kValues = [];
    for (let i = kPeriod - 1; i < highs.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      const currentClose = closes[i];
      
      const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }
    
    const dValues = this.calculateSMA(kValues, dPeriod);
    
    return { k: kValues, d: dValues };
  }

  // ==========================================
  // TRADING STRATEGY GENERATION
  // ==========================================

  generateSignals(marketData) {
    const { prices, volume = [], dates = [] } = marketData;
    
    if (!prices || prices.length < 50) {
      console.log('Insufficient data for analysis');
      return [];
    }

    const signals = [];
    
    // Calculate technical indicators
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const rsi = this.calculateRSI(prices, 14);
    const macd = this.calculateMACD(prices);
    const bb = this.calculateBollingerBands(prices, 20, 2);
    const levels = this.findSupportResistance(prices);
    const atr = this.calculateATR(
      marketData.highs || prices,
      marketData.lows || prices,
      prices
    );
    const stoch = this.calculateStochastic(
      marketData.highs || prices,
      marketData.lows || prices,
      prices
    );

    if (prices.length < 50) {
      console.log('Insufficient data for analysis');
      return signals;
    }
    
    // Generate trading signals
    const startIndex = Math.max(50, rsi.length - 1);
    for (let i = startIndex; i < prices.length - 1; i++) {
      const currentPrice = prices[i];
      const nextPrice = prices[i + 1];
      const currentRSI = rsi[i - startIndex] || rsi[rsi.length - 1];
      
      // Add proper bounds checking for volume array
      const currentVolume = volume && i < volume.length ? volume[i] : 100000;
      const avgVolume = volume && volume.length > 20 ? 
        volume.slice(Math.max(0, i - 20), i).reduce((a, b) => a + b, 0) / 20 : 100000;
      
      let signal = {
        date: dates && i < dates.length ? dates[i] : new Date().toISOString().split('T')[0],
        price: currentPrice,
        action: 'hold',
        confidence: 0,
        reasons: [],
        indicators: {},
        riskLevel: 'medium'
      };
      
      let buyScore = 0;
      let sellScore = 0;
      
      // RSI Analysis
      if (currentRSI < 30) {
        buyScore += 2;
        signal.reasons.push('RSI oversold (< 30)');
      } else if (currentRSI > 70) {
        sellScore += 2;
        signal.reasons.push('RSI overbought (> 70)');
      }
      
      signal.indicators.rsi = currentRSI;
      
      // Moving Average Analysis
      if (sma20.length > i - startIndex && sma50.length > i - startIndex) {
        const sma20Current = sma20[i - startIndex];
        const sma50Current = sma50[i - startIndex];
        
        if (currentPrice > sma20Current && sma20Current > sma50Current) {
          buyScore += 1;
          signal.reasons.push('Price above MAs, uptrend');
        } else if (currentPrice < sma20Current && sma20Current < sma50Current) {
          sellScore += 1;
          signal.reasons.push('Price below MAs, downtrend');
        }
        
        signal.indicators.sma20 = sma20Current;
        signal.indicators.sma50 = sma50Current;
      }
      
      // MACD Analysis
      if (macd.histogram.length > i - startIndex) {
        const currentHist = macd.histogram[i - startIndex];
        const prevHist = macd.histogram[i - startIndex - 1] || 0;
        
        if (currentHist > prevHist && currentHist > 0) {
          buyScore += 1;
          signal.reasons.push('MACD bullish momentum');
        } else if (currentHist < prevHist && currentHist < 0) {
          sellScore += 1;
          signal.reasons.push('MACD bearish momentum');
        }
        
        signal.indicators.macd = {
          line: macd.macdLine[i - startIndex],
          signal: macd.signalLine[i - startIndex],
          histogram: currentHist
        };
      }
      
      // Bollinger Bands Analysis
      if (bb.length > i - startIndex) {
        const currentBB = bb[i - startIndex];
        if (currentPrice <= currentBB.lower) {
          buyScore += 1;
          signal.reasons.push('Price at lower Bollinger Band');
        } else if (currentPrice >= currentBB.upper) {
          sellScore += 1;
          signal.reasons.push('Price at upper Bollinger Band');
        }
        
        signal.indicators.bollingerBands = currentBB;
      }
      
      // Volume Analysis
      if (currentVolume > avgVolume * 1.5) {
        if (nextPrice > currentPrice) {
          buyScore += 1;
          signal.reasons.push('High volume with price increase');
        } else if (nextPrice < currentPrice) {
          sellScore += 1;
          signal.reasons.push('High volume with price decrease');
        }
      }
      
      signal.indicators.volume = {
        current: currentVolume,
        average: avgVolume,
        ratio: currentVolume / avgVolume
      };
      
      // Support/Resistance Analysis
      const nearbyLevels = levels.filter(level => 
        Math.abs(level.price - currentPrice) / currentPrice < 0.02
      );
      
      nearbyLevels.forEach(level => {
        if (level.type === 'support' && currentPrice <= level.price * 1.01) {
          buyScore += 1;
          signal.reasons.push('Near support level');
        } else if (level.type === 'resistance' && currentPrice >= level.price * 0.99) {
          sellScore += 1;
          signal.reasons.push('Near resistance level');
        }
      });
      
      signal.indicators.supportResistance = nearbyLevels;
      
      // Stochastic Analysis
      if (stoch && stoch.k.length > i - startIndex) {
        const kValue = stoch.k[i - startIndex];
        const dValue = stoch.d[i - startIndex];
        
        if (kValue < 20 && dValue < 20) {
          buyScore += 1;
          signal.reasons.push('Stochastic oversold');
        } else if (kValue > 80 && dValue > 80) {
          sellScore += 1;
          signal.reasons.push('Stochastic overbought');
        }
        
        signal.indicators.stochastic = { k: kValue, d: dValue };
      }
      
      // ATR Analysis for volatility
      if (atr && atr.length > i - startIndex) {
        const currentATR = atr[i - startIndex];
        const avgATR = atr.slice(Math.max(0, i - 20), i).reduce((a, b) => a + b, 0) / 20;
        
        if (currentATR > avgATR * 1.5) {
          signal.riskLevel = 'high';
          signal.reasons.push('High volatility detected');
        } else if (currentATR < avgATR * 0.5) {
          signal.riskLevel = 'low';
          signal.reasons.push('Low volatility detected');
        }
        
        signal.indicators.atr = { current: currentATR, average: avgATR };
      }
      
      // Determine final signal
      if (buyScore >= 3 && buyScore > sellScore) {
        signal.action = 'buy';
        signal.confidence = Math.min(buyScore / 5, 1);
      } else if (sellScore >= 3 && sellScore > buyScore) {
        signal.action = 'sell';
        signal.confidence = Math.min(sellScore / 5, 1);
      }
      
      if (signal.action !== 'hold') {
        signals.push(signal);
      }
    }
    
    return signals;
  }

  // ==========================================
  // RISK MANAGEMENT
  // ==========================================

  calculatePositionSize(accountBalance, riskPerTrade = 0.02, stopLossPercent = 0.05) {
    const riskAmount = accountBalance * riskPerTrade;
    const positionSize = riskAmount / stopLossPercent;
    return Math.floor(positionSize);
  }

  setStopLoss(entryPrice, isLong = true, stopLossPercent = 0.05) {
    if (isLong) {
      return entryPrice * (1 - stopLossPercent);
    } else {
      return entryPrice * (1 + stopLossPercent);
    }
  }

  setTakeProfit(entryPrice, isLong = true, takeProfitPercent = 0.10) {
    if (isLong) {
      return entryPrice * (1 + takeProfitPercent);
    } else {
      return entryPrice * (1 - takeProfitPercent);
    }
  }

  // ==========================================
  // BACKTESTING
  // ==========================================

  backtest(marketData, initialBalance = 10000, riskPerTrade = 0.02) {
    const signals = this.generateSignals(marketData);
    let balance = initialBalance;
    let position = null;
    const trades = [];
    const equity = [initialBalance];
    
    signals.forEach((signal, index) => {
      if (signal.action === 'buy' && !position && signal.confidence > 0.6) {
        const stopLoss = this.setStopLoss(signal.price, true);
        const takeProfit = this.setTakeProfit(signal.price, true);
        const positionSize = this.calculatePositionSize(balance, riskPerTrade);
        const sharesCount = Math.floor(positionSize / signal.price);
        
        if (sharesCount > 0) {
          position = {
            type: 'long',
            entryPrice: signal.price,
            shares: sharesCount,
            entryDate: signal.date,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            entrySignal: signal
          };
        }
      } else if (signal.action === 'sell' && position && position.type === 'long') {
        const exitValue = position.shares * signal.price;
        const entryValue = position.shares * position.entryPrice;
        const profit = exitValue - entryValue;
        
        balance += profit;
        
        trades.push({
          ...position,
          exitPrice: signal.price,
          exitDate: signal.date,
          exitSignal: signal,
          profit: profit,
          returnPercent: (profit / entryValue) * 100,
          holdingPeriod: this.calculateHoldingPeriod(position.entryDate, signal.date)
        });
        
        position = null;
      }
      
      // Update equity curve
      let currentEquity = balance;
      if (position) {
        const currentPrice = signal.price;
        const positionValue = position.shares * currentPrice;
        const entryValue = position.shares * position.entryPrice;
        currentEquity = balance + (positionValue - entryValue);
      }
      equity.push(currentEquity);
    });
    
    // Calculate performance metrics
    const totalReturn = ((balance - initialBalance) / initialBalance) * 100;
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);
    const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
    
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
      losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length : 0;
    
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    
    // Calculate drawdown
    let maxEquity = initialBalance;
    let maxDrawdown = 0;
    equity.forEach(eq => {
      if (eq > maxEquity) maxEquity = eq;
      const drawdown = (maxEquity - eq) / maxEquity;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return {
      finalBalance: balance,
      totalReturn: totalReturn,
      trades: trades,
      equity: equity,
      winRate: winRate,
      totalTrades: trades.length,
      avgWin: avgWin,
      avgLoss: avgLoss,
      profitFactor: profitFactor,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio: this.calculateSharpeRatio(equity),
      signals: signals
    };
  }

  calculateHoldingPeriod(entryDate, exitDate) {
    const entry = new Date(entryDate);
    const exit = new Date(exitDate);
    const diffTime = Math.abs(exit - entry);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateSharpeRatio(equity, riskFreeRate = 0.02) {
    if (equity.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < equity.length; i++) {
      returns.push((equity[i] - equity[i - 1]) / equity[i - 1]);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    return (avgReturn - riskFreeRate) / stdDev;
  }

  // ==========================================
  // MARKET ANALYSIS
  // ==========================================

  analyzeMarketConditions(marketData) {
    const { prices, volume = [] } = marketData;
    
    // Trend analysis
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];
    
    let trend = 'neutral';
    if (currentPrice > sma20[sma20.length - 1] && sma20[sma20.length - 1] > sma50[sma50.length - 1]) {
      trend = 'bullish';
    } else if (currentPrice < sma20[sma20.length - 1] && sma20[sma20.length - 1] < sma50[sma50.length - 1]) {
      trend = 'bearish';
    }
    
    // Volatility analysis
    const atr = this.calculateATR(prices, prices, prices);
    const currentATR = atr[atr.length - 1];
    const avgATR = atr.slice(-20).reduce((sum, val) => sum + val, 0) / 20;
    
    let volatility = 'normal';
    if (currentATR > avgATR * 1.5) {
      volatility = 'high';
    } else if (currentATR < avgATR * 0.5) {
      volatility = 'low';
    }
    
    // Volume analysis with proper bounds checking
    const currentVolume = volume && volume.length > 0 ? volume[volume.length - 1] : 100000;
    const avgVolume = volume && volume.length > 20 ? 
      volume.slice(-20).reduce((sum, val) => sum + val, 0) / 20 : 100000;
    
    let volumeStatus = 'normal';
    if (currentVolume > avgVolume * 1.5) {
      volumeStatus = 'high';
    } else if (currentVolume < avgVolume * 0.5) {
      volumeStatus = 'low';
    }
    
    return {
      trend,
      volatility,
      volumeStatus,
      indicators: {
        sma20: sma20[sma20.length - 1],
        sma50: sma50[sma50.length - 1],
        atr: currentATR,
        avgATR,
        volume: currentVolume,
        avgVolume
      }
    };
  }

  // ==========================================
  // PORTFOLIO OPTIMIZATION
  // ==========================================

  optimizePortfolio(etfs, accountBalance, maxPositions = 5) {
    // Sort ETFs by signal confidence and market conditions
    const rankedETFs = etfs
      .filter(etf => etf.signals && etf.signals.length > 0)
      .map(etf => {
        const latestSignal = etf.signals[etf.signals.length - 1];
        const marketConditions = this.analyzeMarketConditions(etf.marketData);
        
        let score = latestSignal.confidence;
        
        // Adjust score based on market conditions
        if (marketConditions.trend === 'bullish' && latestSignal.action === 'buy') {
          score += 0.2;
        } else if (marketConditions.trend === 'bearish' && latestSignal.action === 'sell') {
          score += 0.2;
        }
        
        // Adjust for volatility
        if (marketConditions.volatility === 'high') {
          score -= 0.1;
        }
        
        return {
          ...etf,
          score,
          marketConditions,
          latestSignal
        };
      })
      .sort((a, b) => b.score - a.score);
    
    // Select top ETFs
    const selectedETFs = rankedETFs.slice(0, maxPositions);
    
    // Calculate position sizes
    const totalScore = selectedETFs.reduce((sum, etf) => sum + etf.score, 0);
    const positionSizes = selectedETFs.map(etf => ({
      ...etf,
      positionSize: Math.floor((etf.score / totalScore) * accountBalance * 0.8),
      shares: Math.floor((etf.score / totalScore) * accountBalance * 0.8 / etf.latestSignal.price)
    }));
    
    return {
      selectedETFs: positionSizes,
      totalAllocation: positionSizes.reduce((sum, etf) => sum + etf.positionSize, 0),
      cashReserve: accountBalance - positionSizes.reduce((sum, etf) => sum + etf.positionSize, 0)
    };
  }
}

module.exports = ETFSwingTrader; 