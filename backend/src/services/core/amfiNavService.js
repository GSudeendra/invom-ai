const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { calculateAllIndicators } = require('../core/technicalAnalysisService');

const NAV_DATA_DIR = path.join(__dirname, '..', 'nav_data');
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

const INITIAL_CATEGORIES = {
    "nifty50": {
        "label": "Nifty 50",
        "description": "ETFs tracking the Nifty 50 index",
        "amfiCodes": {},
        "keywords": ["nifty 50", "niftybees", "niftyetf", "nifty bees"]
    },
    "banking": {
        "label": "Banking",
        "description": "ETFs focused on banking sector stocks",
        "amfiCodes": {},
        "keywords": ["bank", "banking", "bankbees", "nifty bank"]
    },
    "psuBanking": {
        "label": "PSU Banking",
        "description": "ETFs focused on public sector banks",
        "amfiCodes": {},
        "keywords": ["psu bank", "psubnkbees"]
    },
    "privateBanking": {
        "label": "Private Banking",
        "description": "ETFs focused on private sector banks",
        "amfiCodes": {},
        "keywords": ["private bank", "pvt bank"]
    },
    "largeCap": {
        "label": "Large Cap",
        "description": "ETFs focused on large cap companies",
        "amfiCodes": {},
        "keywords": ["largecap", "top 100", "nifty 100"]
    },
    "midCap": {
        "label": "Mid Cap",
        "description": "ETFs focused on mid cap companies",
        "amfiCodes": {},
        "keywords": ["midcap", "midcap 150", "juniorbees"]
    },
    "smallCap": {
        "label": "Small Cap",
        "description": "ETFs focused on small cap companies",
        "amfiCodes": {},
        "keywords": ["smallcap", "small cap 250"]
    },
    "it": {
        "label": "Information Technology",
        "description": "ETFs focused on information technology sector",
        "amfiCodes": {},
        "keywords": ["it", "tech", "nifty it", "itbees"]
    },
    "sensex": {
        "label": "Sensex",
        "description": "ETFs tracking the Sensex index",
        "amfiCodes": {},
        "keywords": ["sensex"]
    },
    "gold": {
        "label": "Precious Metals - Gold",
        "description": "ETFs investing in gold",
        "amfiCodes": {},
        "keywords": ["gold", "goldbees"]
    },
    "silver": {
        "label": "Precious Metals - Silver",
        "description": "ETFs investing in silver",
        "amfiCodes": {},
        "keywords": ["silver", "silverbees"]
    },
    "next50": {
        "label": "Next 50",
        "description": "ETFs tracking Next 50 index",
        "amfiCodes": {},
        "keywords": ["nifty next 50", "juniorbees"]
    },
    "liquid": {
        "label": "Liquid",
        "description": "Liquid ETFs for short term investments",
        "amfiCodes": {},
        "keywords": ["liquid", "liquidbees"]
    },
    "international": {
        "label": "International",
        "description": "ETFs with international exposure",
        "amfiCodes": {},
        "keywords": ["nasdaq", "sp 500", "international", "global"]
    },
    "consumption": {
        "label": "Consumption",
        "description": "ETFs focused on consumer goods and services",
        "amfiCodes": {},
        "keywords": ["consumption", "consumer"]
    },
    "healthcare": {
        "label": "Healthcare",
        "description": "ETFs focused on healthcare sector",
        "amfiCodes": {},
        "keywords": ["healthcare", "pharma"]
    },
    "gilt": {
        "label": "Gilt",
        "description": "Government securities ETFs",
        "amfiCodes": {},
        "keywords": ["gsec", "gilt", "government bond"]
    },
    "momentum": {
        "label": "Momentum",
        "description": "Momentum factor based ETFs",
        "amfiCodes": {},
        "keywords": ["momentum"]
    },
    "value": {
        "label": "Value",
        "description": "Value factor based ETFs",
        "amfiCodes": {},
        "keywords": ["value"]
    },
    "quality": {
        "label": "Quality",
        "description": "Quality factor based ETFs",
        "amfiCodes": {},
        "keywords": ["quality"]
    },
    "infrastructure": {
        "label": "Infrastructure",
        "description": "Infrastructure sector ETFs",
        "amfiCodes": {},
        "keywords": ["infra", "infrastructure"]
    },
    "lowVolatility": {
        "label": "Low Volatility",
        "description": "Low volatility ETFs",
        "amfiCodes": {},
        "keywords": ["low vol", "lowvol"]
    },
    "equalWeight": {
        "label": "Equal Weight",
        "description": "Equal weighted index ETFs",
        "amfiCodes": {},
        "keywords": ["equal weight", "equalo"]
    },
    "metals": {
        "label": "Metals",
        "description": "Metal sector ETFs",
        "amfiCodes": {},
        "keywords": ["metal"]
    },
    "misc": {
        "label": "Miscellaneous / Uncategorized",
        "description": "ETFs that didn't fit other categories or are newly discovered and require manual review.",
        "amfiCodes": {},
        "keywords": []
    }
};

