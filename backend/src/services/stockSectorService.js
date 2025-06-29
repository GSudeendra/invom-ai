const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

// Stock Sector Cache Model
const stockSectorSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  sector: { type: String, required: true },
  industry: { type: String, default: 'Unknown' },
  marketCap: { type: Number, default: 0 },
  exchange: { type: String, default: 'Unknown' },
  lastUpdated: { type: Date, default: Date.now },
  source: { type: String, default: 'unknown' }
}, {
  collection: 'stock_sectors',
  timestamps: true
});

const StockSector = mongoose.model('StockSector', stockSectorSchema);

// Indian Stock Sector Mappings
const INDIAN_STOCK_SECTORS = {
  // Oil & Gas
  'RELIANCE': { sector: 'Oil & Gas', industry: 'Oil & Gas - Refining & Marketing' },
  'ONGC': { sector: 'Oil & Gas', industry: 'Oil & Gas - Exploration & Production' },
  'IOC': { sector: 'Oil & Gas', industry: 'Oil & Gas - Refining & Marketing' },
  'BPCL': { sector: 'Oil & Gas', industry: 'Oil & Gas - Refining & Marketing' },
  'HPCL': { sector: 'Oil & Gas', industry: 'Oil & Gas - Refining & Marketing' },
  
  // Banking & Financial Services
  'HDFCBANK': { sector: 'Banking', industry: 'Banking - Private Sector' },
  'ICICIBANK': { sector: 'Banking', industry: 'Banking - Private Sector' },
  'SBIN': { sector: 'Banking', industry: 'Banking - Public Sector' },
  'AXISBANK': { sector: 'Banking', industry: 'Banking - Private Sector' },
  'KOTAKBANK': { sector: 'Banking', industry: 'Banking - Private Sector' },
  'JIOFIN': { sector: 'Financial Services', industry: 'Financial Services - NBFC' },
  'PFC': { sector: 'Financial Services', industry: 'Financial Services - NBFC' },
  
  // Information Technology
  'TCS': { sector: 'Information Technology', industry: 'IT Services' },
  'INFY': { sector: 'Information Technology', industry: 'IT Services' },
  'HCLTECH': { sector: 'Information Technology', industry: 'IT Services' },
  'WIPRO': { sector: 'Information Technology', industry: 'IT Services' },
  'TECHM': { sector: 'Information Technology', industry: 'IT Services' },
  'LTTS': { sector: 'Information Technology', industry: 'IT Services' },
  'TATAELXSI': { sector: 'Information Technology', industry: 'IT Services' },
  'NEWGEN': { sector: 'Information Technology', industry: 'IT Services' },
  'RATEGAIN': { sector: 'Information Technology', industry: 'IT Services' },
  'TIMETECHNO': { sector: 'Information Technology', industry: 'IT Services' },
  'AVANTEL': { sector: 'Information Technology', industry: 'IT Services' },
  'EXICOM': { sector: 'Information Technology', industry: 'IT Services' },
  
  // Consumer Goods
  'HINDUNILVR': { sector: 'Consumer Goods', industry: 'FMCG' },
  'ITC': { sector: 'Consumer Goods', industry: 'FMCG' },
  'MARICO': { sector: 'Consumer Goods', industry: 'FMCG' },
  'DABUR': { sector: 'Consumer Goods', industry: 'FMCG' },
  'BRITANNIA': { sector: 'Consumer Goods', industry: 'FMCG' },
  'NESTLEIND': { sector: 'Consumer Goods', industry: 'FMCG' },
  'MARKSANS': { sector: 'Consumer Goods', industry: 'FMCG' },
  
  // Automobiles
  'TATAMOTORS': { sector: 'Automobiles', industry: 'Automobiles - Passenger Cars' },
  'MARUTI': { sector: 'Automobiles', industry: 'Automobiles - Passenger Cars' },
  'M&M': { sector: 'Automobiles', industry: 'Automobiles - Passenger Cars' },
  'BAJAJ-AUTO': { sector: 'Automobiles', industry: 'Automobiles - Two Wheelers' },
  'HEROMOTOCO': { sector: 'Automobiles', industry: 'Automobiles - Two Wheelers' },
  'TITAGARH': { sector: 'Automobiles', industry: 'Automobiles - Auto Components' },
  
  // Pharmaceuticals & Healthcare
  'SUNPHARMA': { sector: 'Healthcare', industry: 'Pharmaceuticals' },
  'DRREDDY': { sector: 'Healthcare', industry: 'Pharmaceuticals' },
  'CIPLA': { sector: 'Healthcare', industry: 'Pharmaceuticals' },
  'DIVISLAB': { sector: 'Healthcare', industry: 'Pharmaceuticals' },
  'APOLLOHOSP': { sector: 'Healthcare', industry: 'Healthcare Services' },
  'MEDIASSIST': { sector: 'Healthcare', industry: 'Healthcare Services' },
  'YATHARTH': { sector: 'Healthcare', industry: 'Healthcare Services' },
  'MOREPENLAB': { sector: 'Healthcare', industry: 'Pharmaceuticals' },
  
  // Metals & Mining
  'TATASTEEL': { sector: 'Metals & Mining', industry: 'Steel' },
  'JSWSTEEL': { sector: 'Metals & Mining', industry: 'Steel' },
  'VEDL': { sector: 'Metals & Mining', industry: 'Non-Ferrous Metals' },
  'HINDALCO': { sector: 'Metals & Mining', industry: 'Non-Ferrous Metals' },
  'JYOTISTRUC': { sector: 'Metals & Mining', industry: 'Steel' },
  
  // Power & Energy
  'NTPC': { sector: 'Power', industry: 'Power Generation' },
  'ADANIPOWER': { sector: 'Power', industry: 'Power Generation' },
  'TATAPOWER': { sector: 'Power', industry: 'Power Generation' },
  'KPIGREEN': { sector: 'Power', industry: 'Power Generation' },
  
  // Real Estate & Construction
  'DLF': { sector: 'Real Estate', industry: 'Real Estate - Residential' },
  'GODREJPROP': { sector: 'Real Estate', industry: 'Real Estate - Residential' },
  'PATELENG': { sector: 'Construction', industry: 'Construction & Engineering' },
  
  // Chemicals
  'DEEPAKNTR': { sector: 'Chemicals', industry: 'Specialty Chemicals' },
  'UPL': { sector: 'Chemicals', industry: 'Agro Chemicals' },
  
  // Telecom
  'BHARTIARTL': { sector: 'Telecommunications', industry: 'Telecom Services' },
  'IDEA': { sector: 'Telecommunications', industry: 'Telecom Services' },
  
  // Transportation & Logistics
  'IRCTC': { sector: 'Transportation', industry: 'Railways' },
  'PNGJL': { sector: 'Transportation', industry: 'Gas Distribution' },
  
  // E-commerce & Internet
  'SWIGGY': { sector: 'Consumer Services', industry: 'E-commerce' },
  
  // Renewable Energy
  'WAAREEENER': { sector: 'Power', industry: 'Renewable Energy' },
  
  // Others
  'SENCO': { sector: 'Consumer Services', industry: 'Jewelry & Watches' },
  'PGEL': { sector: 'Power', industry: 'Power Generation' },
  'GANECOS': { sector: 'Consumer Services', industry: 'Consumer Electronics' },
  'EPACK': { sector: 'Consumer Services', industry: 'Packaging' },
  'SGMART': { sector: 'Consumer Services', industry: 'Retail' }
};

