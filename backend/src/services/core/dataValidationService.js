// dataValidationService.js - Data integrity validation stub
const axios = require('axios');
const amfiNavService = require('./amfiNavService');

// Validate a single ETF's NAV with mfapi.in
const validateWithMfApi = async (schemeCode, amfiData) => {
  try {
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`, { timeout: 5000 });
    const mfApiData = response.data.data && response.data.data[0]; // Latest NAV
    if (!mfApiData) throw new Error('No data from mfapi.in');
    const amfiNav = parseFloat(amfiData.latestNav || amfiData.nav);
    const mfApiNav = parseFloat(mfApiData.nav);
    const isValid = Math.abs(amfiNav - mfApiNav) / amfiNav < 0.001; // 0.1% tolerance
    return {
      isValid,
      amfiNav,
      mfApiNav,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[ERROR] Validating with mfapi.in:', error.message);
    return { isValid: false, error: error.message };
  }
};

// Validate all ETFs in the latest AMFI NAV file
const processAndValidate = async () => {
  const etfs = await amfiNavService.fetchAMFINAV();
  const validationResults = [];
  for (const etf of etfs) {
    const result = await validateWithMfApi(etf.amfiCode || etf.schemeCode, etf);
    validationResults.push({ schemeCode: etf.amfiCode || etf.schemeCode, ...result });
  }
  return validationResults;
};

module.exports = { validateWithMfApi, processAndValidate }; 