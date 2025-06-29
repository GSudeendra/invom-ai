const mongoose = require('mongoose');

const navDataSchema = new mongoose.Schema({
  date: String,
  nav: String
}, { _id: false });

const historicalNavSchema = new mongoose.Schema({
  schemeId: { type: String, required: true, unique: true },
  meta: { type: Object, required: true },
  data: [navDataSchema],
  status: String,
  fetchedAt: { type: Date, default: Date.now }
}, {
  collection: 'historical_navs',
  timestamps: true
});

module.exports = mongoose.model('HistoricalNav', historicalNavSchema); 