function getLatestNavFile() {
  if (!fs.existsSync(NAV_DATA_DIR)) return null;
  const files = fs.readdirSync(NAV_DATA_DIR)
    .filter(f => f.startsWith('etf_navs_categorized_') && f.endsWith('.json'))
    .sort();
  return files.length > 0 ? path.join(NAV_DATA_DIR, files[files.length - 1]) : null;
}

async function fetchAmfiNavTxt() {
  try {
    const response = await axios.get(AMFI_NAV_URL);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch NAVAll.txt from AMFI:', err.message);
    return null;
  }
}

function parseEtfFromRawTxt(rawTxt) {
  try {
    const { parse } = require('csv-parse/sync');
    const lines = rawTxt.trim().split('\n');
    // Step 1: Find the actual header index
    const headerIndex = lines.findIndex(line =>
      line.startsWith('Scheme Code;')
    );
    if (headerIndex === -1) {
      throw new Error('No valid header line found in AMFI response.');
    }
    // Step 2: Slice off only the data after header
    const validData = lines.slice(headerIndex).filter(line => {
      // Filter out empty lines and AMC headings like "Axis Mutual Fund"
      return line.includes(';') && line.split(';').length === 6;
    }).join('\n');
    // Step 3: Parse using csv-parse
    const records = parse(validData, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    // Step 4: Filter only ETFs
    const etfKeywords = ['ETF', 'BEES', 'EXCHANGE TRADED FUND'];
    let etfs = records.filter(record => {
      const name = (record['Scheme Name'] || '').toUpperCase();
      return etfKeywords.some(keyword => name.includes(keyword));
    });
    // Step 5: Filter out ETFs with 'Regular' or 'IDCW' in the name
    etfs = etfs.filter(record => {
      const name = (record['Scheme Name'] || '').toUpperCase();
      return !name.includes('REGULAR') && !name.includes('IDCW');
    });
    return etfs;
  } catch (err) {
    return { error: `Failed to parse AMFI data: ${err.message}` };
  }
}

function extractSymbol(schemeName) {
  // Try to match common ETF symbol patterns
  const upper = (schemeName || '').toUpperCase();
  // 1. Match e.g. NIFTYBEES, GOLDBEES, etc.
  const beesMatch = upper.match(/([A-Z0-9]{3,10}BEES)/);
  if (beesMatch) return beesMatch[1];
  // 2. Match e.g. ICICINIFTY, KOTAKGOLD, etc.
  const etfMatch = upper.match(/([A-Z0-9]{3,10}ETF)/);
  if (etfMatch) return etfMatch[1];
  // 3. Use first word if it's all caps and 3+ chars
  const firstWord = upper.split(' ')[0];
  if (/^[A-Z0-9]{3,10}$/.test(firstWord)) return firstWord;
  // 4. Fallback: take uppercase letters as abbreviation
  const abbr = (upper.match(/[A-Z]/g) || []).join('').slice(0, 8);
  if (abbr.length >= 3) return abbr;
  // 5. Fallback: use AMFI code
  return null;
}

function categorizeEtfs(etfs, categories) {
  // Deep clone categories to avoid mutation
  const result = JSON.parse(JSON.stringify(categories));
  // Clear funds arrays
  Object.values(result).forEach(cat => { cat.funds = []; });
  const usedSymbols = new Set();

  for (const etf of etfs) {
    const name = (etf['Scheme Name'] || etf.schemeName || '').toUpperCase();
    // Filter out ETFs with 'Regular' in the name
    if (name.includes('REGULAR')) continue;
    // Assign symbol
    let symbol = extractSymbol(name);
    if (!symbol && etf['Scheme Code']) symbol = 'ETF' + etf['Scheme Code'];
    // Ensure uniqueness
    let origSymbol = symbol;
    let i = 2;
    while (usedSymbols.has(symbol)) {
      symbol = origSymbol + i;
      i++;
    }
    usedSymbols.add(symbol);
    // Calculate technical indicators
    const currentNav = parseFloat(etf['Net Asset Value'] || etf.latestNav);
    const indicators = calculateAllIndicators(currentNav);
    let matched = false;
    for (const [catKey, cat] of Object.entries(result)) {
      if (cat.keywords && cat.keywords.some(keyword => name.includes(keyword.toUpperCase()))) {
        cat.funds.push({
          symbol,
          schemeName: etf['Scheme Name'] || etf.schemeName,
          amfiCode: etf['Scheme Code'] || etf.amfiCode,
          latestNav: etf['Net Asset Value'] || etf.latestNav,
          navDate: etf['Date'] || etf.navDate,
          // Enhanced fields with technical indicators
          dailyChangePercent: indicators.dailyChangePercent,
          weeklyChangePercent: indicators.weeklyChangePercent,
          rsi: indicators.rsi,
          rsiColor: indicators.rsiColor,
          sma5: indicators.sma5,
          sma20: indicators.sma20,
          smaCrossover: indicators.smaCrossover,
          volatility: indicators.volatility,
          volatilityTag: indicators.volatilityTag,
          historicalPrices: indicators.historicalPrices
        });
        matched = true;
        break;
      }
    }
    if (!matched && result.misc) {
      result.misc.funds.push({
        symbol,
        schemeName: etf['Scheme Name'] || etf.schemeName,
        amfiCode: etf['Scheme Code'] || etf.amfiCode,
        latestNav: etf['Net Asset Value'] || etf.latestNav,
        navDate: etf['Date'] || etf.navDate,
        // Enhanced fields with technical indicators
        dailyChangePercent: indicators.dailyChangePercent,
        weeklyChangePercent: indicators.weeklyChangePercent,
        rsi: indicators.rsi,
        rsiColor: indicators.rsiColor,
        sma5: indicators.sma5,
        sma20: indicators.sma20,
        smaCrossover: indicators.smaCrossover,
        volatility: indicators.volatility,
        volatilityTag: indicators.volatilityTag,
        historicalPrices: indicators.historicalPrices
      });
    }
  }
  // Remove empty categories
  Object.keys(result).forEach(key => {
    if (!result[key].funds.length) delete result[key];
  });
  return result;
}

async function getCategorizedEtfList() {
  let navData;
  const latestNavFile = getLatestNavFile();
  if (latestNavFile && fs.existsSync(latestNavFile)) {
    navData = JSON.parse(fs.readFileSync(latestNavFile, 'utf8'));
    return navData.categories || navData; // support both {categories: ...} and direct
  } else {
    console.log('No local file found, trying to fetch live from AMFI...');
    const rawTxt = await fetchAmfiNavTxt();
    if (!rawTxt) {
      return { error: 'Failed to fetch live NAV data from AMFI.' };
    }
    const etfs = parseEtfFromRawTxt(rawTxt);
    if (etfs.error) {
      console.error('Parsing error:', etfs.error);
      return etfs;
    }
    const categorized = categorizeEtfs(etfs, INITIAL_CATEGORIES);
    return categorized;
  }
}

// Returns a single ETF by schemeCode (amfiCode)
async function getETFBySchemeCode(schemeCode) {
  const latestNavFile = getLatestNavFile();
  if (!latestNavFile || !fs.existsSync(latestNavFile)) return null;
  const navData = JSON.parse(fs.readFileSync(latestNavFile, 'utf8'));
  // Support both {categories: ...} and direct
  const categories = navData.categories || navData;
  for (const cat of Object.values(categories)) {
    if (!cat.funds) continue;
    const found = cat.funds.find(etf => String(etf.amfiCode) === String(schemeCode));
    if (found) return found;
  }
  return null;
}

// Returns a flat array of all ETF objects from the latest categorized file
async function fetchAMFINAV() {
  const latestNavFile = getLatestNavFile();
  if (!latestNavFile || !fs.existsSync(latestNavFile)) return [];
  const navData = JSON.parse(fs.readFileSync(latestNavFile, 'utf8'));
  const categories = navData.categories || navData;
  let allEtfs = [];
  for (const cat of Object.values(categories)) {
    if (cat.funds && Array.isArray(cat.funds)) {
      allEtfs = allEtfs.concat(cat.funds);
    }
  }
  return allEtfs;
}

module.exports = {
  getCategorizedEtfList,
  fetchAmfiNavTxt,
  parseEtfFromRawTxt,
  getETFBySchemeCode,
  fetchAMFINAV
}; 