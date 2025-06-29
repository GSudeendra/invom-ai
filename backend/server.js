const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const getEtfListHandler = require('./src/api/etf/getEtfList');
const fetchNavsHandler = require('./src/api/etf/fetchNavs');
const getNavBySchemeIdHandler = require('./src/api/etf/getNavBySchemeId');
const getCategoriesHandler = require('./src/api/etf/getCategories');
const getEtfsByCategoryHandler = require('./src/api/etf/getEtfsByCategory');
const fetchNseEtfsHandler = require('./src/api/etf/fetchNseEtfs');
const connectDB = require('./src/db');
const getHighLiquidityEtfsHandler = require('./src/api/etf/getHighLiquidityEtfs');
const { ensureNavData } = require('./src/services/navDataService');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const syncHighLiquidityHistoricalHandler = require('./src/api/etf/syncHighLiquidityHistorical');

// Import stock sector routes
const stockSectorRoutes = require('./src/api/stock/getStockSector');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Add JSON body parser for POST requests

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// Serve invom_ai.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'invom_ai.html'));
});

// Serve a blank favicon to silence 404s
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const NAV_DATA_DIR = path.join(__dirname, 'nav_data');

function getLatestNavFile() {
  if (!fs.existsSync(NAV_DATA_DIR)) return null;
  const files = fs.readdirSync(NAV_DATA_DIR)
    .filter(f => f.startsWith('etf_navs_categorized_') && f.endsWith('.json'))
    .sort();
  return files.length > 0 ? path.join(NAV_DATA_DIR, files[files.length - 1]) : null;
}

// Fetch live NAVAll.txt from AMFI
async function fetchAmfiNavTxt() {
  const url = 'https://www.amfiindia.com/spages/NAVAll.txt';
  try {
    const response = await axios.get(url);
    return response.data; // raw text
  } catch (err) {
    console.error('Failed to fetch NAVAll.txt from AMFI:', err.message);
    return null;
  }
}

// Parse ETF data from raw NAVAll.txt text
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
    const etfs = records.filter(record => {
      const name = (record['Scheme Name'] || '').toUpperCase();
      return etfKeywords.some(keyword => name.includes(keyword));
    });
    return etfs;
  } catch (err) {
    return { error: `Failed to parse AMFI data: ${err.message}` };
  }
}

function categorizeEtfs(etfs, categories) {
  // Deep clone categories to avoid mutation
  const result = JSON.parse(JSON.stringify(categories));
  // Clear funds arrays
  Object.values(result).forEach(cat => { cat.funds = []; });

  for (const etf of etfs) {
    const name = (etf['Scheme Name'] || etf.schemeName || '').toUpperCase();
    let matched = false;
    for (const [catKey, cat] of Object.entries(result)) {
      if (cat.keywords && cat.keywords.some(keyword => name.includes(keyword.toUpperCase()))) {
        cat.funds.push({
          symbol: '', // or infer from name
          schemeName: etf['Scheme Name'] || etf.schemeName,
          amfiCode: etf['Scheme Code'] || etf.amfiCode,
          latestNav: etf['Net Asset Value'] || etf.latestNav,
          navDate: etf['Date'] || etf.navDate
        });
        matched = true;
        break;
      }
    }
    if (!matched && result.misc) {
      result.misc.funds.push({
        symbol: '',
        schemeName: etf['Scheme Name'] || etf.schemeName,
        amfiCode: etf['Scheme Code'] || etf.amfiCode,
        latestNav: etf['Net Asset Value'] || etf.latestNav,
        navDate: etf['Date'] || etf.navDate
      });
    }
  }
  // Remove empty categories
  Object.keys(result).forEach(key => {
    if (!result[key].funds.length) delete result[key];
  });
  return result;
}

app.get('/api/etfs', getEtfListHandler);
app.get('/api/etfs/list', getEtfListHandler);
app.get('/api/etfs/categories', getCategoriesHandler);
app.get('/api/etfs/category/:categoryKey', getEtfsByCategoryHandler);
app.get('/api/nav', getNavBySchemeIdHandler);
app.post('/api/fetch-navs', fetchNavsHandler);
app.get('/api/etfs/live', fetchNseEtfsHandler);
app.get('/api/etfs/high-liquidity', getHighLiquidityEtfsHandler);
app.post('/api/sync/high-liquidity/historical-navs', syncHighLiquidityHistoricalHandler);

// Add stock sector routes
app.use('/api/stock', stockSectorRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// On server startup, ensure today's NAV data is present (fetch/write/save if missing)
(async () => {
  try {
    await ensureNavData();
    console.log('[Startup] ETF NAV data ensured for today.');
  } catch (err) {
    console.error('[Startup] Failed to ensure ETF NAV data:', err);
  }
})();

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

