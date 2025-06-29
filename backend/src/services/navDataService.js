const fs = require('fs/promises');
const path = require('path');
const { getCategorizedEtfList } = require('./amfiNavService');
const EtfNavCategorized = require('../models/EtfNavCategorized');
const connectDB = require('../db');
const HighLiquidityEtf = require('../models/HighLiquidityEtf');
const HistoricalNav = require('../models/HistoricalNav');
const axios = require('axios');

const NAV_DATA_DIR = path.join(__dirname, '..', '..', 'nav_data');
let navCache = null;
let navCacheDate = null;

// Ensure nav_data directory exists
async function ensureNavDataDir() {
  await fs.mkdir(NAV_DATA_DIR, { recursive: true });
}

// Get today's NAV file path
function getTodayNavFilePath() {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(NAV_DATA_DIR, `etf_navs_categorized_${today}.json`);
}

// Save categorized ETF NAVs to MongoDB
async function saveCategorizedNavsToMongo(categorized) {
  await connectDB();
  const docs = Object.entries(categorized).map(([categoryKey, cat]) => ({
    categoryKey,
    label: cat.label,
    description: cat.description,
    keywords: cat.keywords,
    funds: cat.funds,
    importedAt: new Date()
  }));
  const categoryKeys = docs.map(doc => doc.categoryKey);
  await EtfNavCategorized.deleteMany({ categoryKey: { $in: categoryKeys } });
  await EtfNavCategorized.insertMany(docs);
}

// Robustly ensure NAV data is up-to-date in memory and on disk, with retries
async function ensureNavData() {
  const today = new Date().toISOString().slice(0, 10);
  if (navCache && navCacheDate === today) return navCache;
  await ensureNavDataDir();
  const navFilePath = getTodayNavFilePath();

  // Try to read the file, or fetch and save if missing/invalid, with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const fileData = await fs.readFile(navFilePath, 'utf8');
      navCache = JSON.parse(fileData).categories;
      navCacheDate = today;
      return navCache;
    } catch (err) {
      console.warn(`[Attempt ${attempt}] NAV file missing or invalid, fetching from AMFI...`);
      try {
        const categorized = await getCategorizedEtfList();
        if (categorized.error) throw new Error(categorized.error);
        await fs.writeFile(navFilePath, JSON.stringify({ categories: categorized }, null, 4));
        navCache = categorized;
        navCacheDate = today;
        // Save to MongoDB only if new data was fetched and written
        await saveCategorizedNavsToMongo(categorized);
        return navCache;
      } catch (fetchErr) {
        console.error(`[Attempt ${attempt}] Failed to fetch/categorize/save NAV data:`, fetchErr.message);
        if (attempt === 3) throw new Error('Failed to fetch and save NAV data after 3 attempts.');
        // Wait 2 seconds before retrying
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }
}

// Get all available categories (key and label)
async function getAllCategories() {
  const navData = await ensureNavData();
  return Object.entries(navData).map(([key, cat]) => ({ key, label: cat.label }));
}

// Get ETFs for a specific category
async function getEtfsByCategory(categoryKey) {
  const navData = await ensureNavData();
  return navData[categoryKey] || null;
}

// Utility: Fetch all unique schemeIds (schemeCodes) from high-liquidity ETFs
async function getAllHighLiquiditySchemeIds() {
  const etfs = await HighLiquidityEtf.find({ schemeCode: { $exists: true, $ne: null } }).lean();
  return etfs.map(e => e.schemeCode).filter(Boolean);
}

// Fetch and save historical NAV data for a single schemeId
async function fetchAndSaveHistoricalNav(schemeId) {
  try {
    const url = `https://api.mfapi.in/mf/${schemeId}`;
    const response = await axios.get(url, { timeout: 15000 });
    if (response.data && response.data.meta && Array.isArray(response.data.data)) {
      await HistoricalNav.findOneAndUpdate(
        { schemeId: String(schemeId) },
        {
          schemeId: String(schemeId),
          meta: response.data.meta,
          data: response.data.data,
          status: response.data.status || 'SUCCESS',
          fetchedAt: new Date()
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
      return { success: true, schemeId };
    } else {
      return { success: false, schemeId, error: 'Invalid response structure' };
    }
  } catch (err) {
    return { success: false, schemeId, error: err.message };
  }
}

module.exports = {
  ensureNavData,
  getAllCategories,
  getEtfsByCategory,
  getAllHighLiquiditySchemeIds,
  fetchAndSaveHistoricalNav
}; 