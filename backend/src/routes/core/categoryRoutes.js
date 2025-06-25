const express = require('express');
const { getAllCategories } = require('../../services/core/navDataService');

const router = express.Router();

router.get('/', async function (req, res) {
  try {
    const includeMisc = req.query.includeMisc === 'true';
    const categories = await getAllCategories({ includeMisc });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get categories', message: err.message });
  }
});

module.exports = router; 