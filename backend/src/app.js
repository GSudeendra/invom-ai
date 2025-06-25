const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Add headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Export a function that takes the app instance
module.exports = function(app) {
  const rateLimiter = require('./middleware/rateLimiting');
  const predictionRoutes = require('./routes/ai-intelligence/predictionRoutes');
  const categoryRoutes = require('./routes/core/categoryRoutes');
  const navDataService = require('./services/core/navDataService');
  const liveDataService = require('./services/core/liveDataService');
  const technicalRoutes = require('./routes/swing-trading/technicalRoutes');
  const validationRoutes = require('./routes/core/validationRoutes');

  // Apply rate limiter to API endpoints
  app.use('/api', rateLimiter);

  // Test route for health check
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working' });
  });

  // Real categories
  app.use('/api/categories', categoryRoutes);

  // ETFs by category
  app.get('/api/etfs/category/:categoryName', async (req, res, next) => {
    try {
      const { categoryName } = req.params;
      const data = await navDataService.getEtfsByCategory(categoryName);
      if (!data) {
        return res.status(404).json({
          success: false,
          error: { message: 'Category not found', code: 'NOT_FOUND', status: 404 }
        });
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  });
  // Real NAV by schemeCode
  app.get('/api/nav/:schemeCode', async (req, res, next) => {
    try {
      const { schemeCode } = req.params;
      const allEtfs = await navDataService.getAllETFs();
      const etf = allEtfs.find(e => String(e.amfiCode) === String(schemeCode));
      if (!etf) return res.status(404).json({ error: { message: 'Scheme code not found', code: 'NOT_FOUND', status: 404 } });
      res.json({ success: true, data: etf });
    } catch (err) { next(err); }
  });
  // AI/ML predictions
  app.use('/api/ai-intelligence/predictions', predictionRoutes);
  // Test route for debugging
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Test route working' });
  });
  // GET /api/etfs - All categorized ETFs
  app.get('/api/etfs', async (req, res, next) => {
    try {
      const etfs = await navDataService.getAllETFs();
      res.json({ success: true, data: etfs, timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
  });
  // GET /api/categories - All available categories
  app.get('/api/categories', async (req, res, next) => {
    try {
      const categories = await navDataService.getAllCategories();
      res.json({ success: true, data: categories, timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
  });
  // POST /api/refresh-nav - Manual NAV data refresh
  app.post('/api/refresh-nav', async (req, res, next) => {
    try {
      const result = await navDataService.fetchAndSaveNavData();
      if (result.error) return res.status(500).json({ success: false, error: result.error });
      res.json({ success: true, file: result.file, timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
  });
  // GET /api/live-data/:symbol - Real-time ETF data from NSE
  app.get('/api/live-data/:symbol', async (req, res, next) => {
    try {
      const { symbol } = req.params;
      const data = await liveDataService.getLiveData(symbol);
      res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.use('/api/swing-trading/technical', technicalRoutes);
  app.use('/api', validationRoutes);
};
