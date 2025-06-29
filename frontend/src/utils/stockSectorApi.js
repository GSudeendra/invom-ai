// API utility for stock sector information

const BASE_URL = 'http://localhost:3001';

/**
 * Get sector information for a single stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Sector information
 */
export async function getStockSector(symbol) {
  try {
    const response = await fetch(`${BASE_URL}/api/stock/sector/${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching sector for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get sector information for multiple stock symbols
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<Object>} Object with symbol as key and sector info as value
 */
export async function getMultipleStockSectors(symbols) {
  try {
    const response = await fetch(`${BASE_URL}/api/stock/sectors/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multiple stock sectors:', error);
    throw error;
  }
}

/**
 * Refresh sector information for a stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Updated sector information
 */
export async function refreshStockSector(symbol) {
  try {
    const response = await fetch(`${BASE_URL}/api/stock/sector/${symbol}/refresh`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error refreshing sector for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
export async function getCacheStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/stock/sectors/cache/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    throw error;
  }
}

/**
 * Clear all sector cache
 * @returns {Promise<Object>} Clear operation result
 */
export async function clearSectorCache() {
  try {
    const response = await fetch(`${BASE_URL}/api/stock/sectors/cache/clear`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing sector cache:', error);
    throw error;
  }
}

/**
 * Enhanced stock data with sector information
 * @param {Array} stockData - Array of stock objects
 * @returns {Promise<Array>} Stock data with sector information
 */
export async function enhanceStockDataWithSectors(stockData) {
  try {
    // Extract unique symbols from stock data
    const symbols = [...new Set(stockData.map(stock => stock.name || stock.symbol).filter(Boolean))];
    
    if (symbols.length === 0) {
      return stockData;
    }

    // Get sector information for all symbols
    const sectorResponse = await getMultipleStockSectors(symbols);
    
    if (!sectorResponse.success || !sectorResponse.data) {
      console.warn('Failed to fetch sector data, returning original stock data');
      return stockData;
    }

    // Enhance stock data with sector information
    return stockData.map(stock => {
      const symbol = stock.name || stock.symbol;
      const sectorInfo = sectorResponse.data[symbol];
      
      if (sectorInfo) {
        return {
          ...stock,
          sector: sectorInfo.sector,
          industry: sectorInfo.industry,
          marketCap: sectorInfo.marketCap,
          exchange: sectorInfo.exchange,
          sectorSource: sectorInfo.source,
          sectorLastUpdated: sectorInfo.lastUpdated
        };
      }
      
      return stock;
    });
  } catch (error) {
    console.error('Error enhancing stock data with sectors:', error);
    return stockData;
  }
}

/**
 * Get sector distribution for stock portfolio
 * @param {Array} stockData - Array of stock objects with sector information
 * @returns {Object} Sector distribution data
 */
export function getSectorDistribution(stockData) {
  const sectorMap = {};
  const totalValue = stockData.reduce((sum, stock) => sum + (stock.current || 0), 0);

  stockData.forEach(stock => {
    const sector = stock.sector || 'Unknown';
    const value = stock.current || 0;
    
    if (!sectorMap[sector]) {
      sectorMap[sector] = {
        name: sector,
        value: 0,
        count: 0,
        stocks: []
      };
    }
    
    sectorMap[sector].value += value;
    sectorMap[sector].count += 1;
    sectorMap[sector].stocks.push(stock.name || stock.symbol);
  });

  // Convert to array and add percentages
  return Object.values(sectorMap)
    .map(sector => ({
      ...sector,
      percentage: totalValue > 0 ? ((sector.value / totalValue) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get industry distribution for stock portfolio
 * @param {Array} stockData - Array of stock objects with industry information
 * @returns {Object} Industry distribution data
 */
export function getIndustryDistribution(stockData) {
  const industryMap = {};
  const totalValue = stockData.reduce((sum, stock) => sum + (stock.current || 0), 0);

  stockData.forEach(stock => {
    const industry = stock.industry || 'Unknown';
    const value = stock.current || 0;
    
    if (!industryMap[industry]) {
      industryMap[industry] = {
        name: industry,
        value: 0,
        count: 0,
        stocks: []
      };
    }
    
    industryMap[industry].value += value;
    industryMap[industry].count += 1;
    industryMap[industry].stocks.push(stock.name || stock.symbol);
  });

  // Convert to array and add percentages
  return Object.values(industryMap)
    .map(industry => ({
      ...industry,
      percentage: totalValue > 0 ? ((industry.value / totalValue) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.value - a.value);
} 