const ETFSwingTrader = require('../../services/swing-trading/swingTrader');

// Mock data generator for demonstration
const generateMockMarketData = (etf) => {
  const basePrice = parseFloat(etf.nav || etf.ltp || 100);
  const days = 100;
  const prices = [];
  const volumes = [];
  const highs = [];
  const lows = [];
  const dates = [];
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    // Add some realistic price movement with trend
    const trend = Math.sin(i * 0.1) * 0.01; // Cyclical trend
    const dailyChange = (Math.random() - 0.5) * 0.03 + trend; // ±1.5% + trend
    currentPrice *= (1 + dailyChange);
    
    const high = currentPrice * (1 + Math.random() * 0.02);
    const low = currentPrice * (1 - Math.random() * 0.02);
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    prices.push(currentPrice);
    highs.push(high);
    lows.push(low);
    volumes.push(volume);
    dates.push(new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }
  
  return { prices, volumes, highs, lows, dates };
};

const getSwingTradingAnalysis = async (req, res) => {
  try {
    const { etfId, accountBalance = 100000, riskPerTrade = 0.02, maxPositions = 5 } = req.query;
    
    // Initialize swing trader
    const trader = new ETFSwingTrader();
    
    // Get ETF data (you can integrate with your existing ETF data sources)
    const etfData = {
      id: etfId || 'SAMPLE_ETF',
      name: 'Sample ETF',
      symbol: 'SAMPLE',
      nav: 150.50,
      ltp: 152.30,
      change: 1.80,
      changePercent: 1.20
    };
    
    // Generate market data
    const marketData = generateMockMarketData(etfData);
    
    // Generate trading signals
    const signals = trader.generateSignals(marketData);
    
    // Analyze market conditions
    const marketConditions = trader.analyzeMarketConditions(marketData);
    
    // Run backtest
    const backtestResults = trader.backtest(marketData, parseFloat(accountBalance), parseFloat(riskPerTrade));
    
    // Calculate risk metrics
    const riskMetrics = {
      volatility: marketConditions.volatility,
      trend: marketConditions.trend,
      volumeStatus: marketConditions.volumeStatus,
      atr: marketConditions.indicators.atr,
      supportResistance: trader.findSupportResistance(marketData.prices)
    };
    
    // Generate position sizing recommendations
    const latestSignal = signals.length > 0 ? signals[signals.length - 1] : null;
    let positionRecommendation = null;
    
    if (latestSignal && latestSignal.confidence > 0.6) {
      const positionSize = trader.calculatePositionSize(
        parseFloat(accountBalance), 
        parseFloat(riskPerTrade)
      );
      const stopLoss = trader.setStopLoss(latestSignal.price, latestSignal.action === 'buy');
      const takeProfit = trader.setTakeProfit(latestSignal.price, latestSignal.action === 'buy');
      
      positionRecommendation = {
        action: latestSignal.action,
        entryPrice: latestSignal.price,
        positionSize: positionSize,
        shares: Math.floor(positionSize / latestSignal.price),
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        confidence: latestSignal.confidence,
        riskLevel: latestSignal.riskLevel
      };
    }
    
    // Technical indicators summary
    const technicalIndicators = {
      rsi: latestSignal?.indicators.rsi || null,
      sma20: latestSignal?.indicators.sma20 || null,
      sma50: latestSignal?.indicators.sma50 || null,
      macd: latestSignal?.indicators.macd || null,
      bollingerBands: latestSignal?.indicators.bollingerBands || null,
      volume: latestSignal?.indicators.volume || null,
      stochastic: latestSignal?.indicators.stochastic || null
    };
    
    const response = {
      success: true,
      data: {
        etf: etfData,
        signals: signals.slice(-10), // Last 10 signals
        latestSignal: latestSignal,
        marketConditions: marketConditions,
        riskMetrics: riskMetrics,
        positionRecommendation: positionRecommendation,
        technicalIndicators: technicalIndicators,
        backtestResults: {
          totalReturn: backtestResults.totalReturn,
          winRate: backtestResults.winRate,
          totalTrades: backtestResults.totalTrades,
          maxDrawdown: backtestResults.maxDrawdown,
          sharpeRatio: backtestResults.sharpeRatio,
          profitFactor: backtestResults.profitFactor
        },
        marketData: {
          prices: marketData.prices.slice(-30), // Last 30 days
          volumes: marketData.volumes.slice(-30),
          dates: marketData.dates.slice(-30)
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in swing trading analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform swing trading analysis',
      details: error.message
    });
  }
};

// Get portfolio optimization for multiple ETFs
const getPortfolioOptimization = async (req, res) => {
  try {
    const { accountBalance = 100000, maxPositions = 5 } = req.query;
    
    const trader = new ETFSwingTrader();
    
    // Mock ETF list for demonstration
    const etfList = [
      { id: 'ETF1', name: 'Nifty 50 ETF', symbol: 'NIFTY50', nav: 150.50, smartCategory: 'Large Cap' },
      { id: 'ETF2', name: 'Bank Nifty ETF', symbol: 'BANKNIFTY', nav: 320.75, smartCategory: 'Banking' },
      { id: 'ETF3', name: 'Gold ETF', symbol: 'GOLD', nav: 45.20, smartCategory: 'Commodity' },
      { id: 'ETF4', name: 'IT ETF', symbol: 'IT', nav: 280.90, smartCategory: 'Technology' },
      { id: 'ETF5', name: 'Pharma ETF', symbol: 'PHARMA', nav: 95.30, smartCategory: 'Healthcare' }
    ];
    
    // Process each ETF
    const processedETFs = etfList.map(etf => {
      const marketData = generateMockMarketData(etf);
      const signals = trader.generateSignals(marketData);
      const marketConditions = trader.analyzeMarketConditions(marketData);
      
      return {
        ...etf,
        marketData,
        signals,
        marketConditions,
        latestSignal: signals.length > 0 ? signals[signals.length - 1] : null
      };
    });
    
    // Optimize portfolio
    const optimizedPortfolio = trader.optimizePortfolio(
      processedETFs, 
      parseFloat(accountBalance), 
      parseInt(maxPositions)
    );
    
    const response = {
      success: true,
      data: {
        portfolio: optimizedPortfolio,
        etfs: processedETFs.map(etf => ({
          id: etf.id,
          name: etf.name,
          symbol: etf.symbol,
          nav: etf.nav,
          smartCategory: etf.smartCategory,
          latestSignal: etf.latestSignal,
          marketConditions: etf.marketConditions
        }))
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in portfolio optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize portfolio',
      details: error.message
    });
  }
};

// Get technical indicators for a specific ETF
const getTechnicalIndicators = async (req, res) => {
  try {
    const { etfId, period = 20 } = req.params;
    
    const trader = new ETFSwingTrader();
    
    // Mock ETF data
    const etfData = {
      id: etfId,
      name: 'Sample ETF',
      symbol: 'SAMPLE',
      nav: 150.50
    };
    
    const marketData = generateMockMarketData(etfData);
    
    // Calculate all technical indicators
    const indicators = {
      sma: {
        20: trader.calculateSMA(marketData.prices, 20),
        50: trader.calculateSMA(marketData.prices, 50)
      },
      ema: {
        12: trader.calculateEMA(marketData.prices, 12),
        26: trader.calculateEMA(marketData.prices, 26)
      },
      rsi: trader.calculateRSI(marketData.prices),
      macd: trader.calculateMACD(marketData.prices),
      bollingerBands: trader.calculateBollingerBands(marketData.prices),
      atr: trader.calculateATR(marketData.highs, marketData.lows, marketData.prices),
      stochastic: trader.calculateStochastic(marketData.highs, marketData.lows, marketData.prices),
      supportResistance: trader.findSupportResistance(marketData.prices)
    };
    
    const response = {
      success: true,
      data: {
        etf: etfData,
        indicators: indicators,
        marketData: {
          prices: marketData.prices.slice(-50), // Last 50 days
          volumes: marketData.volumes.slice(-50),
          dates: marketData.dates.slice(-50)
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error getting technical indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get technical indicators',
      details: error.message
    });
  }
};

module.exports = {
  getSwingTradingAnalysis,
  getPortfolioOptimization,
  getTechnicalIndicators
}; 