// Helper function to get sector info for unknown Indian stocks
function getIndianStockSectorInfo(symbol) {
  const upperSymbol = symbol.toUpperCase();
  
  // Check exact match first
  if (INDIAN_STOCK_SECTORS[upperSymbol]) {
    return INDIAN_STOCK_SECTORS[upperSymbol];
  }
  
  // Try partial matching for common patterns
  if (upperSymbol.includes('BANK')) {
    return { sector: 'Banking', industry: 'Banking - Private Sector' };
  }
  if (upperSymbol.includes('TECH') || upperSymbol.includes('SOFT')) {
    return { sector: 'Information Technology', industry: 'IT Services' };
  }
  if (upperSymbol.includes('PHARMA') || upperSymbol.includes('LAB')) {
    return { sector: 'Healthcare', industry: 'Pharmaceuticals' };
  }
  if (upperSymbol.includes('STEEL') || upperSymbol.includes('METAL')) {
    return { sector: 'Metals & Mining', industry: 'Steel' };
  }
  if (upperSymbol.includes('POWER') || upperSymbol.includes('ENERGY')) {
    return { sector: 'Power', industry: 'Power Generation' };
  }
  if (upperSymbol.includes('AUTO') || upperSymbol.includes('MOTOR')) {
    return { sector: 'Automobiles', industry: 'Automobiles - Passenger Cars' };
  }
  if (upperSymbol.includes('CONS') || upperSymbol.includes('FMCG')) {
    return { sector: 'Consumer Goods', industry: 'FMCG' };
  }
  if (upperSymbol.includes('FIN') || upperSymbol.includes('CAP')) {
    return { sector: 'Financial Services', industry: 'Financial Services - NBFC' };
  }
  
  return null;
}

