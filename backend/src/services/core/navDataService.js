const fs = require('fs/promises');
const path = require('path');
const { getCategorizedEtfList } = require('./amfiNavService');

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

// Fetch and save NAV data (for admin/cron/manual trigger)
async function fetchAndSaveNavData() {
  await ensureNavDataDir();
  const navFilePath = getTodayNavFilePath();
  const categorized = await getCategorizedEtfList();
  if (categorized.error) {
    return { error: categorized.error };
  }
  await fs.writeFile(navFilePath, JSON.stringify({ categories: categorized }, null, 4));
  navCache = categorized;
  navCacheDate = new Date().toISOString().slice(0, 10);
  return { file: navFilePath };
}

module.exports = {
  ensureNavData,
  getAllCategories,
  getEtfsByCategory,
  fetchAndSaveNavData
};
