import { fetchWithRetry, handleApiError } from '../utils/networkUtils';
import { DataTransformer } from '../utils/dataTransformer';

class EnhancedETFAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generic fetch with error handling
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Get cached data or fetch new data
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    
    try {
      const data = await fetchFunction();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data even if expired if fetch fails
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Using expired cache for ${key} due to fetch error:`, error);
        }
        return cached.data;
      }
      throw error;
    }
  }

  // Fetch MF India data
  async fetchMFIndiaData() {
    const cacheKey = 'mf-india-data';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetchWithRetry('/api/etfs/mf-india');
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Fetching MF India data');
      throw new Error(errorMessage);
    }
  }

  // Fetch NSE data
  async fetchNSEData() {
    const cacheKey = 'nse-data';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetchWithRetry('/api/etfs/nse');
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Fetching NSE data');
      throw new Error(errorMessage);
    }
  }

  // Get combined ETF data
  async getCombinedETFData() {
    const cacheKey = 'combined-etf-data';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetchWithRetry('/api/etfs/intelligent');
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error, 'Fetching combined ETF data');
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching combined ETF data:', error);
        }
      }
      throw new Error(errorMessage);
    }
  }

  // Get filtered and sorted ETFs
  async getFilteredETFs(filters = {}, sortBy = 'dayChange', sortOrder = 'desc') {
    const data = await this.getCombinedETFData();
    let filtered = DataTransformer.filterETFs(data.etfs, filters);
    filtered = DataTransformer.sortETFs(filtered, sortBy, sortOrder);
    
    return {
      etfs: filtered,
      total: data.etfs.length,
      filtered: filtered.length,
      analytics: data.analytics
    };
  }

  // Get category statistics
  async getCategoryStats() {
    const data = await this.getCombinedETFData();
    return data.analytics.categories;
  }

  // Get top performers
  async getTopPerformers(limit = 10) {
    const data = await this.getCombinedETFData();
    const sorted = DataTransformer.sortETFs(data.etfs, 'dayChange', 'desc');
    return sorted.slice(0, limit);
  }

  // Get top losers
  async getTopLosers(limit = 10) {
    const data = await this.getCombinedETFData();
    const sorted = DataTransformer.sortETFs(data.etfs, 'dayChange', 'asc');
    return sorted.slice(0, limit);
  }

  // Get ETFs by category
  async getETFsByCategory(category) {
    const data = await this.getCombinedETFData();
    return data.etfs.filter(etf => etf.smartCategory === category);
  }

  // Search ETFs
  async searchETFs(query) {
    const data = await this.getCombinedETFData();
    const searchLower = query.toLowerCase();
    
    return data.etfs.filter(etf =>
      (etf.name && etf.name.toLowerCase().includes(searchLower)) ||
      (etf.assets && etf.assets.toLowerCase().includes(searchLower)) ||
      (etf.symbol && etf.symbol.toLowerCase().includes(searchLower)) ||
      (etf.smartCategory && etf.smartCategory.toLowerCase().includes(searchLower))
    );
  }

  // Get ETF details by ID
  async getETFDetails(id) {
    const data = await this.getCombinedETFData();
    return data.etfs.find(etf => etf.id === id || etf.symbol === id);
  }

  // Get market overview
  async getMarketOverview() {
    const data = await this.getCombinedETFData();
    
    const overview = {
      totalETFs: data.analytics.totalETFs,
      liveETFs: data.analytics.liveETFs,
      historicalETFs: data.analytics.historicalETFs,
      gainers: data.analytics.performance.gainers,
      losers: data.analytics.performance.losers,
      unchanged: data.analytics.performance.unchanged,
      avgRSI: data.analytics.avgRSI,
      avgVolatility: data.analytics.avgVolatility,
      topCategories: Object.entries(data.analytics.categories)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5)
        .map(([category, stats]) => ({
          category,
          count: stats.count,
          avgReturn: stats.avgReturn,
          liveCount: stats.liveCount
        })),
      timestamp: data.timestamp
    };

    return overview;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Set cache timeout
  setCacheTimeout(timeout) {
    this.cacheTimeout = timeout;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCacheByKey(key) {
    this.cache.delete(key);
  }
}

// Create singleton instance
const enhancedETFAPI = new EnhancedETFAPI();

export default enhancedETFAPI;

export async function fetchEnhancedETFs() {
  const res = await fetch('/api/enhanced-etfs');
  if (!res.ok) throw new Error('Failed to fetch enhanced ETFs');
  return await res.json();
}

export async function getCombinedETFData() {
  const res = await fetch('/api/combined-etf-data');
  if (!res.ok) throw new Error('Failed to fetch combined ETF data');
  return await res.json();
} 