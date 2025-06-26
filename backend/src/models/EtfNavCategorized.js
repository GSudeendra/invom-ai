const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  symbol: String,
  schemeName: String,
  amfiCode: String,
  latestNav: String,
  navDate: String
}, { _id: false });

const etfNavCategorizedSchema = new mongoose.Schema({
  categoryKey: { type: String, required: true },
  label: String,
  description: String,
  keywords: [String],
  funds: [fundSchema],
  importedAt: { type: Date, default: Date.now }
}, {
  collection: 'etf_navs_categorized',
  timestamps: true
});

module.exports = mongoose.model('EtfNavCategorized', etfNavCategorizedSchema); 