const express = require('express');
const router = express.Router();
const mlPredictionService = require('../../services/ai-intelligence/mlPredictionService');

// GET /api/ai-intelligence/predictions - Get ML predictions for all ETFs
router.get('/', async (req, res) => {
  try {
    const predictions = await mlPredictionService.getAllPredictions();
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 