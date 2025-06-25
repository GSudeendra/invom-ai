const { RSI, SMA } = require('technicalindicators');

class TechnicalAnalysisService {
  constructor() {
    this.historicalData = new Map(); // Cache for historical NAV data
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    try {
      const rsiValues = RSI.calculate({
        values: prices,
        period: period
      });
      
      return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
    } catch (error) {
      console.error('Error calculating RSI:', error);
      return null;
    }
  }

  // Calculate Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    
    try {
      const smaValues = SMA.calculate({
        values: prices,
        period: period
      });
      
      return smaValues.length > 0 ? smaValues[smaValues.length - 1] : null;
    } catch (error) {
      console.error(`Error calculating SMA(${period}):`, error);
      return null;
    }
  }

  // Calculate volatility (standard deviation of returns)
  calculateVolatility(prices, period = 20) {
    if (prices.length < period + 1) return null;
    
    try {
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        const returnValue = (prices[i] - prices[i - 1]) / prices[i - 1];
        returns.push(returnValue);
      }
      
      // Get the last 'period' returns
      const recentReturns = returns.slice(-period);
      
      // Calculate mean
      const mean = recentReturns.reduce((sum, val) => sum + val, 0) / recentReturns.length;
      
      // Calculate variance
      const variance = recentReturns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentReturns.length;
      
      // Calculate standard deviation (volatility)
      const volatility = Math.sqrt(variance);
      
      // Convert to percentage
      return volatility * 100;
    } catch (error) {
      console.error('Error calculating volatility:', error);
      return null;
    }
  }

  // Calculate daily and weekly change percentages
  calculateChangePercentages(prices) {
    if (prices.length < 2) return { dailyChange: null, weeklyChange: null };
    
    try {
      const currentPrice = prices[prices.length - 1];
      const previousDayPrice = prices[prices.length - 2];
      const previousWeekPrice = prices.length >= 6 ? prices[prices.length - 6] : prices[0];
      
      const dailyChange = previousDayPrice ? ((currentPrice - previousDayPrice) / previousDayPrice) * 100 : null;
      const weeklyChange = previousWeekPrice ? ((currentPrice - previousWeekPrice) / previousWeekPrice) * 100 : null;
      
      return {
        dailyChange: dailyChange !== null ? parseFloat(dailyChange.toFixed(2)) : null,
        weeklyChange: weeklyChange !== null ? parseFloat(weeklyChange.toFixed(2)) : null
      };
    } catch (error) {
      console.error('Error calculating change percentages:', error);
      return { dailyChange: null, weeklyChange: null };
    }
  }

  // Check SMA crossover (5-day vs 20-day)
  checkSMACrossover(sma5, sma20) {
    if (sma5 === null || sma20 === null) return null;
    
    // Get previous values for crossover detection
    // For now, we'll use a simple comparison
    // In a real implementation, you'd need historical SMA values
    return sma5 > sma20 ? 'bullish' : 'bearish';
  }

  // Get RSI color based on value
  getRSIColor(rsi) {
    if (rsi === null) return 'gray';
    if (rsi >= 70) return 'red'; // Overbought
    if (rsi <= 30) return 'green'; // Oversold
    return 'yellow'; // Neutral
  }

  // Get volatility tag
  getVolatilityTag(volatility) {
    if (volatility === null) return null;
    if (volatility >= 3) return 'high';
    if (volatility >= 1.5) return 'medium';
    return 'low';
  }

  // Generate mock historical data for demonstration
  // In production, this would come from a database or external API
  generateMockHistoricalData(currentNav, days = 30) {
    const data = [];
    let currentValue = parseFloat(currentNav);
    
    for (let i = days; i >= 0; i--) {
      // Add some random variation
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      currentValue = currentValue * (1 + variation);
      data.push(parseFloat(currentValue.toFixed(4)));
    }
    
    return data;
  }

  // Calculate all technical indicators for an ETF
  calculateAllIndicators(currentNav, historicalPrices = null) {
    // Use mock data if no historical data provided
    const prices = historicalPrices || this.generateMockHistoricalData(currentNav);
    
    const rsi = this.calculateRSI(prices);
    const sma5 = this.calculateSMA(prices, 5);
    const sma20 = this.calculateSMA(prices, 20);
    const volatility = this.calculateVolatility(prices);
    const { dailyChange, weeklyChange } = this.calculateChangePercentages(prices);
    const smaCrossover = this.checkSMACrossover(sma5, sma20);
    
    return {
      rsi: rsi !== null ? parseFloat(rsi.toFixed(2)) : null,
      sma5: sma5 !== null ? parseFloat(sma5.toFixed(4)) : null,
      sma20: sma20 !== null ? parseFloat(sma20.toFixed(4)) : null,
      volatility: volatility !== null ? parseFloat(volatility.toFixed(2)) : null,
      dailyChangePercent: dailyChange,
      weeklyChangePercent: weeklyChange,
      smaCrossover,
      rsiColor: this.getRSIColor(rsi),
      volatilityTag: this.getVolatilityTag(volatility),
      historicalPrices: prices.slice(-20) // Last 20 days for sparkline
    };
  }
}

module.exports = new TechnicalAnalysisService(); 