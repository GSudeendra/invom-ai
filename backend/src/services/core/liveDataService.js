// liveDataService.js - NSE live data scraping stub
const puppeteer = require('puppeteer');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const liveCache = new Map();
const { NSELive } = require('nse-api-package');
const nseLive = new NSELive();
const cacheService = require('./cacheService');

async function getLiveData(symbol) {
  const now = Date.now();
  if (liveCache.has(symbol)) {
    const { data, timestamp } = liveCache.get(symbol);
    if (now - timestamp < CACHE_TTL) return data;
  }
  // Scrape NSE for live ETF data
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    const url = `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // Replace page.waitForTimeout with setTimeout for compatibility
    await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000)); // Random delay
    // Extract data from page
    const data = await page.evaluate(() => {
      // NSE page structure may change; selectors may need updates
      const ltp = document.querySelector('.security-ltp')?.textContent?.replace(/[^\d.\-]/g, '');
      const change = document.querySelector('.security-net-change')?.textContent?.replace(/[^\d.\-]/g, '');
      const changePercent = document.querySelector('.security-percent-change')?.textContent?.replace(/[^\d.\-]/g, '');
      const volume = document.querySelector('.volume-value')?.textContent?.replace(/[^\d,]/g, '');
      const high = document.querySelector('.day-high')?.textContent?.replace(/[^\d.\-]/g, '');
      const low = document.querySelector('.day-low')?.textContent?.replace(/[^\d.\-]/g, '');
      const prevClose = document.querySelector('.prev-close')?.textContent?.replace(/[^\d.\-]/g, '');
      return {
        ltp,
        change,
        changePercent,
        volume,
        high,
        low,
        prevClose
      };
    });
    await browser.close();
    const result = {
      symbol,
      ...data
    };
    liveCache.set(symbol, { data: result, timestamp: now });
    return result;
  } catch (err) {
    if (browser) await browser.close();
    throw new Error('Failed to fetch live data from NSE: ' + err.message);
  }
}

const fetchLiveETFData = async (symbol) => {
  try {
    const cacheKey = `live-data:${symbol}`;
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Try nse-api-package first
    try {
      const etfData = await nseLive.stockQuote(symbol.toUpperCase());
      if (etfData && etfData.data) {
        const formattedData = {
          symbol: etfData.data.symbol,
          lastPrice: etfData.data.lastPrice,
          change: etfData.data.change,
          changePercent: etfData.data.pChange,
          volume: etfData.data.quantityTraded,
          tradedValue: etfData.data.totalTradedValue,
          open: etfData.data.dayHigh,
          high: etfData.data.dayHigh,
          low: etfData.data.dayLow,
          previousClose: etfData.data.previousClose,
          nav: etfData.data.nav || null,
          timestamp: etfData.data.lastUpdateTime || new Date().toISOString(),
        };
        cacheService.set(cacheKey, formattedData, 300); // Cache for 5 minutes
        return formattedData;
      }
    } catch (err) {
      console.error('[ERROR] nse-api-package failed:', err.message);
    }

    // Fallback to Puppeteer scraping
    try {
      const puppeteerData = await getLiveData(symbol);
      cacheService.set(cacheKey, puppeteerData, 300);
      return puppeteerData;
    } catch (err) {
      console.error('[ERROR] Puppeteer fallback failed:', err.message);
    }

    // If both fail, throw a user-friendly error
    throw new Error('Unable to fetch live ETF data from NSE (all methods failed)');
  } catch (error) {
    console.error('[ERROR] Fetching NSE live data:', error.message);
    throw error;
  }
};

module.exports = { getLiveData, fetchLiveETFData }; 