class StockSectorService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
  }

  /**
   * Get sector information for a stock symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock sector information
   */
  async getStockSector(symbol) {
    if (!symbol) return null;

    const upperSymbol = symbol.toUpperCase();

    // Check memory cache first
    const cached = this.cache.get(upperSymbol);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    // Check database cache
    const dbCached = await this.getFromDatabase(upperSymbol);
    if (dbCached) {
      this.cache.set(upperSymbol, {
        data: dbCached,
        timestamp: Date.now()
      });
      return dbCached;
    }

    // Check Indian stock mappings first
    const indianMapping = getIndianStockSectorInfo(upperSymbol);
    if (indianMapping) {
      const indianData = {
        symbol: upperSymbol,
        sector: indianMapping.sector,
        industry: indianMapping.industry,
        marketCap: 0,
        exchange: 'NSE',
        lastUpdated: new Date(),
        source: 'indian_mapping'
      };
      
      // Save to database
      await this.saveToDatabase(indianData);
      
      // Update memory cache
      this.cache.set(upperSymbol, {
        data: indianData,
        timestamp: Date.now()
      });
      
      return indianData;
    }

    // Try web scraping for other stocks
    const scrapedData = await this.scrapeStockSector(upperSymbol);
    if (scrapedData) {
      // Save to database
      await this.saveToDatabase(scrapedData);
      
      // Update memory cache
      this.cache.set(upperSymbol, {
        data: scrapedData,
        timestamp: Date.now()
      });
      
      return scrapedData;
    }

    return null;
  }

  /**
   * Web scraping from Yahoo Finance
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock information
   */
  async scrapeStockSector(symbol) {
    try {
      // Try Yahoo Finance first
      const yahooData = await this.scrapeYahooFinance(symbol);
      if (yahooData) return yahooData;

      // Fallback to other sources
      const alternativeData = await this.scrapeAlternativeSources(symbol);
      if (alternativeData) return alternativeData;

      return null;
    } catch (error) {
      console.error(`Web scraping error for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape from Yahoo Finance
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock information
   */
  async scrapeYahooFinance(symbol) {
    try {
      const url = `https://finance.yahoo.com/quote/${symbol}/profile`;
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Try multiple selectors for sector information
      let sector = null;
      let industry = null;
      let marketCap = null;

      // Method 1: Look for sector in profile section
      const sectorElement = $('span:contains("Sector(s)"), span:contains("Sector"), td:contains("Sector")').first();
      if (sectorElement.length > 0) {
        const sectorText = sectorElement.next().text().trim() || 
                          sectorElement.parent().find('td').last().text().trim();
        if (sectorText && sectorText !== 'Sector(s)' && sectorText !== 'Sector') {
          sector = sectorText;
        }
      }

      // Method 2: Look for industry information
      const industryElement = $('span:contains("Industry"), td:contains("Industry")').first();
      if (industryElement.length > 0) {
        const industryText = industryElement.next().text().trim() || 
                            industryElement.parent().find('td').last().text().trim();
        if (industryText && industryText !== 'Industry') {
          industry = industryText;
        }
      }

      // Method 3: Look for market cap
      const marketCapElement = $('span:contains("Market Cap"), td:contains("Market Cap")').first();
      if (marketCapElement.length > 0) {
        const marketCapText = marketCapElement.next().text().trim() || 
                             marketCapElement.parent().find('td').last().text().trim();
        if (marketCapText && marketCapText !== 'Market Cap') {
          marketCap = this.parseMarketCap(marketCapText);
        }
      }

      // Method 4: Try to find sector in any data attribute or script
      if (!sector) {
        const scripts = $('script');
        for (let i = 0; i < scripts.length; i++) {
          const scriptContent = $(scripts[i]).html();
          if (scriptContent && scriptContent.includes('sector')) {
            const sectorMatch = scriptContent.match(/"sector"\s*:\s*"([^"]+)"/i);
            if (sectorMatch) {
              sector = sectorMatch[1];
              break;
            }
          }
        }
      }

      if (sector) {
        return {
          symbol: symbol,
          sector: sector,
          industry: industry || 'Unknown',
          marketCap: marketCap || 0,
          exchange: 'Unknown',
          lastUpdated: new Date(),
          source: 'yahoo'
        };
      }

      return null;
    } catch (error) {
      console.error(`Yahoo Finance scraping error for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape from alternative sources
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock information
   */
  async scrapeAlternativeSources(symbol) {
    try {
      // Try Alpha Vantage API (if you have an API key)
      const alphaVantageData = await this.scrapeAlphaVantage(symbol);
      if (alphaVantageData) return alphaVantageData;

      // Try MarketWatch
      const marketWatchData = await this.scrapeMarketWatch(symbol);
      if (marketWatchData) return marketWatchData;

      return null;
    } catch (error) {
      console.error(`Alternative sources scraping error for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape from Alpha Vantage (requires API key)
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock information
   */
  async scrapeAlphaVantage(symbol) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) return null;

      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.data && response.data.Sector) {
        return {
          symbol: symbol,
          sector: response.data.Sector,
          industry: response.data.Industry || 'Unknown',
          marketCap: parseFloat(response.data.MarketCapitalization) || 0,
          exchange: response.data.Exchange || 'Unknown',
          lastUpdated: new Date(),
          source: 'alphavantage'
        };
      }

      return null;
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Scrape from MarketWatch
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Stock information
   */
  async scrapeMarketWatch(symbol) {
    try {
      const url = `https://www.marketwatch.com/investing/stock/${symbol.toLowerCase()}`;
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Look for sector information in MarketWatch
      let sector = null;
      const sectorElement = $('span:contains("Sector"), td:contains("Sector")').first();
      if (sectorElement.length > 0) {
        const sectorText = sectorElement.next().text().trim() || 
                          sectorElement.parent().find('td').last().text().trim();
        if (sectorText && sectorText !== 'Sector') {
          sector = sectorText;
        }
      }

      if (sector) {
        return {
          symbol: symbol,
          sector: sector,
          industry: 'Unknown',
          marketCap: 0,
          exchange: 'Unknown',
          lastUpdated: new Date(),
          source: 'marketwatch'
        };
      }

      return null;
    } catch (error) {
      console.error(`MarketWatch error for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Parse market cap string to number
   * @param {string} marketCapStr - Market cap string (e.g., "1.5B", "500M")
   * @returns {number} Market cap in millions
   */
  parseMarketCap(marketCapStr) {
    if (!marketCapStr) return 0;
    
    const cleanStr = marketCapStr.replace(/[^\d.]/g, '');
    const multiplier = marketCapStr.includes('B') ? 1000 : 
                      marketCapStr.includes('M') ? 1 : 
                      marketCapStr.includes('K') ? 0.001 : 1;
    
    return parseFloat(cleanStr) * multiplier;
  }

  /**
   * Get sector information from database cache
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object|null>} Cached stock information
   */
  async getFromDatabase(symbol) {
    try {
      const cached = await StockSector.findOne({ symbol: symbol.toUpperCase() });
      if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
        return {
          symbol: cached.symbol,
          sector: cached.sector,
          industry: cached.industry,
          marketCap: cached.marketCap,
          exchange: cached.exchange,
          lastUpdated: cached.lastUpdated,
          source: cached.source
        };
      }
      return null;
    } catch (error) {
      console.error('Database cache error:', error.message);
      return null;
    }
  }

  /**
   * Save sector information to database
   * @param {Object} stockData - Stock information
   * @returns {Promise<void>}
   */
  async saveToDatabase(stockData) {
    try {
      await StockSector.findOneAndUpdate(
        { symbol: stockData.symbol },
        {
          symbol: stockData.symbol,
          sector: stockData.sector,
          industry: stockData.industry,
          marketCap: stockData.marketCap,
          exchange: stockData.exchange,
          lastUpdated: stockData.lastUpdated,
          source: stockData.source
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Database save error:', error.message);
    }
  }

  /**
   * Get sectors for multiple stocks
   * @param {string[]} symbols - Array of stock symbols
   * @returns {Promise<Object>} Object with symbol as key and sector info as value
   */
  async getMultipleStockSectors(symbols) {
    const results = {};
    const promises = symbols.map(async (symbol) => {
      const sectorInfo = await this.getStockSector(symbol);
      if (sectorInfo) {
        results[symbol.toUpperCase()] = sectorInfo;
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Clear cache for a specific symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise<void>}
   */
  async clearCache(symbol) {
    const upperSymbol = symbol.toUpperCase();
    this.cache.delete(upperSymbol);
    
    try {
      await StockSector.deleteOne({ symbol: upperSymbol });
    } catch (error) {
      console.error('Cache clear error:', error.message);
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      const totalCached = await StockSector.countDocuments();
      const memoryCacheSize = this.cache.size;
      
      return {
        memoryCacheSize,
        databaseCacheSize: totalCached,
        cacheTimeout: this.cacheTimeout
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return { error: error.message };
    }
  }
}

// Create singleton instance
const stockSectorService = new StockSectorService();

module.exports = {
  StockSector,
  StockSectorService,
  stockSectorService
}; 