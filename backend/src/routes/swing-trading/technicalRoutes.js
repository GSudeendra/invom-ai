// technicalRoutes.js - Technical analysis endpoints stub
const express = require('express');
const router = express.Router();
const technicalAnalysisService = require('../../services/swing-trading/technicalAnalysisService');
const navDataService = require('../../services/core/navDataService');
const fs = require('fs');
const path = require('path');

// GET /api/swing-trading/technical/:symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    // Find ETF by symbol
    const allEtfs = await navDataService.getAllETFs();
    const etf = allEtfs.find(e => (e.symbol || '').toLowerCase() === symbol.toLowerCase());
    if (!etf) return res.status(404).json({ success: false, error: 'ETF not found' });

    // Load historical NAV data (from file-based storage)
    const navDataDir = path.join(__dirname, '../../data/historical/daily');
    let historicalPrices = [];
    try {
      // Find the latest file for this symbol
      const files = fs.readdirSync(navDataDir).filter(f => f.includes(symbol));
      if (files.length > 0) {
        const file = path.join(navDataDir, files.sort().reverse()[0]);
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        historicalPrices = data.map(row => Number(row.nav)).filter(Boolean);
      }
    } catch {}
    // Fallback: use last 30 NAVs from ETF object if available
    if (!historicalPrices.length && etf.historicalNavs) {
      historicalPrices = etf.historicalNavs.map(n => Number(n)).filter(Boolean);
    }
    // Fallback: use current NAV as single value
    if (!historicalPrices.length && etf.latestNav) {
      historicalPrices = [Number(etf.latestNav)];
    }

    // Calculate all indicators
    const indicators = technicalAnalysisService.calculateAllIndicators(etf.latestNav, historicalPrices);
    res.json({ success: true, data: { symbol, ...indicators }, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 