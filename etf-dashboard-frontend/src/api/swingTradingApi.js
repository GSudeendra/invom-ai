import { handleApiError } from '../utils/networkUtils';

// Swing Trading API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class SwingTradingAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get swing trading analysis for a specific ETF
  async getSwingTradingAnalysis(etfId, accountBalance = 100000, riskPerTrade = 0.02, maxPositions = 5) {
    try {
      const params = new URLSearchParams({
        etfId: etfId || 'SAMPLE_ETF',
        accountBalance: accountBalance.toString(),
        riskPerTrade: riskPerTrade.toString(),
        maxPositions: maxPositions.toString()
      });

      const response = await fetch(`${this.baseURL}/api/swing-trading/analysis?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching swing trading analysis:', error);
      }
      throw new Error(handleApiError(error, 'Fetching swing trading analysis'));
    }
  }

  // Get portfolio optimization recommendations
  async getPortfolioOptimization(accountBalance = 100000, maxPositions = 5) {
    try {
      const params = new URLSearchParams({
        accountBalance: accountBalance.toString(),
        maxPositions: maxPositions.toString()
      });

      const response = await fetch(`${this.baseURL}/api/swing-trading/portfolio-optimization?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error optimizing portfolio:', error);
      }
      throw new Error(handleApiError(error, 'Portfolio optimization'));
    }
  }

  // Get technical indicators for a specific ETF
  async getTechnicalIndicators(etfId, period = 20) {
    try {
      const response = await fetch(`${this.baseURL}/api/swing-trading/indicators/${etfId}?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching technical indicators:', error);
      }
      throw new Error(handleApiError(error, 'Fetching technical indicators'));
    }
  }

  // Get comprehensive swing trading dashboard data
  async getSwingTradingDashboard(accountBalance = 100000, riskPerTrade = 0.02, maxPositions = 5) {
    try {
      // Get portfolio optimization
      const portfolioData = await this.getPortfolioOptimization(accountBalance, maxPositions);
      
      // Get analysis for each ETF in the portfolio
      const etfAnalyses = await Promise.all(
        portfolioData.data.etfs.map(async (etf) => {
          try {
            const analysis = await this.getSwingTradingAnalysis(
              etf.id, 
              accountBalance, 
              riskPerTrade, 
              maxPositions
            );
            return {
              ...etf,
              analysis: analysis.data
            };
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error(`Error analyzing ETF ${etf.id}:`, error);
            }
            return {
              ...etf,
              analysis: null
            };
          }
        })
      );

      return {
        success: true,
        data: {
          portfolio: portfolioData.data.portfolio,
          etfAnalyses: etfAnalyses,
          accountBalance: accountBalance,
          riskPerTrade: riskPerTrade,
          maxPositions: maxPositions
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching swing trading dashboard data:', error);
      }
      throw error;
    }
  }

  // Get real-time market data (mock implementation)
  async getRealTimeMarketData(etfIds) {
    try {
      // This would typically connect to a real-time data provider
      // For now, we'll return mock data
      const mockData = etfIds.map(etfId => ({
        id: etfId,
        price: Math.random() * 100 + 50,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        timestamp: new Date().toISOString()
      }));

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching real-time market data:', error);
      }
      throw error;
    }
  }

  // Get historical price data for backtesting
  async getHistoricalData(etfId, days = 100) {
    try {
      // This would typically fetch from a historical data provider
      // For now, we'll generate mock historical data
      const basePrice = 100;
      const prices = [];
      const volumes = [];
      const highs = [];
      const lows = [];
      const dates = [];
      
      let currentPrice = basePrice;
      
      for (let i = 0; i < days; i++) {
        const dailyChange = (Math.random() - 0.5) * 0.04;
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
      
      return {
        success: true,
        data: {
          etfId,
          prices,
          volumes,
          highs,
          lows,
          dates
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching historical data:', error);
      }
      throw error;
    }
  }

  // Get risk metrics and analysis
  async getRiskMetrics(etfId, accountBalance = 100000) {
    try {
      const analysis = await this.getSwingTradingAnalysis(etfId, accountBalance);
      
      if (!analysis.success || !analysis.data.latestSignal) {
        return {
          success: false,
          error: 'No trading signal available'
        };
      }

      const signal = analysis.data.latestSignal;
      const riskMetrics = analysis.data.riskMetrics;
      
      // Calculate additional risk metrics
      const positionSize = analysis.data.positionRecommendation?.positionSize || 0;
      const maxLoss = positionSize * 0.05; // 5% stop loss
      const riskRewardRatio = 2; // 2:1 risk-reward ratio
      const potentialProfit = maxLoss * riskRewardRatio;
      
      return {
        success: true,
        data: {
          etfId,
          signal: signal,
          riskMetrics: {
            ...riskMetrics,
            positionSize,
            maxLoss,
            potentialProfit,
            riskRewardRatio,
            riskLevel: signal.riskLevel,
            confidence: signal.confidence
          },
          recommendations: {
            action: signal.action,
            entryPrice: signal.price,
            stopLoss: analysis.data.positionRecommendation?.stopLoss,
            takeProfit: analysis.data.positionRecommendation?.takeProfit,
            positionSize: positionSize,
            shares: analysis.data.positionRecommendation?.shares
          }
        }
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  // Get market sentiment analysis
  async getMarketSentiment() {
    try {
      const response = await fetch(`${this.baseURL}/api/swing-trading/sentiment`);
      return response;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching market sentiment:', error);
      }
      throw new Error(handleApiError(error, 'Fetching market sentiment'));
    }
  }
}

// Create and export a singleton instance
const swingTradingAPI = new SwingTradingAPI();
export default swingTradingAPI;

export async function fetchSwingTradingAnalysis() {
  const res = await fetch('/api/swing-trading-analysis');
  if (!res.ok) throw new Error('Failed to fetch swing trading analysis');
  return await res.json();
}

export async function fetchSwingTradingSignals() {
  const res = await fetch('/api/swing-trading-signals');
  if (!res.ok) throw new Error('Failed to fetch swing trading signals');
  return await res.json();
} 