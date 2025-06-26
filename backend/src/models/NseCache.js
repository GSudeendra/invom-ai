const mongoose = require('mongoose');

const nseCacheSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  data: {
    type: Object,
    required: true
  }
}, {
  collection: 'nse_cache',
  timestamps: true
});

// Only one document, always replaced
nseCacheSchema.index({}, { unique: false });

module.exports = mongoose.model('NseCache', nseCacheSchema); 