const express = require('express');
const puppeteer = require('puppeteer');
const cacheService = require('../../services/core/cacheService');
const amfiNavService = require('../../services/core/amfiNavService');
const { isValidSchemeCode } = require('../../utils/core/validationUtils');
const liveDataService = require('../../services/core/liveDataService');
const navDataService = require('../../services/core/navDataService');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const router = express.Router();

router.get('/', async function (req, res) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Step 1: Go to NSE homepage to establish session
    await page.goto('https://www.nseindia.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for cookies to be set and simulate user activity
    await sleep(2000);
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.keyboard.press('PageDown');
    await sleep(1000);

    // Step 2: Fetch the ETF API endpoint as JSON using fetch in the browser context
    const apiUrl = 'https://www.nseindia.com/api/etf';
    const data = await page.evaluate(async (apiUrl) => {
      function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
      await sleep(1000);
      const resp = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        credentials: 'same-origin'
      });
      const text = await resp.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { error: 'Not JSON', text };
      }
    }, apiUrl);

    // Detect if we got HTML (CAPTCHA or error page)
    if (data && data.error === 'Not JSON') {
      // Log the raw response for debugging
      console.log('NSE API raw response:', data.text);
      if (typeof data.text === 'string' && (data.text.includes('captcha') || data.text.includes('<!DOCTYPE'))) {
        return res.status(429).json({ error: 'Blocked by NSE anti-bot (CAPTCHA or HTML)', details: data.text.slice(0, 200) });
      }
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data.text.slice(0, 200) });
    }
    if (!data || !data.data) {
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NSE ETF data (Puppeteer)', details: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

router.get('/nav/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    if (!isValidSchemeCode(schemeCode)) {
      return res.status(400).json({ success: false, error: 'Invalid scheme code' });
    }

    const cacheKey = `nav:${schemeCode}`;
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }

    const etfData = await amfiNavService.getETFBySchemeCode(schemeCode);
    if (!etfData) {
      return res.status(404).json({ success: false, error: 'ETF not found' });
    }

    cacheService.set(cacheKey, etfData, 3600); // Cache for 1 hour
    res.json({ success: true, data: etfData });
  } catch (error) {
    console.error('[ERROR] Fetching NAV:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/live-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await liveDataService.fetchLiveETFData(symbol.toUpperCase());
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch live data' });
  }
});

router.get('/etfs', async (req, res) => {
  try {
    const { sortBy = 'schemeName', order = 'asc' } = req.query;
    let etfs = await navDataService.getAllETFs();

    etfs.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      // Numeric sort for nav, changePercent, dailyChangePercent, etc.
      if (["nav", "latestNav", "changePercent", "dailyChangePercent", "weeklyChangePercent"].includes(sortBy)) {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
      } else {
        valueA = (valueA || '').toString().toLowerCase();
        valueB = (valueB || '').toString().toLowerCase();
      }
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    res.json({ success: true, data: etfs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ETFs' });
  }
});

// GET /api/etfs/mf-india - Historical ETF data from AMFI (MF India)
router.get('/mf-india', async (req, res) => {
  try {
    const categories = await amfiNavService.getCategorizedEtfList();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch MF India ETF data', details: error.message });
  }
});

// GET /api/etfs/categories - All ETF categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await navDataService.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get categories', message: err.message });
  }
});

// GET /api/etfs/category/:categoryKey - ETFs by category
router.get('/category/:categoryKey', async (req, res) => {
  const categoryKey = req.params.categoryKey;
  if (!categoryKey) {
    return res.status(400).json({ error: 'Missing categoryKey parameter' });
  }
  try {
    const category = await navDataService.getEtfsByCategory(categoryKey);
    if (!category || category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ETFs for category', message: err.message });
  }
});

// GET /api/nav?schemeId= - NAV by schemeId
router.get('/nav', async (req, res) => {
  const schemeId = req.query.schemeId;
  if (!schemeId) {
    return res.status(400).json({ error: 'Missing schemeId parameter' });
  }
  try {
    const nav = await amfiNavService.getNavBySchemeId(schemeId);
    if (!nav) {
      return res.status(404).json({ error: 'No NAV data found for this schemeId' });
    }
    res.json(nav);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NAV details', message: err.message });
  }
});

// GET /api/etfs/live - Live ETF data from NSE (Puppeteer)
router.get('/live', async (req, res) => {
  // Use the robust Puppeteer logic from old fetchNseEtfs.js
  let browser;
  try {
    browser = await require('puppeteer').launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto('https://www.nseindia.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.keyboard.press('PageDown');
    await new Promise(r => setTimeout(r, 1000));
    const apiUrl = 'https://www.nseindia.com/api/etf';
    const data = await page.evaluate(async (apiUrl) => {
      function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
      await sleep(1000);
      const resp = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json, text/javascript, */*; q=0.01' },
        credentials: 'same-origin'
      });
      const text = await resp.text();
      try { return JSON.parse(text); } catch (e) { return { error: 'Not JSON', text }; }
    }, apiUrl);
    if (data && data.error === 'Not JSON') {
      if (typeof data.text === 'string' && (data.text.includes('captcha') || data.text.includes('<!DOCTYPE'))) {
        return res.status(429).json({ error: 'Blocked by NSE anti-bot (CAPTCHA or HTML)', details: data.text.slice(0, 200) });
      }
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data.text.slice(0, 200) });
    }
    if (!data || !data.data) {
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NSE ETF data (Puppeteer)', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router; 