const express = require('express');
const router = express.Router();
const dataValidationService = require('../../services/core/dataValidationService');

router.get('/validation-report', async (req, res) => {
  try {
    const results = await dataValidationService.processAndValidate();
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Validation failed' });
  }
});

module.exports = router; 