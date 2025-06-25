const mongoose = require('mongoose');

const highLiquidityEtfSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
    unique: true
  },
  etfName: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  indexTracked: {
    type: String,
    required: true
  },
  schemeCode: {
    type: Number,
    required: true,
    unique: true
  },
  schemeName: {
    type: String,
    required: true
  },
  isinGrowth: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  collection: 'high_liquidity_etfs'
});

// Create index for category for better query performance
highLiquidityEtfSchema.index({ category: 1 });

module.exports = mongoose.model('HighLiquidityEtf', highLiquidityEtfSchema); 