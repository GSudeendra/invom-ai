import { ETFCategorizer } from './etfCategorizer';

export class DataTransformer {
  // Transform MF India data
  static transformMFIndiaData(mfData) {
    const etfs = [];
    
    if (!mfData || !mfData.categories) {
      return etfs;
    }
    
    Object.entries(mfData.categories).forEach(([categoryKey, categoryData]) => {
      if (categoryData.funds && Array.isArray(categoryData.funds)) {
        categoryData.funds.forEach(fund => {
          const etf = {
            id: fund.amfiCode || `${categoryKey}_${fund.schemeName}`,
            name: fund.schemeName,
            symbol: fund.symbol || categoryKey.toUpperCase(),
            nav: parseFloat(fund.latestNav) || 0,
            dayChange: parseFloat(fund.dailyChangePercent) || 0,
            weekChange: parseFloat(fund.weeklyChangePercent) || 0,
            rsi: parseFloat(fund.rsi) || null,
            rsiStatus: fund.rsiColor || 'neutral',
            signal: fund.smaCrossover || null,
            volatility: parseFloat(fund.volatility) || null,
            volatilityTag: fund.volatilityTag || null,
            historicalPrices: fund.historicalPrices || [],
            navDate: fund.navDate,
            dataSource: 'mfindia',
            originalCategory: categoryData.label || categoryKey,
            isLive: false,
            fundHouse: fund.fundHouse || null,
            expenseRatio: fund.expenseRatio || null,
            aum: fund.aum || null
          };
          
          // Apply intelligent categorization
          const categorizedETF = ETFCategorizer.categorizeWithConfidence(etf);
          etfs.push(categorizedETF);
        });
      }
    });
    
    return etfs;
  }

  // Transform NSE India data
  static transformNSEData(nseData) {
    const etfs = [];
    
    if (!nseData || !nseData.data || !Array.isArray(nseData.data)) {
      return etfs;
    }
    
    nseData.data.forEach(item => {
      const etf = {
        id: item.symbol,
        name: item.meta?.companyName || item.symbol,
        symbol: item.symbol,
        assets: item.assets,
        nav: parseFloat(item.nav) || 0,
        ltp: parseFloat(item.ltP) || 0,
        dayChange: parseFloat(item.per) || 0,
        open: parseFloat(item.open) || 0,
        high: parseFloat(item.high) || 0,
        low: parseFloat(item.low) || 0,
        volume: parseInt(item.qty) || 0,
        tradedValue: parseFloat(item.trdVal) || 0,
        weekHigh: parseFloat(item.wkhi) || 0,
        weekLow: parseFloat(item.wklo) || 0,
        monthChange: parseFloat(item.mPC) || 0,
        yearChange: parseFloat(item.yPC) || 0,
        prevClose: parseFloat(item.prevClose) || 0,
        dataSource: 'nse',
        isLive: true,
        timestamp: nseData.timestamp,
        isin: item.meta?.isin || null,
        listingDate: item.meta?.listingDate || null,
        isETFSec: item.meta?.isETFSec || false
      };
      
      // Apply intelligent categorization
      const categorizedETF = ETFCategorizer.categorizeWithConfidence(etf);
      etfs.push(categorizedETF);
    });
    
    return etfs;
  }

  // Merge and deduplicate data from both sources
  static mergeDataSources(mfData, nseData) {
    const merged = new Map();
    
    // Add MF India data first
    mfData.forEach(etf => {
      const key = etf.symbol || etf.name;
      merged.set(key, etf);
    });
    
    // Merge NSE data, updating existing entries or adding new ones
    nseData.forEach(etf => {
      const key = etf.symbol || etf.name;
      const existing = merged.get(key);
      
      if (existing) {
        // Merge data from both sources
        merged.set(key, {
          ...existing,
          ...etf,
          // Keep historical data from MF India
          historicalPrices: existing.historicalPrices || [],
          rsi: existing.rsi || null,
          rsiStatus: existing.rsiStatus || 'neutral',
          signal: existing.signal || null,
          volatility: existing.volatility || null,
          volatilityTag: existing.volatilityTag || null,
          // Add live data from NSE
          ltp: etf.ltp,
          volume: etf.volume,
          tradedValue: etf.tradedValue,
          isLive: true,
          // Keep the better categorization
          smartCategory: existing.categoryConfidence > etf.categoryConfidence ? 
            existing.smartCategory : etf.smartCategory,
          categoryConfidence: Math.max(existing.categoryConfidence, etf.categoryConfidence)
        });
      } else {
        merged.set(key, { ...etf, isLive: true });
      }
    });
    
    return Array.from(merged.values());
  }

