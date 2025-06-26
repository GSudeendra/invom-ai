const axios = require('axios');

/**
 * @swagger
 * /api/etfs/nav/{schemeId}:
 *   get:
 *     summary: Get NAV by scheme ID
 *     description: Returns the latest NAV for a given scheme ID (AMFI code).
 *     parameters:
 *       - in: path
 *         name: schemeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The AMFI scheme code
 *     responses:
 *       200:
 *         description: Latest NAV for the scheme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schemeName:
 *                   type: string
 *                 amfiCode:
 *                   type: string
 *                 date:
 *                   type: string
 *                 nav:
 *                   type: string
 */

module.exports = async function (req, res) {
  const schemeId = req.query.schemeId || req.params.schemeId;
  if (!schemeId) {
    return res.status(400).json({ error: 'Missing schemeId parameter' });
  }
  const url = `https://api.mfapi.in/mf/${schemeId}`;
  try {
    const response = await axios.get(url);
    if (response.data && response.data.meta && response.data.data) {
      const latestNavEntry = response.data.data[0];
      return res.json({
        schemeName: response.data.meta.scheme_name,
        amfiCode: schemeId,
        date: latestNavEntry.date,
        nav: latestNavEntry.nav
      });
    } else {
      return res.status(404).json({ error: 'No NAV data found for this schemeId' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch NAV details', message: err.message });
  }
}; 