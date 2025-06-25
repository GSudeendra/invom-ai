// mlPredictionService.js - Machine learning predictions stub
const navDataService = require('../core/navDataService');

// TODO: Replace with real ML model predictions
async function getAllPredictions() {
  // Get all ETFs from navDataService
  const etfs = await navDataService.getAllETFs();
  // For each ETF, generate a dummy prediction (replace with real model)
  const predictions = etfs.map(etf => {
    // Example: next day price = last NAV + random noise
    const nav = parseFloat(etf.latestNav || etf.nav || 100);
    const prediction = nav + (Math.random() - 0.5) * 2;
    return {
      schemeCode: etf.schemeCode,
      schemeName: etf.schemeName,
      symbol: etf.symbol,
      nav,
      predictedNav: prediction,
      confidence: 0.7 + Math.random() * 0.2,
      model: 'RandomWalk',
      date: new Date().toISOString().slice(0, 10)
    };
  });
  return predictions;
}

module.exports = { getAllPredictions }; 