  // Generate analytics data
  static generateAnalytics(etfs) {
    const analytics = {
      totalETFs: etfs.length,
      liveETFs: etfs.filter(e => e.isLive).length,
      historicalETFs: etfs.filter(e => !e.isLive).length,
      categories: {},
      performance: {
        gainers: etfs.filter(e => e.dayChange > 0).length,
        losers: etfs.filter(e => e.dayChange < 0).length,
        unchanged: etfs.filter(e => e.dayChange === 0).length
      },
      topPerformers: [],
      topLosers: [],
      avgRSI: null,
      avgVolatility: null
    };

    // Calculate category statistics
    const categoryStats = {};
    etfs.forEach(etf => {
      const category = etf.smartCategory;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalReturn: 0,
          avgRSI: 0,
          rsiCount: 0,
          avgVolatility: 0,
          volCount: 0,
          liveCount: 0
        };
      }
      
      categoryStats[category].count++;
      categoryStats[category].totalReturn += etf.dayChange || 0;
      
      if (etf.rsi) {
        categoryStats[category].avgRSI += etf.rsi;
        categoryStats[category].rsiCount++;
      }
      
      if (etf.volatility) {
        categoryStats[category].avgVolatility += etf.volatility;
        categoryStats[category].volCount++;
      }
      
      if (etf.isLive) {
        categoryStats[category].liveCount++;
      }
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avgReturn = stats.count > 0 ? stats.totalReturn / stats.count : 0;
      stats.avgRSI = stats.rsiCount > 0 ? stats.avgRSI / stats.rsiCount : null;
      stats.avgVolatility = stats.volCount > 0 ? stats.avgVolatility / stats.volCount : null;
    });

    analytics.categories = categoryStats;

    // Get top performers and losers
    const sortedByPerformance = [...etfs].sort((a, b) => (b.dayChange || 0) - (a.dayChange || 0));
    analytics.topPerformers = sortedByPerformance.slice(0, 5);
    analytics.topLosers = sortedByPerformance.slice(-5).reverse();

    // Calculate overall averages
    const etfsWithRSI = etfs.filter(e => e.rsi);
    const etfsWithVolatility = etfs.filter(e => e.volatility);
    
    analytics.avgRSI = etfsWithRSI.length > 0 ? 
      etfsWithRSI.reduce((sum, e) => sum + e.rsi, 0) / etfsWithRSI.length : null;
    
    analytics.avgVolatility = etfsWithVolatility.length > 0 ? 
      etfsWithVolatility.reduce((sum, e) => sum + e.volatility, 0) / etfsWithVolatility.length : null;

    return analytics;
  }

  // Filter ETFs based on criteria
  static filterETFs(etfs, filters) {
    let filtered = [...etfs];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(etf => etf.smartCategory === filters.category);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(etf =>
        (etf.name && etf.name.toLowerCase().includes(searchLower)) ||
        (etf.assets && etf.assets.toLowerCase().includes(searchLower)) ||
        (etf.symbol && etf.symbol.toLowerCase().includes(searchLower))
      );
    }

    // Performance filter
    if (filters.performance) {
      switch (filters.performance) {
        case 'gainers':
          filtered = filtered.filter(etf => etf.dayChange > 0);
          break;
        case 'losers':
          filtered = filtered.filter(etf => etf.dayChange < 0);
          break;
        case 'unchanged':
          filtered = filtered.filter(etf => etf.dayChange === 0);
          break;
        default:
          break;
      }
    }

    // Data source filter
    if (filters.dataSource) {
      switch (filters.dataSource) {
        case 'live':
          filtered = filtered.filter(etf => etf.isLive);
          break;
        case 'historical':
          filtered = filtered.filter(etf => !etf.isLive);
          break;
        default:
          break;
      }
    }

    // RSI filter
    if (filters.rsi) {
      switch (filters.rsi) {
        case 'overbought':
          filtered = filtered.filter(etf => etf.rsi && etf.rsi > 70);
          break;
        case 'oversold':
          filtered = filtered.filter(etf => etf.rsi && etf.rsi < 30);
          break;
        case 'neutral':
          filtered = filtered.filter(etf => etf.rsi && etf.rsi >= 30 && etf.rsi <= 70);
          break;
        default:
          break;
      }
    }

    return filtered;
  }

  // Sort ETFs
  static sortETFs(etfs, sortBy, sortOrder = 'desc') {
    const sorted = [...etfs];
    
    sorted.sort((a, b) => {
      let aVal = a[sortBy] || 0;
      let bVal = b[sortBy] || 0;
      
      // Handle string values
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }
}

// Named export for test compatibility
export function transformEtfData(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    if (input.categories) return DataTransformer.transformMFIndiaData(input);
    if (input.data) return DataTransformer.transformNSEData(input);
  }
  return [];
} 